// שכבה חוויתית: רקע חי, צעצוע יחס הזהב, דמות המודולור. הכול SVG בקו דיו, בלי תמונות חיצוניות.
import { useEffect, useRef, useState } from 'react';
import { PALLADIO, PHI } from '../lib/systems';

/** רקע: נייר מילימטרי וקווי ויסות זהובים שנעים לאט, עם עומק שזז עם העכבר. */
export function Backdrop() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const on = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--px', `${(e.clientX / innerWidth - 0.5) * -14}px`);
        el.style.setProperty('--py', `${(e.clientY / innerHeight - 0.5) * -10}px`);
      });
    };
    addEventListener('pointermove', on);
    return () => { removeEventListener('pointermove', on); cancelAnimationFrame(raf); };
  }, []);
  // ריבועי זהב מקוננים, בקנה מידה גדול, מאחורי התוכן
  const sq: { x: number; y: number; s: number }[] = [];
  let x = 0, y = 0, w = 1618, h = 1000;
  for (let i = 0; i < 9; i++) {
    const s = Math.min(w, h), d = i % 4;
    if (d === 0) { sq.push({ x, y, s }); x += s; w -= s; }
    else if (d === 1) { sq.push({ x, y, s }); y += s; h -= s; }
    else if (d === 2) { sq.push({ x: x + w - s, y, s }); w -= s; }
    else { sq.push({ x, y: y + h - s, s }); h -= s; }
  }
  return (
    <div ref={ref} className="backdrop" aria-hidden="true">
      <div className="bd-grid" />
      <svg className="bd-gold" viewBox="0 0 1618 1000" preserveAspectRatio="xMidYMid slice">
        <rect x="0" y="0" width="1618" height="1000" fill="none" stroke="var(--gold)" strokeWidth="1.2" />
        {sq.map((q, i) => <rect key={i} x={q.x} y={q.y} width={q.s} height={q.s} fill="none" stroke="var(--gold)" strokeWidth={1.2} style={{ animationDelay: `${i * 0.9}s` }} className="bd-sq" />)}
        <line x1="0" y1="1000" x2="1618" y2="0" stroke="var(--gold)" strokeWidth=".8" className="bd-diag" />
      </svg>
    </div>
  );
}

const TARGETS = [{ v: PHI, name: 'יחס הזהב', color: 'var(--gold)' }, ...PALLADIO.slice(1).map((p) => ({ v: p.value, name: p.name, color: 'var(--violet)' }))];

/** צעצוע: גוררים קו חלוקה במלבן. כשמגיעים ליחס הזהב (או ליחס של פלאדיו) הקו ננעל. */
export function GoldenToy() {
  const W = 600, H = 300;
  const [t, setT] = useState(0.56);
  const [drag, setDrag] = useState(false);
  const svg = useRef<SVGSVGElement>(null);
  const big = Math.max(t, 1 - t), small = Math.min(t, 1 - t);
  const r = big / Math.max(small, 1e-6);
  const hit = TARGETS.map((x) => ({ ...x, dev: Math.abs(r - x.v) / x.v })).sort((a, b) => a.dev - b.dev)[0];
  const locked = hit.dev < 0.012;
  const move = (clientX: number) => {
    const el = svg.current!;
    const pt = el.createSVGPoint(); pt.x = clientX; pt.y = 0;
    const p = pt.matrixTransform(el.getScreenCTM()!.inverse());
    let v = Math.min(0.92, Math.max(0.08, p.x / W));
    // הצמדה: ליד יעד, הקו נמשך אליו
    for (const g of [1 / PHI, 1 - 1 / PHI]) if (Math.abs(v - g) < 0.012) v = g;
    setT(v);
  };
  const tone = locked ? hit.color : hit.dev < 0.05 ? 'var(--near)' : 'var(--off)';
  return (
    <figure className="toy">
      <svg ref={svg} viewBox={`-20 -46 ${W + 40} ${H + 110}`} className="toy-svg" style={{ direction: 'ltr' }}
        onPointerDown={(e) => { (e.target as Element).setPointerCapture?.(e.pointerId); setDrag(true); move(e.clientX); }}
        onPointerMove={(e) => drag && move(e.clientX)} onPointerUp={() => setDrag(false)}
        role="slider" aria-label="קו חלוקה" aria-valuemin={8} aria-valuemax={92} aria-valuenow={Math.round(t * 100)} aria-valuetext={`יחס ${r.toFixed(3)}`} tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'ArrowLeft') setT(Math.max(0.08, t - 0.005)); if (e.key === 'ArrowRight') setT(Math.min(0.92, t + 0.005)); }}>
        <defs><filter id="tl"><feDropShadow dx="0" dy="8" stdDeviation="10" floodOpacity=".12" /></filter></defs>
        <rect x="0" y="0" width={W} height={H} fill="#fff" stroke="var(--ink)" strokeWidth="2" filter="url(#tl)" />
        <rect x="0" y="0" width={t * W} height={H} fill={tone} opacity={locked ? 0.16 : 0.07} style={{ transition: 'opacity .3s, fill .3s' }} />
        {/* סימני היעד על הסרגל */}
        {[1 / PHI, 1 - 1 / PHI].map((g) => <line key={g} x1={g * W} x2={g * W} y1={H + 6} y2={H + 22} stroke="var(--gold)" strokeWidth="3" />)}
        {PALLADIO.slice(1).flatMap((p) => [p.value / (1 + p.value), 1 / (1 + p.value)]).map((g, i) => <line key={i} x1={g * W} x2={g * W} y1={H + 8} y2={H + 18} stroke="var(--violet)" strokeWidth="1.5" />)}
        <line x1="0" x2={W} y1={H + 14} y2={H + 14} stroke="var(--ink-mute)" strokeWidth="1" />
        <g className={`toy-line${locked ? ' is-locked' : ''}`}>
          <line x1={t * W} x2={t * W} y1={-10} y2={H + 10} stroke={locked ? hit.color : 'var(--ink)'} strokeWidth={locked ? 4 : 2.5} />
          <rect x={t * W - 9} y={H / 2 - 26} width="18" height="52" fill="#fff" stroke="var(--ink)" strokeWidth="2" />
          {locked && <circle cx={t * W} cy={H / 2} r="34" fill="none" stroke={hit.color} strokeWidth="2" className="toy-ring" />}
        </g>
        <text x={(t * W) / 2} y={-14} textAnchor="middle" fontFamily="var(--mono)" fontSize="18" fill="var(--ink-soft)">{Math.round(t * 100)}%</text>
        <text x={t * W + ((1 - t) * W) / 2} y={-14} textAnchor="middle" fontFamily="var(--mono)" fontSize="18" fill="var(--ink-soft)">{Math.round((1 - t) * 100)}%</text>
        <text x={W / 2} y={H + 54} textAnchor="middle" fontFamily="var(--mono)" fontSize="30" fontWeight="600" fill={tone}>{r.toFixed(3)}</text>
      </svg>
      <figcaption className="toy-cap" aria-live="polite">
        {locked ? <span className="toy-hit" style={{ color: hit.color }}>ננעל: {hit.name}.</span> : <span>גררו את הקו. <b>{hit.name}</b> במרחק <bdi className="num">{(hit.dev * 100).toFixed(1)}%</bdi>.</span>}
        <span className="mute"> זהב: סימנים עבים. פלאדיו: דקים.</span>
      </figcaption>
    </figure>
  );
}

