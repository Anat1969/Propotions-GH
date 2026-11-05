// מסך יישור הפרספקטיבה: גוררים ארבע פינות אל קצות החזית, ורשת חיה מראה איך היא תיושר.
import { useRef, useState } from 'react';
import { apply, homography, type Pt } from '../lib/rectify';

interface Props {
  image: string;
  w: number;
  h: number;
  initial?: Pt[];
  busy: boolean;
  onApply: (quad: Pt[]) => void;
  onCancel: () => void;
}

const NAMES = ['פינה שמאלית עליונה', 'פינה ימנית עליונה', 'פינה ימנית תחתונה', 'פינה שמאלית תחתונה'];

export default function Rectify({ image, w, h, initial, busy, onApply, onCancel }: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const [q, setQ] = useState<Pt[]>(initial ?? [
    { x: w * 0.12, y: h * 0.1 }, { x: w * 0.88, y: h * 0.14 }, { x: w * 0.9, y: h * 0.9 }, { x: w * 0.1, y: h * 0.86 },
  ]);
  const [drag, setDrag] = useState<number | null>(null);
  const U = Math.max(w, h) / 1000;

  const loc = (e: { clientX: number; clientY: number }) => {
    const el = svg.current!;
    const pt = el.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(el.getScreenCTM()!.inverse());
    return { x: Math.min(w, Math.max(0, p.x)), y: Math.min(h, Math.max(0, p.y)) };
  };

  // רשת 6x6 שמוטלת מהמלבן אל המרובע: רואים מראש את היישור
  const H = homography([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }], q);
  const grid: string[] = [];
  for (let i = 1; i < 6; i++) {
    const t = i / 6;
    const a = apply(H, { x: t, y: 0 }), b = apply(H, { x: t, y: 1 });
    const c = apply(H, { x: 0, y: t }), d = apply(H, { x: 1, y: t });
    grid.push(`M${a.x} ${a.y}L${b.x} ${b.y}`, `M${c.x} ${c.y}L${d.x} ${d.y}`);
  }
  const p = Math.max(w, h) * 0.04;

  return (
    <div className="rectify">
      <svg
        ref={svg}
        className="drawing rect-svg"
        viewBox={`${-p} ${-p} ${w + 2 * p} ${h + 2 * p}`}
        onPointerMove={(e) => { if (drag !== null) { const n = [...q]; n[drag] = loc(e); setQ(n); } }}
        onPointerUp={() => setDrag(null)}
        onPointerLeave={() => setDrag(null)}
        style={{ direction: 'ltr' }}
        role="img"
        aria-label="יישור פרספקטיבה: גוררים את ארבע הפינות אל קצות החזית"
      >
        <image href={image} x={0} y={0} width={w} height={h} preserveAspectRatio="none" />
        <path d={`M0 0H${w}V${h}H0Z M${q.map((c) => `${c.x} ${c.y}`).join('L')}Z`} fill="rgba(255,255,255,.62)" fillRule="evenodd" />
        <path d={grid.join('')} stroke="var(--gold)" strokeWidth={1.4 * U} fill="none" strokeDasharray={`${6 * U} ${4 * U}`} />
        <polygon points={q.map((c) => `${c.x},${c.y}`).join(' ')} fill="none" stroke="var(--ink)" strokeWidth={3 * U} />
        {q.map((c, i) => (
          <g key={i} className="corner" onPointerDown={(e) => { e.stopPropagation(); (e.target as Element).setPointerCapture?.(e.pointerId); setDrag(i); }}>
            <circle cx={c.x} cy={c.y} r={26 * U} fill="transparent" />
            <circle cx={c.x} cy={c.y} r={11 * U} fill="#fff" stroke="var(--ink)" strokeWidth={3 * U} />
            <circle cx={c.x} cy={c.y} r={3.5 * U} fill="var(--gold)" />
            <title>{NAMES[i]}</title>
          </g>
        ))}
      </svg>
      <div className="rectify-bar">
        <p className="explain"><b>יישור פרספקטיבה:</b> גוררים כל פינה אל קצה החזית. הרשת הזהובה מראה איך היא תיושר.</p>
        <button className="press btn tb-primary" onClick={() => onApply(q)} disabled={busy}>{busy ? 'מיישר...' : 'יישור'}</button>
        <button className="press btn" onClick={onCancel} disabled={busy}>ביטול</button>
      </div>
    </div>
  );
}
