/*
 * flashsim.c - Guc kesintisi enjeksiyonu ile gomulu flash kalici depolama modeli.
 *
 * Modellenen donanim: MCU-ici NOR flash, 64-bit programlama birimi (double word),
 * SEC-DED ECC (dogru okunamayan DW -> NMI), sayfa granulariteli silme.
 *
 * Derleme: cc -O2 -Wall -Wextra -std=c11 -o flashsim flashsim.c
 */
#include <stdio.h>
#include <stdint.h>
#include <string.h>
#include <setjmp.h>
#include <stdlib.h>

#ifndef PAGE_SIZE
#define PAGE_SIZE   128u
#endif
#define DW_SIZE     8u
#define DWPP        (PAGE_SIZE / DW_SIZE) /* sayfa basina double word */
#define NPAGES      2u
#define ERASED_DW   0xFFFFFFFFFFFFFFFFull

/* ------------------------------------------------------------------ */
/* Flash modeli                                                        */
/* ------------------------------------------------------------------ */
typedef struct {
    uint64_t dw[NPAGES][DWPP];
    uint8_t  ecc_bad[NPAGES][DWPP];   /* 1 = cift-bit ECC hatasi (okumada NMI) */
} flash_t;

static flash_t   FL;
static jmp_buf   power_jmp;     /* guc kesintisi */
static jmp_buf   nmi_jmp;       /* ECC NMI       */
static jmp_buf   crash_jmp;     /* yakalanmamis NMI = cokme */
static int       nmi_armed;     /* NMI yakalayici kurulu mu */
static int       nmi_hits;

static long      op_index;      /* kacinci flash islemindeyiz */
static long      cut_at;        /* bu islemde kesilecek (-1 = kesme yok) */
static int       cut_variant;   /* yarim kalan islemin sonucu: 0/1/2 */
static int       prog_errors;

#define POWERCUT_TAG 1
#define NMI_TAG      2
#define CRASH_TAG    3

static void power_cut(void) { longjmp(power_jmp, POWERCUT_TAG); }

/* Silme: sayfayi 0xFF ile doldurur. */
static void fl_erase(unsigned pg)
{
    long me = op_index++;
    if (me == cut_at) {
        switch (cut_variant) {
        case 0:                      /* hic baslamadi */
            break;
        case 1:                      /* kismen silindi: yarisi 0xFF, bir DW bozuk */
            for (unsigned i = 0; i < DWPP / 2; i++) FL.dw[pg][i] = ERASED_DW;
            FL.ecc_bad[pg][0] = 1;   /* basliktaki DW zayif/okunamaz kaldi */
            break;
        default:                     /* tamamlandi ama komut donmedi */
            for (unsigned i = 0; i < DWPP; i++) { FL.dw[pg][i] = ERASED_DW; FL.ecc_bad[pg][i] = 0; }
            break;
        }
        power_cut();
    }
    for (unsigned i = 0; i < DWPP; i++) { FL.dw[pg][i] = ERASED_DW; FL.ecc_bad[pg][i] = 0; }
}

/* Programlama: yalnizca silinmis bir DW'ye yazilabilir (ECC nedeniyle tek sefer). */
static int fl_program(unsigned pg, unsigned idx, uint64_t val)
{
    if (FL.dw[pg][idx] != ERASED_DW || FL.ecc_bad[pg][idx]) { prog_errors++; return -1; } /* PROGERR */

    long me = op_index++;
    if (me == cut_at) {
        switch (cut_variant) {
        case 0:                      /* hucreye hic dokunulmadi */
            break;
        case 1:                      /* yarim programlandi: ECC yazilamadi -> okunamaz */
            FL.dw[pg][idx]      = val | 0x00FF00FF00FF00FFull;
            FL.ecc_bad[pg][idx] = 1;
            break;
        default:                     /* veri oturdu ama komut donmedi */
            FL.dw[pg][idx] = val;
            break;
        }
        power_cut();
    }
    FL.dw[pg][idx] = val;
    return 0;
}

