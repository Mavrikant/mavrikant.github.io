/*
 * qspisim.c - Zynq-7000 + S25FL512S QSPI NOR flash uzerinde guc kesintisi enjeksiyonu.
 *
 * Modellenen donanim semantigi (S25FL512S veri sayfasi, Doc 001-98284):
 *   - Silme birimi : 256 kB uniform sektor (tSE = 520 ms tipik, 2600 ms maks)
 *   - Programlama  : 512 baytlik sayfa tamponu (tPP = 340 us tipik)
 *   - ECC birimi   : 16 bayt hizali/uzunlukta "Programming Block"
 *   - Ayni ECC birimi ikinci kez programlanirsa EDC SESSIZCE devre disi kalir;
 *     yeniden etkinlestirmek icin sektor silmek gerekir. Hata bayragi kalkmaz.
 *   - ECC durumu yalnizca ECCRD (18h) ile ECCSR okunarak gorulebilir.
 *
 * Bu modelde olcekler kucultuldu (sektor = 8 ECC birimi) ki tuketici arama
 * mumkun olsun; semantik birebir korundu. Gercek geometri yazidaki aritmetikte.
 *
 * Derleme: cc -O2 -Wall -Wextra -std=c11 -o qspisim qspisim.c
 */
#include <stdio.h>
#include <stdint.h>
#include <string.h>
#include <setjmp.h>

#define ECC_UNIT     16u                  /* bayt - S25FL512S ECC birimi */
#ifndef UNITS_PER_SECTOR
#define UNITS_PER_SECTOR 8u               /* olcekli sektor */
#endif
#define NSECTORS     2u
#define HDR_UNITS    2u                   /* unit[0]=RECEIVE, unit[1]=ACTIVE */
#define NSLOTS       ((UNITS_PER_SECTOR - HDR_UNITS) / 2u)

typedef struct {
    uint8_t b[ECC_UNIT];
    uint8_t programmed;     /* bu birime en az bir kez yazildi */
    uint8_t ecc_disabled;   /* birden fazla programlandi -> EDC kapali */
    uint8_t torn;           /* yarim kalan programlama -> icerik guvenilmez */
} ecc_unit_t;

static ecc_unit_t FL[NSECTORS][UNITS_PER_SECTOR];

static jmp_buf power_jmp;
static long    op_index, cut_at;
static int     cut_variant;

static void power_cut(void) { longjmp(power_jmp, 1); }

static void unit_erase(ecc_unit_t *u)
{
    memset(u->b, 0xFF, ECC_UNIT);
    u->programmed = u->ecc_disabled = u->torn = 0;
}

/* Sektor silme. S25FL512S'te 256 kB, 520 ms tipik. */
static void fl_erase(unsigned s)
{
    long me = op_index++;
    if (me == cut_at) {
        switch (cut_variant) {
        case 0: break;                                   /* hic baslamadi */
        case 1:                                          /* kismen silindi */
            for (unsigned i = 0; i < UNITS_PER_SECTOR / 2u; i++) unit_erase(&FL[s][i]);
            FL[s][0].torn = 1;                           /* basliktaki birim zayif kaldi */
            FL[s][0].programmed = 1;
            break;
        default:                                         /* bitti, komut donmedi */
            for (unsigned i = 0; i < UNITS_PER_SECTOR; i++) unit_erase(&FL[s][i]);
            break;
        }
        power_cut();
    }
    for (unsigned i = 0; i < UNITS_PER_SECTOR; i++) unit_erase(&FL[s][i]);
}

/*
 * Bir ECC birimini programlar.
 * KRITIK FARK: silinmemis bir birime yazmak HATA VERMEZ. Veri bit-AND'lenir ve
 * o birimin EDC'si sessizce kapatilir (veri sayfasi, Automatic ECC bolumu).
 */
static void fl_program_unit(unsigned s, unsigned idx, const uint8_t *data)
{
    ecc_unit_t *u = &FL[s][idx];
    int second = u->programmed;

    long me = op_index++;
    if (me == cut_at) {
        switch (cut_variant) {
        case 0: break;                                   /* hucreye dokunulmadi */
        case 1:                                          /* yarim programlandi */
            for (unsigned i = 0; i < ECC_UNIT; i++)
                u->b[i] &= (i < ECC_UNIT / 2u) ? data[i] : 0xFF;  /* yarisi oturdu */
            u->programmed = 1;
            u->torn = 1;
            if (second) u->ecc_disabled = 1;
            break;
        default:                                         /* veri oturdu, komut donmedi */
            for (unsigned i = 0; i < ECC_UNIT; i++) u->b[i] &= data[i];
            u->programmed = 1;
            if (second) u->ecc_disabled = 1;
            break;
        }
        power_cut();
    }
    for (unsigned i = 0; i < ECC_UNIT; i++) u->b[i] &= data[i];
    u->programmed = 1;
    if (second) u->ecc_disabled = 1;                     /* SESSIZ: P_ERR kalkmaz */
}

