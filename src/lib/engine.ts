// מנוע המדידה: דטרמיניסטי, רץ בדפדפן בלי שרת. מכאן נגזרות כל התצוגות.
import { HARMONY, nearest, SYSTEM, SYSTEMS, type SystemId } from './systems';

/** מחקר: חזית או תוכנית. כל המיקומים בשברים (0 עד 1) של המסגרת. */
export interface Study {
  id: string;
  name: string;
  kind: 'facade' | 'plan';
  /** רוחב המסגרת במטרים (קנה מידה) */
  widthM: number;
  /** יחס גובה לרוחב של המסגרת */
  aspect: number;
  /** קווי חלוקה אנכיים, כשבר מרוחב המסגרת */
  vx: number[];
  /** קווי חלוקה אופקיים, כשבר מגובה המסגרת, מלמעלה */
  hy: number[];
  /** רכיבים: חלונות, דלתות, פתחים, חדרים */
  rects: Rect[];
  /** תמונה (dataURL) וחיתוך המסגרת בתוכה, בשברים של התמונה */
  image?: string;
  imgW?: number;
  imgH?: number;
  frame?: { x0: number; x1: number; y0: number; y1: number };
  /** דיוק הסימון, בשבר מממד המסגרת */
  precision: number;
  note?: string;
  guess?: 'low' | 'mid' | 'high';
  example?: boolean;
  updatedAt?: number;
}

export interface Rect {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
}

export type Band = 'ok' | 'near' | 'off';
export type ElKind = 'frame' | 'cell' | 'rect' | 'pair' | 'bay' | 'floor' | 'rectW' | 'rectH';

export interface Measured {
  id: string;
  kind: ElKind;
  label: string;
  /** מה נמדד: יחס או מידה במ"מ */
  value: number;
  unit: 'ratio' | 'mm';
  target: number;
  targetName: string;
  dev: number;
  band: Band;
  /** אי־ודאות מהסימון, בשבר יחסי */
  unc: number;
  /** על הגבול: אי־הוודאות חוצה סף */
  edge: boolean;
  score: number;
  fix: string;
  /** אזור להדגשה בשרטוט, בשברי מסגרת */
  box: { x: number; y: number; w: number; h: number };
}

export interface Result {
  system: SystemId;
  items: Measured[];
  index: number;
  okCount: number;
  nearCount: number;
  offCount: number;
  edgeCount: number;
  meanDev: number;
  worst?: Measured;
}

const sorted = (a: number[]) => [...new Set(a.map((v) => +v.toFixed(5)))].filter((v) => v > 0.002 && v < 0.998).sort((x, y) => x - y);
const bounds = (cuts: number[]) => { const c = [0, ...sorted(cuts), 1]; return c.slice(1).map((b, i) => [c[i], b] as const); };

export const cm = (mm: number) => {
  const v = Math.abs(mm) / 10;
  return v >= 100 ? `${(v / 100).toFixed(2)} מ'` : `${v < 10 ? v.toFixed(1) : Math.round(v)} ס"מ`;
};
export const pct = (f: number) => `${(f * 100).toFixed(f < 0.1 ? 1 : 0)}%`;

function bandOf(system: SystemId, dev: number): Band {
  const s = SYSTEM[system];
  return dev <= s.green ? 'ok' : dev <= s.orange ? 'near' : 'off';
}

/** ציון לרכיב: 100 בסטייה 0, יורד ליניארית עד 0 בפעמיים סף ה"קרוב". */
export const scoreOf = (system: SystemId, dev: number) => Math.max(0, 1 - dev / (2 * SYSTEM[system].orange));

const ORD = ['ראשונה', 'שנייה', 'שלישית', 'רביעית', 'חמישית', 'שישית', 'שביעית', 'שמינית', 'תשיעית', 'עשירית'];
const ord = (i: number) => ORD[i] ?? `${i + 1}`;
const ORD_M = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שביעי', 'שמיני', 'תשיעי', 'עשירי'];
const ordM = (i: number) => ORD_M[i] ?? `${i + 1}`;

export function floorName(i: number, n: number, kind: Study['kind']) {
  if (kind === 'plan') return `רצועה ${ord(i)}`;
  if (i === n - 1) return n > 1 ? 'קומת הקרקע' : 'הקומה';
  if (i === 0) return 'הקומה העליונה';
  return `קומה ${n - 1 - i}`;
}
export function bayName(i: number, n: number) {
  if (n === 1) return 'המפרש';
  return `מפרש ${ordM(i)} מימין`;
}