/* Okuma: bozuk DW -> NMI. Yakalayici yoksa sistem duser. */
static uint64_t fl_read(unsigned pg, unsigned idx)
{
    if (FL.ecc_bad[pg][idx]) {
        nmi_hits++;
        if (nmi_armed) longjmp(nmi_jmp, NMI_TAG);
        longjmp(crash_jmp, CRASH_TAG);   /* yakalanmamis NMI -> sistem duser */
    }
    return FL.dw[pg][idx];
}

/* ------------------------------------------------------------------ */
/* CRC-32 (IEEE 802.3, yansimali)                                      */
/* ------------------------------------------------------------------ */
static uint32_t crc32(const uint8_t *p, size_t n)
{
    uint32_t c = 0xFFFFFFFFu;
    for (size_t i = 0; i < n; i++) {
        c ^= p[i];
        for (int k = 0; k < 8; k++) c = (c >> 1) ^ (0xEDB88320u & (uint32_t)(-(int32_t)(c & 1)));
    }
    return ~c;
}

static uint32_t rec_crc(uint64_t payload, uint32_t seq)
{
    uint8_t buf[12];
    memcpy(buf, &payload, 8);
    memcpy(buf + 8, &seq, 4);
    return crc32(buf, sizeof buf);
}

/* ================================================================== */
static uint64_t safe_read(unsigned pg, unsigned idx, int *bad);

/* Tasarim A - "Naif": tek sabit slot, yerinde guncelleme              */
/* ================================================================== */
static int  a_ok;
static uint64_t a_val;

static void A_recover(void)
{
    int bad;
    uint64_t v = safe_read(0, 0, &bad);
    a_ok  = (!bad && v != ERASED_DW);
    a_val = v;
}

static void A_write(uint64_t v)
{
    fl_erase(0);                 /* <-- burada veri yok olur */
    fl_program(0, 0, v);
    a_ok = 1; a_val = v;
}

static int A_read(uint64_t *out) { if (!a_ok) return -1; *out = a_val; return 0; }


/* ================================================================== */
/* Tasarim B/C/D - Journal (append-only) + sayfa devri                 */
/*                                                                     */
/*  Sayfa duzeni:                                                      */
/*    dw[0]        : RECEIVE basligi  (MAGIC_R | pageseq)              */
/*    dw[1]        : ACTIVE  basligi  (MAGIC_A | pageseq)              */
/*    dw[2+2k]     : payload                                           */
/*    dw[2+2k+1]   : commit isareti (seq<<32 | crc32(payload,seq))     */
/*                                                                     */
/*  Ayarlanabilir kusurlar (deney degiskenleri):                       */
/*    j_two_phase        0 = tek adimli sayfa basligi (kusurlu)        */
/*    j_order            1 = commit isareti payload'dan once (kusurlu) */
/*    j_scan_marker_first 0 = taramada once payload okunur (kusurlu)   */
/*    nmi_armed          0 = ECC NMI yakalayicisi yok (kusurlu)        */
/* ================================================================== */
#define MAGIC_R    0xA5A5A5A5u
#define MAGIC_A    0x5A5A5A5Au
#define FIRST_SLOT 2u
#define NSLOTS     ((DWPP - FIRST_SLOT) / 2u)

static int j_two_phase = 1;
static int j_order = 0;
static int j_scan_marker_first = 1;

static unsigned j_page, j_slot;
static uint32_t j_seq, j_pageseq;
static uint64_t j_val;
static int      j_ok;

static unsigned slot_payload_dw(unsigned s) { return FIRST_SLOT + 2u * s; }
static unsigned slot_mark_dw(unsigned s)    { return FIRST_SLOT + 2u * s + 1u; }