/* Okuma. Tek bit hatasi seffafca duzeltilir; kopan birim sessizce yanlis veri doner. */
static void fl_read_unit(unsigned s, unsigned idx, uint8_t *out)
{
    memcpy(out, FL[s][idx].b, ECC_UNIT);
}

/* ECCRD (18h) -> ECCSR. Ancak ACIKCA sorulursa gorulur. */
static int fl_ecc_status_bad(unsigned s, unsigned idx)
{
    return FL[s][idx].ecc_disabled || FL[s][idx].torn;
}

static uint32_t crc32(const uint8_t *p, size_t n)
{
    uint32_t c = 0xFFFFFFFFu;
    for (size_t i = 0; i < n; i++) {
        c ^= p[i];
        for (int k = 0; k < 8; k++) c = (c >> 1) ^ (0xEDB88320u & (uint32_t)(-(int32_t)(c & 1)));
    }
    return ~c;
}

/* ================================================================== */
/* Kayit duzeni                                                        */
/*   payload birimi : [0..7] deger, [8..15] 0xFF                       */
/*   commit birimi  : [0..3] seq, [4..7] crc32(deger,seq), [8..11] MAGIC*/
/* ================================================================== */
#define REC_MAGIC 0xC0FFEE01u
#define HDR_R     0xA5A5A5A5u
#define HDR_A     0x5A5A5A5Au

static void put32(uint8_t *p, uint32_t v) { memcpy(p, &v, 4); }
static uint32_t get32(const uint8_t *p) { uint32_t v; memcpy(&v, p, 4); return v; }

static uint32_t rec_crc(uint64_t val, uint32_t seq)
{
    uint8_t t[12]; memcpy(t, &val, 8); put32(t + 8, seq);
    return crc32(t, sizeof t);
}

/* --- ayarlanabilir kusurlar (deney degiskenleri) --- */
static int cfg_two_phase   = 1;  /* 0 = tek adimli sektor basligi          */
static int cfg_same_unit   = 0;  /* 1 = payload ve commit AYNI ECC biriminde */
static int cfg_check_ecc   = 1;  /* 0 = ECCRD ile dogrulama yapilmaz       */
static int cfg_invalidate  = 0;  /* 1 = eski kaydi yerinde gecersiz isaretle */

static unsigned j_sec, j_slot;
static int j_win_valid; static unsigned j_win_slot;
static uint32_t j_seq, j_secseq;
static uint64_t j_val;
static int      j_ok, j_marginal;

static unsigned payload_unit(unsigned s) { return HDR_UNITS + 2u * s; }
static unsigned mark_unit(unsigned s)
{
    return cfg_same_unit ? payload_unit(s) : HDR_UNITS + 2u * s + 1u;
}
/* cfg_same_unit modunda commit alanlari ayni birimin UST yarisina yazilir:
   bayt araliklari ayrik oldugu icin veri bozulmaz, ama birim ikinci kez
   programlandigi icin o birimin EDC'si sessizce kapanir. */
static unsigned mark_off(void) { return cfg_same_unit ? 8u : 0u; }

static void write_record(unsigned sec, unsigned slot, uint64_t val, uint32_t seq)
{
    uint8_t u[ECC_UNIT];

    memset(u, 0xFF, ECC_UNIT);
    memcpy(u, &val, 8);
    fl_program_unit(sec, payload_unit(slot), u);          /* once veri */

    memset(u, 0xFF, ECC_UNIT);
    { unsigned o = mark_off();
      put32(u + o, seq); put32(u + o + 4, rec_crc(val, seq));
      if (!cfg_same_unit) put32(u + 8, REC_MAGIC); }
    fl_program_unit(sec, mark_unit(slot), u);             /* sonra commit */
}

/* Legacy "bit walking": eski kaydi kendi biriminde gecersiz isaretle.
   Ayni ECC birimine ikinci yazma -> EDC sessizce kapanir. */
static void invalidate_record(unsigned sec, unsigned slot)
{
    uint8_t u[ECC_UNIT];
    memset(u, 0xFF, ECC_UNIT);
    u[12] = 0x00;                                        /* gecersizlik bayragi */
    fl_program_unit(sec, mark_unit(slot), u);
}

