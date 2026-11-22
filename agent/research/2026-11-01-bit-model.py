import random, math

def p_fa_exact(N, q, k):
    st = [0.0]*k; st[0] = 1.0; latched = 0.0
    for _ in range(N):
        new = [0.0]*k
        for r in range(k):
            p = st[r]
            if p == 0.0: continue
            if r+1 == k: latched += p*q
            else: new[r+1] += p*q
            new[0] += p*(1.0-q)
        st = new
    return latched

def p_det_mc(tau_mean, delta, k, trials=400000, seed=7):
    rnd = random.Random(seed); hit = 0
    for _ in range(trials):
        tau = rnd.expovariate(1.0/tau_mean)
        u = rnd.random()*delta
        n_in = 0 if tau < u else int((tau-u)/delta)+1
        if n_in >= k: hit += 1
    return hit/trials

T_leg = 7200.0; delta = 1.0; N = int(T_leg/delta); q = 1e-3; T_h = T_leg/3600.0

print("=== A) ESIK KRITERININ IKI YONU ===")
print(f"delta={delta}s, q={q}  ->  esik tau* = delta/ln(1/q) = {delta/math.log(1/q):.4f} s\n")
for tau_mean, etiket in ((5.0, "uzun epizod (5 s)"), (0.05, "kisa epizod (50 ms)")):
    print(f"-- {etiket}: tau_ort={tau_mean}s, kriter {'SAGLANIR' if tau_mean > delta/math.log(1/q) else 'SAGLANMAZ'}")
    hdr = f"   {'k':>2} {'P_fa(tam)':>11} {'N q^k':>11} {'P_det(MC)':>10} {'e^-kD/tau':>10} {'FOM':>11}"
    print(hdr)
    prev = None
    for k in (1,2,3,4):
        pfa = p_fa_exact(N,q,k); pdet = p_det_mc(tau_mean,delta,k)
        fom = pdet/pfa if pfa>0 else float('inf')
        trend = "" if prev is None else ("  artiyor" if fom>prev else "  AZALIYOR")
        print(f"   {k:>2} {pfa:11.3e} {N*q**k:11.3e} {pdet:10.5f} {math.exp(-k*delta/tau_mean):10.5f} {fom:11.3e}{trend}")
        prev = fom
    print()

print("=== B) YAYIMLANMIS MTBUR/MTBF ORANINDAN lambda_i GERI HESABI ===")
lam_p = 1.0/40000.0; cover = 0.95
for ratio, kaynak in ((23500/40000, "ADIRU ornegi 23.500/40.000"), (0.50, "Kayton&Friend kurali ~0.50")):
    tot = lam_p/ratio
    print(f"\n-- {kaynak}: MTBUR/MTBF={ratio:.4f} -> toplam sokum hizi={tot:.4e}/h")
    print(f"   kalici arizadan gelen pay = lam_p*C = {lam_p*cover:.4e}/h "
          f"({lam_p*cover/tot*100:.1f}%)  -> NFF payi {100-lam_p*cover/tot*100:.1f}%")
    for k in (2,3,4):
        pfa = p_fa_exact(N,q,k); pdet = p_det_mc(5.0,delta,k)
        r_f = pfa/T_h
        r_i = tot - lam_p*cover - r_f
        if r_i <= 0:
            print(f"   k={k}: yanlis alarm tek basina butceyi asiyor (r_f={r_f:.3e})"); continue
        lam_i = r_i/pdet
        print(f"   k={k}: r_f={r_f:.3e}/h, r_i={r_i:.3e}/h -> lam_i={lam_i:.3e}/h "
              f"(MTBIF={1/lam_i:,.0f} h, epizod basina tespit {pdet:.3f})")
