// קריאה לפונקציית Edge: Gemini החינמי קודם, Claude כגיבוי. המפתחות לא מגיעים לדפדפן.
import type { Result, Study } from './engine';
import { SYSTEM } from './systems';

const URL_FN = 'https://ktqmwpbzcnzkhjskqisy.supabase.co/functions/v1/proportion-read';
// מפתח ציבורי (anon) של הפרויקט: מותר בדפדפן, ההרשאות נאכפות בשרת.
const ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0cW13cGJ6Y256a2hqc2txaXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxODM4OTgsImV4cCI6MjEwNTc1OTg5OH0.uPKn4hrLk16jhDoajMjPl4OmV5j1b3bMIECVmOdhWGI';

export interface Part { insight: string; detail: string }
export interface Reading { reading: Part; actions: string[]; engine: string }
export interface Detected { frame: { x0: number; x1: number; y0: number; y1: number }; vx: number[]; hy: number[]; rects: { x: number; y: number; w: number; h: number; label?: string }[]; engine: string }

async function call<T>(body: unknown): Promise<T> {
  const r = await fetch(URL_FN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: ANON, Authorization: `Bearer ${ANON}` },
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(j.error || `השרת החזיר ${r.status}. נסו שוב בעוד דקה.`);
  return j as T;
}

export function askReading(st: Study, res: Result, all: Result[]) {
  const summary = {
    kind: st.kind === 'plan' ? 'תוכנית' : 'חזית',
    widthM: st.widthM,
    heightM: +(st.widthM * st.aspect).toFixed(2),
    system: SYSTEM[res.system].name,
    index: res.index,
    counts: { ok: res.okCount, near: res.nearCount, off: res.offCount, edge: res.edgeCount },
    worst: [...res.items].sort((a, b) => b.dev - a.dev).slice(0, 5).map((m) => ({ label: m.label, value: m.unit === 'ratio' ? +m.value.toFixed(3) : Math.round(m.value), unit: m.unit, target: m.targetName, devPct: +(m.dev * 100).toFixed(1), fix: m.fix })),
    systems: all.map((r) => ({ name: SYSTEM[r.system].name, index: r.index })),
  };
  return call<Reading>({ mode: 'read', summary });
}

/** תמונה מוקטנת ל-1024 פיקסלים, נשלחת לזיהוי קווי חלוקה. */
export async function askDetect(dataUrl: string): Promise<Detected> {
  const img = new Image();
  await new Promise((ok, bad) => { img.onload = ok; img.onerror = bad; img.src = dataUrl; });
  const k = Math.min(1, 1024 / Math.max(img.width, img.height));
  const c = document.createElement('canvas');
  c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
  c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
  const b64 = c.toDataURL('image/jpeg', 0.8).split(',')[1];
  return call<Detected>({ mode: 'detect', image: b64 });
}