static int read_record(unsigned sec, unsigned slot, uint64_t *val, uint32_t *seq, int *ecc_bad)
{
    uint8_t p[ECC_UNIT], m[ECC_UNIT];
    unsigned o = mark_off();
    fl_read_unit(sec, mark_unit(slot), m);
    if (!cfg_same_unit && get32(m + 8) != REC_MAGIC) return -1;  /* commit yok */
    if (cfg_same_unit && get32(m + o) == 0xFFFFFFFFu) return -1; /* commit yok */
    fl_read_unit(sec, payload_unit(slot), p);

    uint64_t v; memcpy(&v, p, 8);
    uint32_t s = get32(m + o), c = get32(m + o + 4);
    if (c != rec_crc(v, s)) return -1;                   /* yarim kayit */
    if (cfg_invalidate && m[12] == 0x00) return -1;      /* gecersiz isaretli */

    *val = v; *seq = s;
    *ecc_bad = cfg_check_ecc && (fl_ecc_status_bad(sec, payload_unit(slot)) ||
                                 fl_ecc_status_bad(sec, mark_unit(slot)));
    return 0;
}

static void write_header(unsigned sec, uint32_t magic, uint32_t seq, unsigned idx)
{
    uint8_t u[ECC_UNIT];
    memset(u, 0xFF, ECC_UNIT);
    put32(u, magic); put32(u + 4, seq);
    fl_program_unit(sec, idx, u);
}

static int read_header(unsigned sec, unsigned idx, uint32_t magic, uint32_t *seq)
{
    uint8_t u[ECC_UNIT];
    fl_read_unit(sec, idx, u);
    if (get32(u) != magic) return -1;
    if (cfg_check_ecc && fl_ecc_status_bad(sec, idx)) return -1;
    *seq = get32(u + 4);
    return 0;
}

static void J_transfer(void);

static void J_recover(void)
{
    j_ok = 0; j_marginal = 0; j_seq = 0; j_val = 0; j_sec = 0; j_slot = 0; j_secseq = 0;

    int have = 0; uint32_t best = 0;
    unsigned hidx = cfg_two_phase ? 1u : 0u;
    uint32_t hmag = cfg_two_phase ? HDR_A : HDR_R;

    for (unsigned s = 0; s < NSECTORS; s++) {
        uint32_t ss;
        if (read_header(s, hidx, hmag, &ss) != 0) continue;
        if (!have || ss >= best) { best = ss; j_sec = s; have = 1; }
    }

    if (!have) {                                  /* sifirdan kurulum */
        fl_erase(0);
        write_header(0, HDR_R, 1u, 0);
        write_header(0, HDR_A, 1u, 1);
        j_sec = 0; j_secseq = 1; j_slot = 0;
        return;
    }

    j_secseq = best;
    int found = 0, win_bad = 0; unsigned next = 0, win_slot = 0;
    for (unsigned s = 0; s < NSLOTS; s++) {
        uint64_t v; uint32_t sq; int bad;
        if (read_record(j_sec, s, &v, &sq, &bad) != 0) {
            uint8_t m[ECC_UNIT];
            fl_read_unit(j_sec, mark_unit(s), m);
            int empty = cfg_same_unit ? (get32(m + mark_off()) == 0xFFFFFFFFu)
                                      : (get32(m + 8) != REC_MAGIC);
            if (empty) { next = s; break; }                      /* bos slot */
            next = s + 1; continue;                              /* yarim/gecersiz */
        }
        next = s + 1;
        if (!found || sq >= j_seq) { j_seq = sq; j_val = v; win_bad = bad; win_slot = s; found = 1; }
    }
    j_slot = next;
    j_win_valid = 0;
    if (found) { j_ok = 1; j_marginal = win_bad; j_win_valid = 1; j_win_slot = win_slot; }

    /* Scrub: ECC'si kapanmis/kopmus kazanan kaydi taze bir slota yeniden yaz. */
    if (found && win_bad) {
        if (j_slot >= NSLOTS) J_transfer(); else { write_record(j_sec, j_slot, j_val, ++j_seq); j_slot++; }
        j_marginal = 0; j_win_valid = 1; j_win_slot = j_slot - 1u;
    }
}