export function measure(st: Study, system: SystemId): Result {
  const W = st.widthM * 1000;
  const H = W * st.aspect;
  const def = SYSTEM[system];
  const e = Math.max(st.precision, 0.0005);
  const items: Measured[] = [];
  // RTL: המפרש הראשון הוא הימני ביותר
  const bays = bounds(st.vx).reverse();
  const floors = bounds(st.hy);

  const push = (m: Omit<Measured, 'band' | 'edge' | 'score' | 'targetName' | 'target' | 'dev'>) => {
    const n = nearest(system, m.value);
    const dev = n.dev;
    const band = bandOf(system, dev);
    const uncDev = def.id === 'module' ? m.unc * m.value / 100 : m.unc;
    const edge = [def.green, def.orange].some((t) => Math.abs(dev - t) < uncDev);
    items.push({ ...m, target: n.target, targetName: n.name, dev, band, edge, score: scoreOf(system, dev) });
  };

  const ratioFix = (a: number, b: number, aName: string, bName: string, t: number) => {
    // a: רוחב, b: גובה. משנים את הצלע שדורשת את השינוי הקטן ביותר.
    const r = Math.max(a, b) / Math.min(a, b);
    const wide = a >= b;
    const big = wide ? a : b;
    const small = wide ? b : a;
    const bigNew = small * t;
    const smallNew = big / t;
    const dBig = bigNew - big;
    const dSmall = smallNew - small;
    if (Math.abs(r - t) / t < 0.0005) return 'כבר על היעד';
    const useBig = Math.abs(dBig) <= Math.abs(dSmall);
    const d = useBig ? dBig : dSmall;
    const name = (useBig ? wide : !wide) ? aName : bName;
    const verb = name === aName ? (d > 0 ? 'להרחיב' : 'להצר') : d > 0 ? 'להגביה' : 'להנמיך';
    return `${verb} את ${name} ב-${cm(d)}`;
  };

  if (def.family === 'ratio') {
    const unc2 = (a: number, b: number) => e * (W / a + H / b) / 1; // שגיאה יחסית של יחס
    push({ id: 'frame', kind: 'frame', label: st.kind === 'plan' ? 'המסגרת כולה' : 'החזית כולה', value: Math.max(W, H) / Math.min(W, H), unit: 'ratio', unc: unc2(W, H) * 0.5, fix: '', box: { x: 0, y: 0, w: 1, h: 1 } });
    floors.forEach(([y0, y1], fi) => {
      bays.forEach(([x0, x1], bi) => {
        if (bays.length === 1 && floors.length === 1) return;
        const a = (x1 - x0) * W, b = (y1 - y0) * H;
        const lbl = `${floorName(fi, floors.length, st.kind)}, ${bayName(bi, bays.length)}`;
        push({ id: `c${fi}-${bi}`, kind: 'cell', label: lbl, value: Math.max(a, b) / Math.min(a, b), unit: 'ratio', unc: e * (W / a + H / b), fix: '', box: { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } });
      });
    });
    // זוגות סמוכים: קצב המפרשים והקומות
    for (let i = 0; i + 1 < bays.length; i++) {
      const a = (bays[i][1] - bays[i][0]) * W, b = (bays[i + 1][1] - bays[i + 1][0]) * W;
      if (Math.abs(a - b) / Math.max(a, b) < 0.01) continue; // מפרשים שווים: חזרה, לא יחס
      push({ id: `px${i}`, kind: 'pair', label: `${bayName(i, bays.length)} מול ${bayName(i + 1, bays.length).replace('מפרש ', '')}`, value: Math.max(a, b) / Math.min(a, b), unit: 'ratio', unc: e * W * (1 / a + 1 / b), fix: '', box: { x: Math.min(bays[i][0], bays[i + 1][0]), y: 0, w: Math.abs(bays[i][1] - bays[i][0]) + Math.abs(bays[i + 1][1] - bays[i + 1][0]), h: 1 } });
    }
    for (let i = 0; i + 1 < floors.length; i++) {
      const a = (floors[i][1] - floors[i][0]) * H, b = (floors[i + 1][1] - floors[i + 1][0]) * H;
      if (Math.abs(a - b) / Math.max(a, b) < 0.01) continue;
      push({ id: `py${i}`, kind: 'pair', label: `${floorName(i, floors.length, st.kind)} מול ${floorName(i + 1, floors.length, st.kind)}`, value: Math.max(a, b) / Math.min(a, b), unit: 'ratio', unc: e * H * (1 / a + 1 / b), fix: '', box: { x: 0, y: floors[i][0], w: 1, h: floors[i + 1][1] - floors[i][0] } });
    }
    st.rects.forEach((r, i) => {
      const a = r.w * W, b = r.h * H;
      push({ id: `r${r.id}`, kind: 'rect', label: r.label || `רכיב ${i + 1}`, value: Math.max(a, b) / Math.min(a, b), unit: 'ratio', unc: e * (W / a + H / b), fix: '', box: { x: r.x, y: r.y, w: r.w, h: r.h } });
    });
    // תיקון מוצע
    for (const m of items) {
      const a = m.box.w * W, b = m.box.h * H;
      if (m.kind === 'pair') {
        const isX = m.id.startsWith('px');
        const i = +m.id.slice(2);
        const segs = isX ? bays : floors;
        const D = isX ? W : H;
        const s1 = (segs[i][1] - segs[i][0]) * D, s2 = (segs[i + 1][1] - segs[i + 1][0]) * D;
        const small = Math.min(s1, s2), big = Math.max(s1, s2);
        const d = big / m.target - small;
        const who = s1 < s2 ? (isX ? bayName(i, segs.length) : floorName(i, segs.length, st.kind)) : isX ? bayName(i + 1, segs.length) : floorName(i + 1, segs.length, st.kind);
        const verb = isX ? (d > 0 ? 'להרחיב' : 'להצר') : d > 0 ? 'להגביה' : 'להנמיך';
        m.fix = m.band === 'ok' ? 'כבר בתחום' : `${verb} את ${who} ב-${cm(d)}`;
      } else {
        m.fix = m.band === 'ok' ? 'כבר בתחום' : ratioFix(a, b, 'הרוחב', 'הגובה', m.target);
      }
    }
  } else {
    const uncMM = (D: number) => e * D; // שגיאה מוחלטת
    bays.forEach(([x0, x1], i) => {
      const v = (x1 - x0) * W;
      push({ id: `b${i}`, kind: 'bay', label: `רוחב ${bayName(i, bays.length)}`, value: v, unit: 'mm', unc: uncMM(W) / v, fix: '', box: { x: x0, y: 0, w: x1 - x0, h: 1 } });
    });
    floors.forEach(([y0, y1], i) => {
      const v = (y1 - y0) * H;
      push({ id: `f${i}`, kind: 'floor', label: `גובה ${floorName(i, floors.length, st.kind)}`, value: v, unit: 'mm', unc: uncMM(H) / v, fix: '', box: { x: 0, y: y0, w: 1, h: y1 - y0 } });
    });
    st.rects.forEach((r, i) => {
      const lbl = r.label || `רכיב ${i + 1}`;
      const vw = r.w * W, vh = r.h * H;
      push({ id: `rw${r.id}`, kind: 'rectW', label: `רוחב ${lbl}`, value: vw, unit: 'mm', unc: uncMM(W) / vw, fix: '', box: { x: r.x, y: r.y, w: r.w, h: r.h } });
      push({ id: `rh${r.id}`, kind: 'rectH', label: `גובה ${lbl}`, value: vh, unit: 'mm', unc: uncMM(H) / vh, fix: '', box: { x: r.x, y: r.y, w: r.w, h: r.h } });
    });
    for (const m of items) {
      const d = m.target - m.value;
      const isW = m.kind === 'bay' || m.kind === 'rectW';
      const verb = isW ? (d > 0 ? 'להרחיב' : 'להצר') : d > 0 ? 'להגביה' : 'להנמיך';
      m.fix = m.band === 'ok' ? 'כבר בתחום' : `${verb} ב-${cm(d)}, ל-${cm(m.target)}`;
    }
  }

  const n = items.length || 1;
  const index = Math.round((100 * items.reduce((s, m) => s + m.score, 0)) / n);
  const worst = [...items].sort((a, b) => b.dev - a.dev)[0];
  return {
    system,
    items,
    index: items.length ? index : 0,
    okCount: items.filter((m) => m.band === 'ok').length,
    nearCount: items.filter((m) => m.band === 'near').length,
    offCount: items.filter((m) => m.band === 'off').length,
    edgeCount: items.filter((m) => m.edge).length,
    meanDev: items.reduce((s, m) => s + m.dev, 0) / n,
    worst,
  };
}

