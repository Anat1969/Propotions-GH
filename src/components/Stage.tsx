// במת ההשוואה: דוגמה אחת (איור או צילום), וסרגלי השיטות מונחים עליה, כל אחד בצבע שלו.
// באיור הסכמטי הסרגלים מראים את הדרך. בצילום, המסגרת שהמשתמש מכוון היא המדידה.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { MODULOR_BLUE, MODULOR_RED, PHI, R10, SYSTEM, nearest, type SystemId } from '../lib/systems';
import { EXAMPLES as STUDIES } from '../lib/examples';
import { Novella, Parthenon, Rotonda } from './Precedents';
import { PHOTOS, commonsUrl, commonsPage, type PhotoSrc } from './Photo';
import type { ExampleId } from '../lib/methods';

type Box = { x: number; y: number; w: number; h: number };

const residential = STUDIES.find((s) => s.id === 'ex-residential')!;

export const EXAMPLES: Record<ExampleId, { name: string; latin: string; year: string; frame: Box; widthM?: number; exact: boolean; photo?: PhotoSrc; photoHint?: string; draw: () => ReactNode }> = {
  parthenon: { name: 'הפרתנון', latin: 'Parthenon, Athens', year: '447 עד 432 לפנה"ס', frame: { x: 0, y: -24, w: 600, h: 354 }, exact: false, photo: PHOTOS.parthenon, photoHint: 'רוחב הסטילובט: 30.88 מ\'', draw: () => <Parthenon over={false} /> },
  rotonda: { name: 'וילה רוטונדה', latin: 'Villa Almerico Capra, Vicenza', year: 'מ-1567', frame: { x: 60, y: 62, w: 480, h: 268 }, exact: false, photo: PHOTOS.rotonda, draw: () => <Rotonda over={false} /> },
  novella: { name: 'סנטה מריה נובלה', latin: 'Santa Maria Novella, Firenze', year: '1470', frame: { x: 150, y: 40, w: 300, h: 300 }, exact: true, photo: PHOTOS.novella, draw: () => <Novella over={false} /> },
  residential: {
    name: 'בניין מגורים, סכמה', latin: 'דוגמה בקנה מידה', year: 'רוחב 18 מ\'', frame: { x: 0, y: 0, w: 600, h: 600 * residential.aspect }, widthM: residential.widthM, exact: true,
    draw: () => {
      const H = 600 * residential.aspect;
      return (
        <g className="schem">
          <rect x={0} y={0} width={600} height={H} fill="#FAFAF8" stroke="var(--ink)" strokeWidth={2} />
          {residential.hy.map((v) => <line key={v} x1={0} x2={600} y1={v * H} y2={v * H} stroke="var(--ink)" strokeWidth={1.4} />)}
          {residential.vx.map((v) => <line key={v} y1={0} y2={H} x1={v * 600} x2={v * 600} stroke="var(--ink)" strokeWidth={1.4} />)}
          {residential.rects.map((r) => <rect key={r.id} x={r.x * 600} y={r.y * H} width={r.w * 600} height={r.h * H} fill="#E6EBF0" stroke="var(--ink-mute)" />)}
          <line x1={-30} x2={630} y1={H} y2={H} stroke="var(--ink)" strokeWidth={2.4} />
        </g>
      );
    },
  },
};

const fmt = (v: number) => (v < 10 ? v.toFixed(2) : v.toFixed(1));