/* ECC-guvenli okuma: bozuk DW'de NMI yakalanir, *bad=1 dondurulur. */
static uint64_t safe_read(unsigned pg, unsigned idx, int *bad)
{
    *bad = 0;
    if (!nmi_armed) return fl_read(pg, idx);      /* yakalayici yok -> sistem duser */
    jmp_buf save; memcpy(save, nmi_jmp, sizeof save);
    uint64_t v = 0;
    if (setjmp(nmi_jmp) == 0) v = fl_read(pg, idx);
    else *bad = 1;
    memcpy(nmi_jmp, save, sizeof save);
    return v;
}

static void j_write_record(unsigned pg, unsigned s, uint64_t payload, uint32_t seq)
{
    uint64_t mark = ((uint64_t)seq << 32) | rec_crc(payload, seq);
    if (j_order == 0) {
        fl_program(pg, slot_payload_dw(s), payload);   /* once veri */
        fl_program(pg, slot_mark_dw(s),    mark);      /* sonra commit */
    } else {
        fl_program(pg, slot_mark_dw(s),    mark);
        fl_program(pg, slot_payload_dw(s), payload);
    }
}

static int j_scan_page(unsigned pg, uint32_t *bseq, uint64_t *bval, unsigned *next)
{
    int found = 0, bad;
    *next = 0;
    for (unsigned s = 0; s < NSLOTS; s++) {
        uint64_t mark, payload;
        if (j_scan_marker_first) {
            mark = safe_read(pg, slot_mark_dw(s), &bad);
            if (bad) { *next = s + 1; continue; }
            if (mark == ERASED_DW) { *next = s; break; }
            payload = safe_read(pg, slot_payload_dw(s), &bad);
            if (bad) { *next = s + 1; continue; }
        } else {
            payload = safe_read(pg, slot_payload_dw(s), &bad);
            if (bad) { *next = s + 1; continue; }
            mark = safe_read(pg, slot_mark_dw(s), &bad);
            if (bad) { *next = s + 1; continue; }
            if (mark == ERASED_DW) { *next = s; break; }
        }
        *next = s + 1;
        uint32_t seq = (uint32_t)(mark >> 32);
        if ((uint32_t)mark != rec_crc(payload, seq)) continue;   /* yarim kayit */
        if (!found || seq >= *bseq) { *bseq = seq; *bval = payload; found = 1; }
    }
    return found ? 0 : 1;
}

static void J_recover(void)
{
    j_ok = 0; j_seq = 0; j_val = 0; j_page = 0; j_slot = 0; j_pageseq = 0;

    int have = 0, bad; uint32_t best = 0;
    for (unsigned pg = 0; pg < NPAGES; pg++) {
        /* Tek adimli modda RECEIVE basligi yetkili sayilir; iki adimlida ACTIVE gerekir. */
        unsigned hdr_idx = j_two_phase ? 1u : 0u;
        uint32_t want    = j_two_phase ? MAGIC_A : MAGIC_R;
        uint64_t h = safe_read(pg, hdr_idx, &bad);
        if (bad || (uint32_t)(h >> 32) != want) continue;
        uint32_t ps = (uint32_t)h;
        if (!have || ps >= best) { best = ps; j_page = pg; have = 1; }
    }

    if (!have) {                       /* sifirdan kurulum */
        fl_erase(0);
        fl_program(0, 0, ((uint64_t)MAGIC_R << 32) | 1u);
        fl_program(0, 1, ((uint64_t)MAGIC_A << 32) | 1u);
        j_page = 0; j_pageseq = 1; j_slot = 0; j_ok = 0;
        return;
    }

    j_pageseq = best;
    uint32_t seq = 0; uint64_t val = 0; unsigned next = 0;
    if (j_scan_page(j_page, &seq, &val, &next) == 0) { j_ok = 1; j_seq = seq; j_val = val; }
    j_slot = next;
}

