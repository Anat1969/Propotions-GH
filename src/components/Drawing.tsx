// השרטוט החי: החזית או התוכנית, קווי החלוקה, הרכיבים ושכבת הסטייה עליהם.
// כל המיקומים נשמרים בשברים של המסגרת, כך שהמנוע לא תלוי בגודל המסך.
import { useRef, useState, type PointerEvent as RPE } from 'react';
import { bandColor, pct, type Measured, type Result, type Study } from '../lib/engine';
import { SYSTEM } from '../lib/systems';
import { newId } from '../lib/store';

export type Tool = 'select' | 'v' | 'h' | 'rect' | 'erase';

interface Props {
  study: Study;
  result: Result;
  tool: Tool;
  guides: boolean;
  selected: string | null;
  onSelect: (id: string | null) => void;
  onChange: (s: Study) => void;
}

type Drag =
  | { t: 'v' | 'h'; i: number }
  | { t: 'edge'; e: 'x0' | 'x1' | 'y0' | 'y1' }
  | { t: 'rect'; x: number; y: number; cur?: { x: number; y: number } }
  | { t: 'move'; id: string; dx: number; dy: number };

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export default function Drawing({ study, result, tool, guides, selected, onSelect, onChange }: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [hover, setHover] = useState<string | null>(null);

  // מערכת קואורדינטות: המסגרת היא FX,FY,FW,FH ביחידות viewBox
  const hasImg = !!study.image && !!study.imgW;
  const iw = study.imgW ?? 1000;
  const ih = study.imgH ?? 600;
  const fr = study.frame ?? { x0: 0.05, x1: 0.95, y0: 0.05, y1: 0.95 };
  let FX: number, FY: number, FW: number, FH: number, VB: string;
  if (hasImg) {
    FX = fr.x0 * iw; FY = fr.y0 * ih; FW = (fr.x1 - fr.x0) * iw; FH = (fr.y1 - fr.y0) * ih;
    const p = Math.max(iw, ih) * 0.07;
    VB = `${-p} ${-p} ${iw + 2 * p} ${ih + 2 * p}`;
  } else {
    FW = 1000; FH = 1000 * study.aspect; FX = 0; FY = 0;
    VB = `-90 -90 ${FW + 180} ${FH + 160}`;
  }
  const U = Math.max(FW, FH) / 1000; // יחידת קו
  const W = study.widthM * 1000;
  const H = W * study.aspect;

  const toLocal = (e: { clientX: number; clientY: number }) => {
    const el = svg.current!;
    const pt = el.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(el.getScreenCTM()!.inverse());
    return { x: (p.x - FX) / FW, y: (p.y - FY) / FH, ix: p.x / iw, iy: p.y / ih };
  };

  const byId = new Map(result.items.map((m) => [m.id, m]));
  const active = selected ?? hover;
  const activeItem = active ? byId.get(active) : undefined;

  const set = (patch: Partial<Study>) => onChange({ ...study, ...patch, updatedAt: Date.now() });

  const down = (e: RPE<SVGSVGElement>) => {
    const p = toLocal(e);
    const inside = p.x > 0 && p.x < 1 && p.y > 0 && p.y < 1;
    if (tool === 'v' && inside) { set({ vx: [...study.vx, clamp(p.x)] }); return; }
    if (tool === 'h' && inside) { set({ hy: [...study.hy, clamp(p.y)] }); return; }
    if (tool === 'rect' && inside) { (e.target as Element).setPointerCapture?.(e.pointerId); setDrag({ t: 'rect', x: p.x, y: p.y }); return; }
    if (tool === 'select' && !(e.target as Element).closest('[data-hit]')) onSelect(null);
  };
  const move = (e: RPE<SVGSVGElement>) => {
    if (!drag) return;
    const p = toLocal(e);
    if (drag.t === 'v') { const vx = [...study.vx]; vx[drag.i] = clamp(p.x, 0.003, 0.997); set({ vx }); }
    else if (drag.t === 'h') { const hy = [...study.hy]; hy[drag.i] = clamp(p.y, 0.003, 0.997); set({ hy }); }
    else if (drag.t === 'rect') setDrag({ ...drag, cur: { x: clamp(p.x), y: clamp(p.y) } });
    else if (drag.t === 'move') {
      set({ rects: study.rects.map((r) => (r.id === drag.id ? { ...r, x: clamp(p.x - drag.dx, 0, 1 - r.w), y: clamp(p.y - drag.dy, 0, 1 - r.h) } : r)) });
    } else if (drag.t === 'edge') {
      const f = { ...fr };
      if (drag.e === 'x0') f.x0 = clamp(p.ix, 0, f.x1 - 0.05);
      if (drag.e === 'x1') f.x1 = clamp(p.ix, f.x0 + 0.05, 1);
      if (drag.e === 'y0') f.y0 = clamp(p.iy, 0, f.y1 - 0.05);
      if (drag.e === 'y1') f.y1 = clamp(p.iy, f.y0 + 0.05, 1);
      set({ frame: f, aspect: ((f.y1 - f.y0) * ih) / ((f.x1 - f.x0) * iw) });
    }
  };
  const up = () => {
    if (drag?.t === 'rect' && drag.cur) {
      const x = Math.min(drag.x, drag.cur.x), y = Math.min(drag.y, drag.cur.y);
      const w = Math.abs(drag.cur.x - drag.x), h = Math.abs(drag.cur.y - drag.y);
      if (w > 0.01 && h > 0.01) {
        const id = newId();
        set({ rects: [...study.rects, { id, x, y, w, h, label: `רכיב ${study.rects.length + 1}` }] });
        onSelect(SYSTEM[result.system].family === 'ratio' ? `r${id}` : `rw${id}`);
      }
    }
    setDrag(null);
  };

  const lineDown = (t: 'v' | 'h', i: number) => (e: RPE) => {
    e.stopPropagation();
    if (tool === 'erase') { set(t === 'v' ? { vx: study.vx.filter((_, k) => k !== i) } : { hy: study.hy.filter((_, k) => k !== i) }); return; }
    if (tool === 'select') { (e.target as Element).setPointerCapture?.(e.pointerId); setDrag({ t, i }); }
  };
  const rectDown = (id: string) => (e: RPE) => {
    const r = study.rects.find((q) => q.id === id)!;
    const fam = SYSTEM[result.system].family;
    if (tool === 'erase') { e.stopPropagation(); set({ rects: study.rects.filter((q) => q.id !== id) }); return; }
    if (tool === 'select') {
      e.stopPropagation();
      onSelect(fam === 'ratio' ? `r${id}` : `rw${id}`);
      const p = toLocal(e);
      (e.target as Element).setPointerCapture?.(e.pointerId);
      setDrag({ t: 'move', id, dx: p.x - r.x, dy: p.y - r.y });
    }
  };

  const X = (f: number) => FX + f * FW;
  const Y = (f: number) => FY + f * FH;
  const sv = [...study.vx].map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
  const sh = [...study.hy].map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
  const cuts = (a: number[]) => [0, ...a.filter((v) => v > 0.002 && v < 0.998).sort((p, q) => p - q), 1];
  const cx = cuts(study.vx);
  const cy = cuts(study.hy);
  const fam = SYSTEM[result.system].family;
  const fs = 15 * U; // גודל תווית
  // ב-SVG רק מספרים (מטרים), בלי עברית באותו אלמנט: מונע בלבול כיווניות
  const m2 = (mm: number) => (mm / 1000).toFixed(2);

  const cells = result.items.filter((m) => m.kind === 'cell');
  const isActive = (m: Measured) => active === m.id;
  const dim = !!activeItem;

  const label = (m: Measured) => (m.unit === 'ratio' ? m.value.toFixed(2) : m2(m.value));

  return (
    <svg
      ref={svg}
      className={`drawing tool-${tool}`}
      viewBox={VB}
      preserveAspectRatio="xMidYMid meet"
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerLeave={up}
      role="img"
      aria-label={`${study.name}: מדד ההרמוניה ${result.index}% לפי ${SYSTEM[result.system].name}`}
      style={{ direction: 'ltr' }}
    >
      <defs>
        <pattern id="mm" width={10 * U} height={10 * U} patternUnits="userSpaceOnUse">
          <path d={`M ${10 * U} 0 L 0 0 0 ${10 * U}`} fill="none" stroke="var(--grid)" strokeWidth={U * 0.8} />
        </pattern>
        <filter id="lift" x="-5%" y="-5%" width="110%" height="115%">
          <feDropShadow dx="0" dy={6 * U} stdDeviation={8 * U} floodColor="#1A1A18" floodOpacity=".12" />
        </filter>
      </defs>

      {/* בסיס: תמונה או שרטוט סכמטי */}
      {hasImg ? (
        <image href={study.image} x={0} y={0} width={iw} height={ih} preserveAspectRatio="none" opacity={0.9} />
      ) : (
        <g>
          <rect x={FX - 60 * U} y={FY - 60 * U} width={FW + 120 * U} height={FH + 120 * U} fill="url(#mm)" />
          <rect x={FX} y={FY} width={FW} height={FH} fill="#FAFAF8" stroke="var(--ink)" strokeWidth={study.kind === 'plan' ? 6 * U : 2 * U} filter="url(#lift)" />
          {study.kind === 'facade' && <line x1={FX - 40 * U} x2={FX + FW + 40 * U} y1={FY + FH} y2={FY + FH} stroke="var(--ink)" strokeWidth={3 * U} />}
        </g>
      )}

      {/* מסגרת המדידה בתמונה */}
      {hasImg && <rect x={FX} y={FY} width={FW} height={FH} fill="none" stroke="var(--ink)" strokeWidth={2.5 * U} strokeDasharray={`${8 * U} ${5 * U}`} />}

      {/* שכבת הסטייה: תאים (שיטות יחס) */}
      {fam === 'ratio' &&
        cells.map((m) => (
          <rect
            key={m.id}
            data-hit
            className="cell"
            x={X(m.box.x)} y={Y(m.box.y)} width={m.box.w * FW} height={m.box.h * FH}
            fill={bandColor(m.band)}
            fillOpacity={isActive(m) ? 0.3 : dim ? 0.04 : 0.11}
            stroke={isActive(m) ? bandColor(m.band) : 'none'}
            strokeWidth={4 * U}
            onPointerEnter={() => setHover(m.id)}
            onPointerLeave={() => setHover(null)}
            onPointerDown={(e) => { if (tool === 'select') { e.stopPropagation(); onSelect(m.id === selected ? null : m.id); } }}
          />
        ))}
      {fam === 'size' && activeItem && (activeItem.kind === 'bay' || activeItem.kind === 'floor') && (
        <rect x={X(activeItem.box.x)} y={Y(activeItem.box.y)} width={activeItem.box.w * FW} height={activeItem.box.h * FH} fill={bandColor(activeItem.band)} fillOpacity={0.22} pointerEvents="none" />
      )}
      {fam === 'ratio' && activeItem && activeItem.kind === 'pair' && (
        <rect x={X(activeItem.box.x)} y={Y(activeItem.box.y)} width={activeItem.box.w * FW} height={activeItem.box.h * FH} fill="none" stroke={bandColor(activeItem.band)} strokeWidth={5 * U} pointerEvents="none" />
      )}

      {/* קווי ויסות: חתכי זהב ואלכסוני המסגרת */}
      {guides && (
        <g className="guides" pointerEvents="none" stroke="var(--gold)" strokeWidth={1.6 * U} strokeDasharray={`${10 * U} ${6 * U}`} fill="none">
          {[0.382, 0.618].map((g) => <line key={`gx${g}`} x1={X(g)} x2={X(g)} y1={FY - 20 * U} y2={FY + FH + 20 * U} />)}
          {[0.382, 0.618].map((g) => <line key={`gy${g}`} y1={Y(g)} y2={Y(g)} x1={FX - 20 * U} x2={FX + FW + 20 * U} />)}
          <line x1={FX} y1={FY + FH} x2={FX + FW} y2={FY} strokeDasharray="none" strokeOpacity=".5" />
          <line x1={FX} y1={FY} x2={FX + FW} y2={FY + FH} strokeDasharray="none" strokeOpacity=".5" />
          {sv.filter(({ v }) => Math.abs(v - 0.382) < 0.01 || Math.abs(v - 0.618) < 0.01).map(({ v, i }) => <circle key={`hit${i}`} cx={X(v)} cy={FY - 20 * U} r={7 * U} fill="var(--gold)" stroke="none" />)}
          {sh.filter(({ v }) => Math.abs(v - 0.382) < 0.01 || Math.abs(v - 0.618) < 0.01).map(({ v, i }) => <circle key={`hity${i}`} cx={FX - 20 * U} cy={Y(v)} r={7 * U} fill="var(--gold)" stroke="none" />)}
        </g>
      )}

      {/* קווי חלוקה */}
      {sv.map(({ v, i }) => (
        <g key={`v${i}`} data-hit className="divline" onPointerDown={lineDown('v', i)}>
          <line x1={X(v)} x2={X(v)} y1={FY} y2={FY + FH} stroke="var(--ink)" strokeWidth={2.2 * U} />
          <line x1={X(v)} x2={X(v)} y1={FY} y2={FY + FH} stroke="transparent" strokeWidth={14 * U} />
        </g>
      ))}
      {sh.map(({ v, i }) => (
        <g key={`h${i}`} data-hit className="divline" onPointerDown={lineDown('h', i)}>
          <line y1={Y(v)} y2={Y(v)} x1={FX} x2={FX + FW} stroke="var(--ink)" strokeWidth={2.2 * U} />
          <line y1={Y(v)} y2={Y(v)} x1={FX} x2={FX + FW} stroke="transparent" strokeWidth={14 * U} />
        </g>
      ))}

      {/* רכיבים */}
      {study.rects.map((r) => {
        const m = byId.get(`r${r.id}`) ?? byId.get(`rw${r.id}`);
        const mh = byId.get(`rh${r.id}`);
        const band = fam === 'size' && mh && m ? (m.dev > mh.dev ? m.band : mh.band) : m?.band ?? 'ok';
        const on = active === `r${r.id}` || active === `rw${r.id}` || active === `rh${r.id}`;
        return (
          <g key={r.id} data-hit className="rect" onPointerDown={rectDown(r.id)} onPointerEnter={() => setHover(fam === 'ratio' ? `r${r.id}` : `rw${r.id}`)} onPointerLeave={() => setHover(null)}>
            <rect x={X(r.x)} y={Y(r.y)} width={r.w * FW} height={r.h * FH} fill={hasImg ? bandColor(band) : '#E6EBF0'} fillOpacity={hasImg ? (on ? 0.3 : 0.12) : on ? 1 : dim ? 0.5 : 0.95} stroke={bandColor(band)} strokeWidth={(on ? 5 : 2.5) * U} />
          </g>
        );
      })}

      {/* ידיות המסגרת בתמונה */}
      {hasImg && tool === 'select' && (
        <g className="frame-handles">
          {(['x0', 'x1'] as const).map((k) => (
            <rect key={k} data-hit x={(k === 'x0' ? FX : FX + FW) - 7 * U} y={FY + FH / 2 - 30 * U} width={14 * U} height={60 * U} fill="var(--ink)" onPointerDown={(e) => { e.stopPropagation(); (e.target as Element).setPointerCapture?.(e.pointerId); setDrag({ t: 'edge', e: k }); }} />
          ))}
          {(['y0', 'y1'] as const).map((k) => (
            <rect key={k} data-hit x={FX + FW / 2 - 30 * U} y={(k === 'y0' ? FY : FY + FH) - 7 * U} width={60 * U} height={14 * U} fill="var(--ink)" onPointerDown={(e) => { e.stopPropagation(); (e.target as Element).setPointerCapture?.(e.pointerId); setDrag({ t: 'edge', e: k }); }} />
          ))}
        </g>
      )}

      {/* שרשרת מידות: מפרשים למעלה, קומות בצד */}
      <g className="dims" pointerEvents="none" fontFamily="var(--mono)" fontSize={fs}>
        {cx.slice(1).map((b, i) => {
          const a = cx[i];
          const mm = (b - a) * W;
          const mid = X((a + b) / 2);
          const bayIdx = cx.length - 2 - i; // RTL: מפרש ראשון מימין
          const m = byId.get(`b${bayIdx}`);
          const wide = (b - a) * FW > fs * 3.4;
          return (
            <g key={`dx${i}`}>
              <line x1={X(a)} x2={X(b)} y1={FY - 34 * U} y2={FY - 34 * U} stroke={m ? bandColor(m.band) : 'var(--ink-mute)'} strokeWidth={(m ? 5 : 1.4) * U} />
              <line x1={X(a)} x2={X(a)} y1={FY - 44 * U} y2={FY - 24 * U} stroke="var(--ink-mute)" strokeWidth={1.4 * U} />
              {wide && <text x={mid} y={FY - 46 * U} textAnchor="middle" fill="var(--ink-soft)">{m2(mm)}</text>}
            </g>
          );
        })}
        {cy.slice(1).map((b, i) => {
          const a = cy[i];
          const mm = (b - a) * H;
          const m = byId.get(`f${i}`);
          const tall = (b - a) * FH > fs * 1.6;
          return (
            <g key={`dy${i}`}>
              <line y1={Y(a)} y2={Y(b)} x1={FX + FW + 34 * U} x2={FX + FW + 34 * U} stroke={m ? bandColor(m.band) : 'var(--ink-mute)'} strokeWidth={(m ? 5 : 1.4) * U} />
              <line y1={Y(a)} y2={Y(a)} x1={FX + FW + 24 * U} x2={FX + FW + 44 * U} stroke="var(--ink-mute)" strokeWidth={1.4 * U} />
              {tall && <text x={FX + FW + 50 * U} y={Y((a + b) / 2) + fs * 0.35} textAnchor="start" fill="var(--ink-soft)">{m2(mm)}</text>}
            </g>
          );
        })}
      </g>

      {/* תוויות יחס: בתאים בפינה הימנית העליונה, ברכיבים במרכז */}
      {fam === 'ratio' && (
        <g pointerEvents="none" fontFamily="var(--mono)">
          {cells.map((m) => {
            const w = m.box.w * FW, h = m.box.h * FH;
            if (w < fs * 4.6 || h < fs * 2.8) return null;
            const x = X(m.box.x) + w - fs * 0.6, y = Y(m.box.y) + fs * 1.45;
            return (
              <g key={`t${m.id}`} opacity={dim && !isActive(m) ? 0.35 : 1} textAnchor="end">
                <text x={x} y={y} fontSize={fs * 1.15} fontWeight={600} fill="var(--ink)">{label(m)}</text>
                <text x={x} y={y + fs * 1.05} fontSize={fs * 0.8} fill={bandColor(m.band)}>{pct(m.dev)}</text>
              </g>
            );
          })}
          {study.rects.map((r) => {
            const m = byId.get(`r${r.id}`);
            const w = r.w * FW, h = r.h * FH;
            if (!m || w < fs * 3.6 || h < fs * 2.6) return null;
            return (
              <g key={`tr${r.id}`} opacity={dim && !isActive(m) ? 0.35 : 1} textAnchor="middle">
                <text x={X(r.x) + w / 2} y={Y(r.y) + h / 2} fontSize={fs * 1.05} fontWeight={600} fill="var(--ink)">{label(m)}</text>
                <text x={X(r.x) + w / 2} y={Y(r.y) + h / 2 + fs * 1.05} fontSize={fs * 0.8} fill={bandColor(m.band)}>{pct(m.dev)}</text>
              </g>
            );
          })}
        </g>
      )}

      {/* רכיב בציור */}
      {drag?.t === 'rect' && drag.cur && (
        <rect x={X(Math.min(drag.x, drag.cur.x))} y={Y(Math.min(drag.y, drag.cur.y))} width={Math.abs(drag.cur.x - drag.x) * FW} height={Math.abs(drag.cur.y - drag.y) * FH} fill="none" stroke="var(--ink)" strokeDasharray={`${6 * U} ${4 * U}`} strokeWidth={2 * U} />
      )}

      {/* כיתוב הרכיב הפעיל */}
      {activeItem && (
        <g pointerEvents="none" fontFamily="var(--mono)">
          <text x={FX + FW / 2} y={FY + FH + 62 * U} textAnchor="middle" fontSize={fs * 1.15} fill="var(--ink)">
            {`${label(activeItem)} → ${activeItem.unit === 'ratio' ? activeItem.target.toFixed(3) : m2(activeItem.target)}  ·  ${pct(activeItem.dev)}`}
          </text>
        </g>
      )}
    </svg>
  );
}