/** סרגל של שיטה אחת, מונח על המסגרת F. k: פיקסלים למטר, אם ידוע. */
function Ruler({ id, F, k }: { id: SystemId; F: Box; k: number | null }) {
  const c = SYSTEM[id].color;
  const bottom = F.y + F.h;
  const common = { stroke: c, fill: 'none' };
  if (id === 'golden') {
    const H = F.w / PHI;
    const y = bottom - H;
    return (
      <g className="ruler-ov" {...common} strokeWidth={2.4}>
        <rect x={F.x} y={y} width={F.w} height={H} strokeDasharray="10 6" />
        <line x1={F.x + H} x2={F.x + H} y1={y} y2={bottom} />
        <line x1={F.x + H} x2={F.x + F.w} y1={y + (F.w - H)} y2={y + (F.w - H)} />
        <path d={`M${F.x} ${bottom} A ${H} ${H} 0 0 1 ${F.x + H} ${y} A ${F.w - H} ${F.w - H} 0 0 1 ${F.x + F.w} ${y + F.w - H}`} strokeWidth={1.6} />
        <text x={F.x + 8} y={y - 8} fill={c} stroke="none" className="ov-tag">φ 1.618</text>
      </g>
    );
  }
  if (id === 'palladio') {
    const r = Math.max(F.w, F.h) / Math.min(F.w, F.h);
    const t = nearest('palladio', r);
    const wide = F.w >= F.h;
    const W = wide ? F.w : F.h / t.target, H = wide ? F.w / t.target : F.h;
    const s = Math.min(W, H);
    const n = Math.floor(Math.max(W, H) / s + 1e-6);
    return (
      <g className="ruler-ov" {...common} strokeWidth={2.4}>
        <rect x={F.x} y={bottom - H} width={W} height={H} strokeDasharray="10 6" />
        {Array.from({ length: n }, (_, i) => (wide ? <rect key={i} x={F.x + i * s} y={bottom - s} width={s} height={s} strokeWidth={1.4} /> : <rect key={i} x={F.x} y={bottom - (i + 1) * s} width={s} height={s} strokeWidth={1.4} />))}
        <text x={F.x + 8} y={bottom - H - 8} fill={c} stroke="none" className="ov-tag">{t.name.split(' ').pop()}</text>
      </g>
    );
  }
  if (!k) return null;
  const Hm = F.h / k, Wm = F.w / k;
  if (id === 'modulor') {
    const x = F.x + F.w + 16;
    const marks = [...MODULOR_RED.map((v) => ({ v, s: 'r' })), ...MODULOR_BLUE.map((v) => ({ v, s: 'b' }))].filter((m) => m.v >= 400 && m.v / 1000 <= Hm * 1.02);
    return (
      <g className="ruler-ov" stroke={c}>
        <line x1={x} x2={x} y1={bottom} y2={F.y} strokeWidth={2} />
        {marks.map((m) => {
          const y = bottom - (m.v / 1000) * k;
          const big = [1130, 1829, 2260, 2959, 3658, 4788, 5918, 7747, 9576, 12535, 15494].includes(m.v);
          return (
            <g key={m.s + m.v}>
              <line x1={F.x} x2={x} y1={y} y2={y} strokeWidth={0.8} strokeDasharray="4 4" opacity={big ? 0.75 : 0.35} />
              <line x1={m.s === 'r' ? x - 10 : x} x2={m.s === 'r' ? x : x + 10} y1={y} y2={y} strokeWidth={m.s === 'r' ? 3 : 1.6} />
              {big && <text x={x + 14} y={y + 4} fill={c} stroke="none" className="ov-num">{(m.v / 1000).toFixed(2)}</text>}
            </g>
          );
        })}
        <text x={x - 4} y={F.y - 10} fill={c} stroke="none" className="ov-tag" textAnchor="end">מודולור</text>
      </g>
    );
  }
  if (id === 'renard') {
    const y = bottom + 22;
    const vals: number[] = [];
    for (const e of [0, 1, 2]) for (const r of R10) { const v = r * 10 ** e; if (v <= Wm * 1.001) vals.push(v); }
    return (
      <g className="ruler-ov" stroke={c}>
        <line x1={F.x} x2={F.x + F.w} y1={y} y2={y} strokeWidth={2} />
        {vals.map((v, i) => {
          const x = F.x + v * k;
          const label = v >= 2 && (i % 2 === 0 || v >= 10);
          return (
            <g key={v}>
              <line x1={x} x2={x} y1={F.y} y2={y} strokeWidth={0.8} strokeDasharray="4 4" opacity={0.4} />
              <line x1={x} x2={x} y1={y - 8} y2={y + 8} strokeWidth={2} />
              {label && <text x={x} y={y + 24} textAnchor="middle" fill={c} stroke="none" className="ov-num">{fmt(v)}</text>}
            </g>
          );
        })}
        <text x={F.x} y={y + 44} fill={c} stroke="none" className="ov-tag">R10</text>
      </g>
    );
  }
  // module: גריד של מטר (10M), וקו חזק כל 3 מטר
  const lines: ReactNode[] = [];
  for (let m = 0; m <= Wm + 1e-6; m += 1) lines.push(<line key={`x${m}`} x1={F.x + m * k} x2={F.x + m * k} y1={F.y} y2={bottom} strokeWidth={m % 3 === 0 ? 1.4 : 0.6} opacity={m % 3 === 0 ? 0.8 : 0.45} />);
  for (let m = 0; m <= Hm + 1e-6; m += 1) lines.push(<line key={`y${m}`} y1={bottom - m * k} y2={bottom - m * k} x1={F.x} x2={F.x + F.w} strokeWidth={m % 3 === 0 ? 1.4 : 0.6} opacity={m % 3 === 0 ? 0.8 : 0.45} />);
  return (
    <g className="ruler-ov" stroke={c}>
      {lines}
      <text x={F.x - 8} y={bottom + 4} fill={c} stroke="none" className="ov-tag" textAnchor="end">10M</text>
    </g>
  );
}

/** קריאה לכל סרגל פעיל: היחס או המידה, והסטייה מהיעד. */
export function readouts(active: SystemId[], ratio: number, widthM: number | null) {
  return active.map((id) => {
    const def = SYSTEM[id];
    if (def.family === 'ratio') {
      const n = nearest(id, ratio);
      return { id, text: `${ratio.toFixed(2)} מול ${n.name}`, dev: n.dev, ok: n.dev <= def.orange };
    }
    if (!widthM) return { id, text: 'דרוש רוחב אמיתי', dev: NaN, ok: false };
    const H = (widthM / ratio) * 1000, W = widthM * 1000;
    const nw = nearest(id, W), nh = nearest(id, H);
    const dev = Math.max(nw.dev, nh.dev);
    return { id, text: `רוחב ${(W / 1000).toFixed(2)}, גובה ${(H / 1000).toFixed(2)} מ'`, dev, ok: dev <= def.orange };
  });
}