static void J_transfer(void)
{
    unsigned other = 1u - j_page;
    uint32_t ns = j_pageseq + 1u;

    fl_erase(other);
    fl_program(other, 0, ((uint64_t)MAGIC_R << 32) | ns);   /* RECEIVE */
    if (j_ok) j_write_record(other, 0, j_val, ++j_seq);     /* veriyi tasi */
    fl_program(other, 1, ((uint64_t)MAGIC_A << 32) | ns);   /* ancak simdi yetkili */

    j_page = other; j_pageseq = ns; j_slot = j_ok ? 1u : 0u;
}

static void J_write(uint64_t v)
{
    if (j_slot >= NSLOTS) J_transfer();
    j_write_record(j_page, j_slot, v, ++j_seq);
    j_slot++; j_ok = 1; j_val = v;
}

static int J_read(uint64_t *out) { if (!j_ok) return -1; *out = j_val; return 0; }

/* ================================================================== */
/* Deney kosum takimi - tuketici guc kesintisi enjeksiyonu             */
/* ================================================================== */
#ifndef NWRITES
#define NWRITES 10u
#endif

typedef struct {
    const char *name;
    int  journal;            /* 0 = tasarim A, 1 = journal */
    int  two_phase, order, marker_first, nmi;
} design_t;

static const design_t DESIGNS[] = {
  { "A  naif yerinde guncelleme",              0, 1, 0, 1, 1 },
  { "B1 tek adimli sayfa basligi",             1, 0, 0, 1, 1 },
  { "B2 commit isareti payload'dan once",      1, 1, 1, 1, 1 },
  { "B3 ECC NMI yakalayicisi yok",             1, 1, 0, 1, 0 },
  { "B4 taramada once payload okunuyor",       1, 1, 0, 0, 1 },
  { "C  tam tasarim",                          1, 1, 0, 1, 1 },
};
#define NDESIGNS (sizeof DESIGNS / sizeof DESIGNS[0])

static unsigned writes_done;
static uint64_t inflight;
static int      inflight_active;

static void apply(const design_t *d)
{
    j_two_phase = d->two_phase; j_order = d->order;
    j_scan_marker_first = d->marker_first; nmi_armed = d->nmi;
}

static uint64_t VAL(unsigned i) { return 0x1000000000000000ull + i; }

static void fresh_flash(void)
{
    for (unsigned p = 0; p < NPAGES; p++)
        for (unsigned i = 0; i < DWPP; i++) { FL.dw[p][i] = ERASED_DW; FL.ecc_bad[p][i] = 0; }
}

/* Is yuku: init + NWRITES yazma. Guc kesintisi cut_at/cut_variant ile enjekte edilir. */
static void workload(const design_t *d)
{
    if (d->journal) J_recover(); else A_recover();
    for (unsigned i = 1; i <= NWRITES; i++) {
        inflight = VAL(i); inflight_active = 1;
        if (d->journal) J_write(VAL(i)); else A_write(VAL(i));
        inflight_active = 0; writes_done = i;
    }
}

typedef enum { OK, LOST, CORRUPT, CRASH, UNUSABLE } verdict_t;