static void J_transfer(void)
{
    unsigned other = 1u - j_sec;
    uint32_t ns = j_secseq + 1u;

    fl_erase(other);                                     /* 256 kB, 520 ms tipik */
    write_header(other, HDR_R, ns, 0);                   /* RECEIVE */
    if (j_ok) write_record(other, 0, j_val, ++j_seq);    /* veriyi tasi */
    write_header(other, HDR_A, ns, 1);                   /* ancak simdi yetkili */

    j_sec = other; j_secseq = ns; j_slot = j_ok ? 1u : 0u;
}

static void J_write(uint64_t v)
{
    if (cfg_invalidate && j_ok && j_slot > 0) invalidate_record(j_sec, j_slot - 1u);
    if (j_slot >= NSLOTS) J_transfer();
    write_record(j_sec, j_slot, v, ++j_seq);
    j_slot++; j_ok = 1; j_val = v;
}

static int J_read(uint64_t *out) { if (!j_ok) return -1; *out = j_val; return 0; }

/* --- Tasarim A: naif yerinde guncelleme (sektor sil + yeniden yaz) --- */
static int      a_ok, a_marginal;
static uint64_t a_val;

static void A_recover(void)
{
    uint64_t v; uint32_t sq; int bad;
    a_ok = 0; a_marginal = 0;
    if (read_record(0, 0, &v, &sq, &bad) == 0) { a_ok = 1; a_val = v; a_marginal = bad; }
}

static void A_write(uint64_t v)
{
    fl_erase(0);                                         /* <-- 520 ms boyunca veri yok */
    write_record(0, 0, v, ++j_seq);
    a_ok = 1; a_val = v; a_marginal = 0;
}

static int A_read(uint64_t *out) { if (!a_ok) return -1; *out = a_val; return 0; }

/* ================================================================== */
/* Kosum takimi                                                        */
/* ================================================================== */
#ifndef NWRITES
#define NWRITES 8u
#endif

typedef struct {
    const char *name;
    int journal, two_phase, same_unit, check_ecc, invalidate;
} design_t;

static const design_t DESIGNS[] = {
  { "A  naif yerinde guncelleme",            0, 1, 0, 1, 0 },
  { "B1 tek adimli sektor basligi",          1, 0, 0, 1, 0 },
  { "B2 payload+commit ayni ECC biriminde",  1, 1, 1, 1, 0 },
  { "B3 ECCRD dogrulamasi yok",              1, 1, 0, 0, 0 },
  { "B4 eski kaydi yerinde gecersiz isaret", 1, 1, 0, 1, 1 },
  { "C  tam tasarim",                        1, 1, 0, 1, 0 },
};
#define NDESIGNS (sizeof DESIGNS / sizeof DESIGNS[0])

static unsigned writes_done;
static uint64_t inflight;
static int      inflight_active;

static uint64_t VAL(unsigned i) { return 0x2000000000000000ull + i; }

static void apply(const design_t *d)
{
    cfg_two_phase = d->two_phase; cfg_same_unit = d->same_unit;
    cfg_check_ecc = d->check_ecc; cfg_invalidate = d->invalidate;
}

static void fresh_flash(void)
{
    for (unsigned s = 0; s < NSECTORS; s++)
        for (unsigned i = 0; i < UNITS_PER_SECTOR; i++) unit_erase(&FL[s][i]);
}

static void workload(const design_t *d)
{
    if (d->journal) J_recover(); else A_recover();
    for (unsigned i = 1; i <= NWRITES; i++) {
        inflight = VAL(i); inflight_active = 1;
        if (d->journal) J_write(VAL(i)); else A_write(VAL(i));
        inflight_active = 0; writes_done = i;
    }
}

typedef enum { OK, LOST, CORRUPT, STALE, MARGINAL, UNUSABLE } verdict_t;