/** דמות המודולור: אדם בגובה 1829 מ"מ, טבור 1130 ויד מורמת 2260, ושתי הסדרות לצדו. */
export function ModulorFigure({ compact = false }: { compact?: boolean }) {
  const S = 0.16; // מ"מ לפיקסל
  const Y = (mm: number) => 400 - mm * S;
  const marks = [
    { mm: 2260, name: 'יד מורמת', s: 'blue' },
    { mm: 1829, name: 'גובה האדם', s: 'red' },
    { mm: 1397, name: '', s: 'blue' },
    { mm: 1130, name: 'טבור', s: 'red' },
    { mm: 863, name: '', s: 'blue' },
    { mm: 698, name: '', s: 'red' },
    { mm: 432, name: '', s: 'red' },
  ];
  return (
    <svg viewBox="0 0 320 420" className={`modulor${compact ? ' compact' : ''}`} role="img" aria-label="דמות המודולור: 1130, 1829 ו-2260 מילימטר" style={{ direction: 'ltr' }}>
      <line x1="20" x2="300" y1="400" y2="400" stroke="var(--ink)" strokeWidth="2" />
      {/* הדמות: קו אחד, יד מורמת */}
      <g className="mod-fig" fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="130" cy={Y(1720)} r="16" />
        <path d={`M130 ${Y(1610)} L130 ${Y(950)}`} pathLength={1} />
        <path d={`M130 ${Y(950)} L104 ${Y(0) - 2} M130 ${Y(950)} L152 ${Y(0) - 2}`} pathLength={1} />
        <path d={`M130 ${Y(1500)} L150 ${Y(1880)} L156 ${Y(2260)}`} pathLength={1} />
        <path d={`M130 ${Y(1500)} L96 ${Y(1210)} L86 ${Y(1000)}`} pathLength={1} />
      </g>
      {/* שתי הסדרות */}
      <line x1="230" x2="230" y1={Y(0)} y2={Y(2260)} stroke="var(--blue)" strokeWidth="1.2" />
      {marks.map((m, i) => (
        <g key={m.mm} className="mod-mark" style={{ animationDelay: `${0.4 + i * 0.12}s` }}>
          <line x1={m.s === 'red' ? 214 : 230} x2={m.s === 'red' ? 230 : 246} y1={Y(m.mm)} y2={Y(m.mm)} stroke="var(--blue)" strokeWidth={m.s === 'red' ? 3 : 1.6} strokeDasharray={m.s === 'red' ? undefined : '3 2'} />
          <line x1="150" x2={m.s === 'red' ? 214 : 230} y1={Y(m.mm)} y2={Y(m.mm)} stroke="var(--rule)" strokeWidth="1" />
          <text x="252" y={Y(m.mm) + 4} fontFamily="var(--mono)" fontSize="12" fill="var(--ink)">{m.mm}</text>
        </g>
      ))}
      <text x="204" y={Y(2340)} fontFamily="var(--mono)" fontSize="10" fill="var(--ink-mute)" textAnchor="end">mm</text>
    </svg>
  );
}

/** מספר שנספר מאפס אל הערך, כמו מחוג שמתייצב. */
export function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [v, setV] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setV(value); prev.current = value; return; }
    const from = prev.current, t0 = performance.now(), dur = 650;
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      setV(Math.round(from + (value - from) * e));
      if (k < 1) raf = requestAnimationFrame(step); else prev.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{v}{suffix}</>;
}