static verdict_t one_run(const design_t *d, long at, int var, char *why, size_t wn)
{
    fresh_flash();
    apply(d);
    writes_done = 0; inflight_active = 0; prog_errors = 0; nmi_hits = 0;
    op_index = 0; cut_at = at; cut_variant = var;

    int cut_happened = 0;
    if (setjmp(crash_jmp) != 0) { snprintf(why, wn, "yeniden acilista cokme (yakalanmamis ECC NMI)"); return CRASH; }
    if (setjmp(power_jmp) == 0) workload(d);
    else cut_happened = 1;
    if (!cut_happened && at >= 0) { snprintf(why, wn, "-"); return OK; }  /* o indekste islem yok */

    /* --- yeniden acilis: tek hata varsayimi, ikinci kesinti yok --- */
    cut_at = -1;
    nmi_hits = 0;                     /* yalnizca kurtarma sirasindaki ECC hatalarini say */
    unsigned committed = writes_done;
    uint64_t infl = inflight; int had_infl = inflight_active;

    if (d->journal) J_recover(); else A_recover();

    uint64_t got;
    int r = (d->journal) ? J_read(&got) : A_read(&got);

    if (committed == 0 && !had_infl) return OK;
    if (r != 0) {
        if (committed == 0) return OK;                 /* hic tamamlanmis yazma yoktu */
        snprintf(why, wn, "veri kayboldu: %u yazma tamamlanmisti, okuma bos dondu", committed);
        return LOST;
    }
    int acceptable = (committed >= 1 && got == VAL(committed)) || (had_infl && got == infl);
    if (!acceptable) {
        snprintf(why, wn, "bozuk deger: 0x%016llx (beklenen 0x%016llx veya ucus-halindeki 0x%016llx)",
                 (unsigned long long)got, (unsigned long long)VAL(committed),
                 (unsigned long long)(had_infl ? infl : 0));
        return CORRUPT;
    }

    /* Kurtarmadan sonra depo hala kullanilabilir olmali. */
    uint64_t probe = 0xDEADBEEFCAFEBABEull;
    if (setjmp(crash_jmp) != 0) { snprintf(why, wn, "kurtarma sonrasi yazmada cokme"); return UNUSABLE; }
    if (d->journal) J_write(probe); else A_write(probe);
    uint64_t back; int r2 = (d->journal) ? J_read(&back) : A_read(&back);
    if (r2 != 0 || back != probe) { snprintf(why, wn, "kurtarma sonrasi depo kullanilamaz"); return UNUSABLE; }
    return OK;
}

int main(void)
{
    /* Once kesintisiz kosarak toplam flash islem sayisini olc. */
    char why[256];
    long maxops = 0;
    for (unsigned k = 0; k < NDESIGNS; k++) {
        fresh_flash(); apply(&DESIGNS[k]);
        op_index = 0; cut_at = -1; writes_done = 0; inflight_active = 0;
        if (setjmp(crash_jmp) == 0 && setjmp(power_jmp) == 0) workload(&DESIGNS[k]);
        if (op_index > maxops) maxops = op_index;
    }

    printf("Flash modeli: %u sayfa x %u bayt, %u-bit programlama birimi, %u kayit slotu/sayfa\n",
           NPAGES, PAGE_SIZE, DW_SIZE * 8u, NSLOTS);
    printf("Is yuku: init + %u yazma  ->  en fazla %ld flash islemi\n", NWRITES, maxops);
    printf("Enjeksiyon: her islem indeksinde 3 yarim-kalma varyanti = %ld senaryo/tasarim\n\n",
           maxops * 3);

    printf("%-38s %8s %6s %8s %7s %10s %12s\n", "Tasarim", "senaryo", "kayip", "bozulma", "cokme", "kullanilmaz", "ECC-NMI kos.");
    printf("----------------------------------------------------------------------------------------------\n");

    for (unsigned k = 0; k < NDESIGNS; k++) {
        long n = 0, lost = 0, corr = 0, crash = 0, unus = 0, nmi_runs = 0;
        char first[256] = "";
        long first_at = -1; int first_var = -1;
        for (long at = 0; at < maxops; at++) {
            for (int var = 0; var < 3; var++) {
                n++;
                verdict_t v = one_run(&DESIGNS[k], at, var, why, sizeof why);
                if (v == LOST) lost++; else if (v == CORRUPT) corr++;
                else if (v == CRASH) crash++; else if (v == UNUSABLE) unus++;
                if (v != OK && first_at < 0) { first_at = at; first_var = var; snprintf(first, sizeof first, "%s", why); }
                if (nmi_hits) nmi_runs++;
            }
        }
        printf("%-38s %8ld %6ld %8ld %7ld %10ld %12ld\n", DESIGNS[k].name, n, lost, corr, crash, unus, nmi_runs);
        if (first_at >= 0)
            printf("    ilk karsi-ornek: islem #%ld, varyant %d -> %s\n", first_at, first_var, first);
    }
    return 0;
}