static verdict_t one_run(const design_t *d, long at, int var, char *why, size_t wn)
{
    fresh_flash(); apply(d);
    writes_done = 0; inflight_active = 0; j_seq = 0;
    op_index = 0; cut_at = at; cut_variant = var;

    int cut = 0;
    if (setjmp(power_jmp) == 0) workload(d); else cut = 1;
    if (!cut && at >= 0) { snprintf(why, wn, "-"); return OK; }

    cut_at = -1;                       /* tek hata varsayimi */
    unsigned committed = writes_done;
    uint64_t infl = inflight; int had = inflight_active;

    if (d->journal) J_recover(); else A_recover();
    uint64_t got; int r = d->journal ? J_read(&got) : A_read(&got);
    int marg = d->journal ? j_marginal : a_marginal;

    if (committed == 0 && !had) return OK;
    if (r != 0) {
        if (committed == 0) return OK;
        snprintf(why, wn, "veri kayboldu: %u yazma tamamlanmisti, okuma bos dondu", committed);
        return LOST;
    }
    if (!((committed >= 1 && got == VAL(committed)) || (had && got == infl))) {
        for (unsigned q = 1; q < committed; q++)
            if (got == VAL(q)) {
                snprintf(why, wn, "eski surume donus: %u yazma tamamlanmisti, okunan surum %u",
                         committed, q);
                return STALE;
            }
        snprintf(why, wn, "bozuk deger: 0x%016llx", (unsigned long long)got);
        return CORRUPT;
    }
    /* Marjinallik, tasarimin kendi gorusuyle degil YER GERCEGI ile yargilanir:
       B3 ECCRD sormadigi icin sorunu goremez, ama sorun oradadir. */
    (void)marg;
    if (d->journal && j_win_valid)
        marg = FL[j_sec][payload_unit(j_win_slot)].ecc_disabled ||
               FL[j_sec][payload_unit(j_win_slot)].torn ||
               FL[j_sec][mark_unit(j_win_slot)].ecc_disabled ||
               FL[j_sec][mark_unit(j_win_slot)].torn;
    else if (!d->journal)
        marg = FL[0][payload_unit(0)].ecc_disabled || FL[0][payload_unit(0)].torn ||
               FL[0][mark_unit(0)].ecc_disabled   || FL[0][mark_unit(0)].torn;
    if (marg) {
        snprintf(why, wn, "deger dogru ama kazanan kaydin EDC'si kapali (sessiz koruma kaybi)");
        return MARGINAL;
    }

    uint64_t probe = 0xDEADBEEFCAFEBABEull;
    if (d->journal) J_write(probe); else A_write(probe);
    uint64_t back; int r2 = d->journal ? J_read(&back) : A_read(&back);
    if (r2 != 0 || back != probe) { snprintf(why, wn, "kurtarma sonrasi depo kullanilamaz"); return UNUSABLE; }
    return OK;
}

/* Kurtarma sonrasi EDC'si kapali birim sayisi (gizli kalan risk). */
static long ecc_disabled_units(void)
{
    long n = 0;
    for (unsigned s = 0; s < NSECTORS; s++)
        for (unsigned i = 0; i < UNITS_PER_SECTOR; i++)
            if (FL[s][i].ecc_disabled) n++;
    return n;
}

int main(void)
{
    char why[256];
    long maxops = 0;
    for (unsigned k = 0; k < NDESIGNS; k++) {
        fresh_flash(); apply(&DESIGNS[k]);
        op_index = 0; cut_at = -1; writes_done = 0; inflight_active = 0; j_seq = 0;
        if (setjmp(power_jmp) == 0) workload(&DESIGNS[k]);
        if (op_index > maxops) maxops = op_index;
    }

    printf("Model: S25FL512S semantigi, %u sektor x %u ECC birimi (16 B), %u kayit slotu/sektor\n",
           NSECTORS, UNITS_PER_SECTOR, NSLOTS);
    printf("Is yuku: kurtarma + %u yazma  ->  en fazla %ld flash islemi\n", NWRITES, maxops);
    printf("Enjeksiyon: her islem indeksinde 3 yarim-kalma varyanti = %ld senaryo/tasarim\n\n",
           maxops * 3);

    printf("%-40s %8s %6s %7s %8s %9s %11s\n",
           "Tasarim", "senaryo", "kayip", "eskime", "bozulma", "marjinal", "EDC-kapali");
    puts("--------------------------------------------------------------------------------------------------");

    for (unsigned k = 0; k < NDESIGNS; k++) {
        long n = 0, lost = 0, corr = 0, marg = 0, eccoff = 0, stale = 0;
        char first[256] = ""; long fat = -1; int fvar = -1;
        for (long at = 0; at < maxops; at++) {
            for (int var = 0; var < 3; var++) {
                n++;
                verdict_t v = one_run(&DESIGNS[k], at, var, why, sizeof why);
                if (v == LOST) lost++; else if (v == CORRUPT) corr++; else if (v == STALE) stale++;
                else if (v == MARGINAL) marg++;
                eccoff += ecc_disabled_units();
                if (v != OK && fat < 0) { fat = at; fvar = var; snprintf(first, sizeof first, "%s", why); }
            }
        }
        printf("%-40s %8ld %6ld %7ld %8ld %9ld %11ld\n",
               DESIGNS[k].name, n, lost, stale, corr, marg, eccoff);
        if (fat >= 0) printf("    ilk karsi-ornek: islem #%ld, varyant %d -> %s\n", fat, fvar, first);
    }
    return 0;
}