export function measureAll(st: Study) {
  return SYSTEMS.map((s) => measure(st, s.id));
}

/** קריאה מחושבת: תובנה ומשפט הסבר, לפי תקן הזיקוק. תמיד זמינה, בלי מודל. */
export function computedReading(st: Study, res: Result, all: Result[]) {
  const def = SYSTEM[res.system];
  const best = bestOf(all);
  const insight =
    res.index >= 80 ? `**${def.name}** מסביר את הקומפוזיציה היטב.` : res.index >= 55 ? `קרוב ל**${def.short}**, עם סטיות מקומיות.` : `הקומפוזיציה **לא נשענת** על ${def.short}.`;
  const w = res.worst;
  const detail = w
    ? `הסטייה הגדולה: **${w.label}**, ${w.unit === 'ratio' ? `יחס ${w.value.toFixed(2)}` : cm(w.value)} מול ${w.targetName}, **${pct(w.dev)}**.`
    : 'אין רכיבים למדידה. הוסיפו קווי חלוקה או רכיבים.';
  const cross = best.system !== res.system ? `==${SYSTEM[best.system].name} מסביר טוב יותר: ${best.index}%.==` : `==זו השיטה שמסבירה את ${st.kind === 'plan' ? 'התוכנית' : 'החזית'} הכי טוב.==`;
  return { insight, detail, cross };
}

export function bandColor(b: Band) {
  return b === 'ok' ? 'var(--ok)' : b === 'near' ? 'var(--near)' : 'var(--off)';
}
export const BAND_NAME: Record<Band, string> = { ok: 'מדויק', near: 'קרוב', off: 'סוטה' };

/** השיטה שמסבירה הכי טוב: רק משיטות ההרמוניה, לא מודול הבנייה. */
export const bestOf = (all: Result[]) => [...all].filter((r) => HARMONY.includes(r.system)).sort((a, b) => b.index - a.index)[0];
export const worstOf = (all: Result[]) => [...all].filter((r) => HARMONY.includes(r.system)).sort((a, b) => a.index - b.index)[0];