interface Props {
  example: ExampleId;
  active: SystemId[];
  photoMode: boolean;
  widthM: number | null;
  onFrame?: (ratio: number, aligned: boolean) => void;
  onPhotoFail?: () => void;
}

export default function Stage({ example, active, photoMode, widthM, onFrame, onPhotoFail }: Props) {
  const ex = EXAMPLES[example];
  const svg = useRef<SVGSVGElement>(null);
  const [img, setImg] = useState<{ w: number; h: number } | null>(null);
  const [failed, setFailed] = useState(false);
  const [frame, setFrame] = useState<Box | null>(null);
  const [drag, setDrag] = useState<null | 'tl' | 'br'>(null);

  const usePhoto = photoMode && !!ex.photo && !failed;
  const PW = 600, PH = img ? (600 * img.h) / img.w : 400;
  const F: Box = usePhoto ? frame ?? { x: PW * 0.08, y: PH * 0.12, w: PW * 0.84, h: PH * 0.76 } : ex.frame;
  const k = usePhoto ? (widthM ? F.w / widthM : null) : ex.widthM ? ex.frame.w / ex.widthM : null;
  const vb = usePhoto ? `-30 -40 ${PW + 110} ${PH + 110}` : `${ex.frame.x - 40} ${ex.frame.y - 50} ${ex.frame.w + 150} ${ex.frame.h + 130}`;

  useEffect(() => { onFrame?.(F.w / F.h, !!frame); }, [F.w, F.h, frame]); // eslint-disable-line react-hooks/exhaustive-deps

  const loc = (e: { clientX: number; clientY: number }) => {
    const el = svg.current!;
    const pt = el.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(el.getScreenCTM()!.inverse());
    return { x: Math.min(PW, Math.max(0, p.x)), y: Math.min(PH, Math.max(0, p.y)) };
  };
  const move = (e: React.PointerEvent) => {
    if (!drag) return;
    const p = loc(e);
    const n = drag === 'tl'
      ? { x: Math.min(p.x, F.x + F.w - 20), y: Math.min(p.y, F.y + F.h - 20), w: F.x + F.w - Math.min(p.x, F.x + F.w - 20), h: F.y + F.h - Math.min(p.y, F.y + F.h - 20) }
      : { x: F.x, y: F.y, w: Math.max(20, p.x - F.x), h: Math.max(20, p.y - F.y) };
    setFrame(n);
  };

  return (
    <svg ref={svg} viewBox={vb} className="stage-svg" style={{ direction: 'ltr' }} onPointerMove={move} onPointerUp={() => setDrag(null)} onPointerLeave={() => setDrag(null)}
      role="img" aria-label={`${ex.name}: ${active.map((a) => SYSTEM[a].name).join(', ') || 'בלי סרגלים'}`}>
      {usePhoto ? (
        <>
          <image href={commonsUrl(ex.photo!.file, 1200)} x={0} y={0} width={PW} height={PH} preserveAspectRatio="xMidYMid meet"
            onLoad={() => { const i = new Image(); i.onload = () => setImg({ w: i.naturalWidth, h: i.naturalHeight }); i.src = commonsUrl(ex.photo!.file, 1200); }}
            onError={() => { setFailed(true); onPhotoFail?.(); }} />
          <rect x={F.x} y={F.y} width={F.w} height={F.h} fill="none" stroke="#fff" strokeWidth={3} />
          <rect x={F.x} y={F.y} width={F.w} height={F.h} fill="none" stroke="var(--ink)" strokeWidth={1.4} strokeDasharray="6 4" />
        </>
      ) : (
        <g className="stage-ink">{ex.draw()}</g>
      )}
      {active.map((id) => <Ruler key={id} id={id} F={F} k={k} />)}
      {usePhoto && (['tl', 'br'] as const).map((h) => (
        <g key={h} className="corner" onPointerDown={(e) => { e.stopPropagation(); (e.target as Element).setPointerCapture?.(e.pointerId); setDrag(h); }}>
          <circle cx={h === 'tl' ? F.x : F.x + F.w} cy={h === 'tl' ? F.y : F.y + F.h} r={16} fill="transparent" />
          <circle cx={h === 'tl' ? F.x : F.x + F.w} cy={h === 'tl' ? F.y : F.y + F.h} r={7} fill="#fff" stroke="var(--ink)" strokeWidth={2.4} />
        </g>
      ))}
      {usePhoto && <a href={commonsPage(ex.photo!.file)} target="_blank" rel="noreferrer"><text x={PW} y={PH + 18} textAnchor="end" className="ov-credit">{ex.photo!.author}, {ex.photo!.year}, {ex.photo!.license}, Wikimedia Commons</text></a>}
    </svg>
  );
}
