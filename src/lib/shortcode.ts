// "הקוד הקצר": שיטה שהציע Claude, 2026. השאלה איננה איזה יחס, אלא כמה יחסים שונים צריך כדי לתאר את הקומפוזיציה.
// כל יחסי הקומפוזיציה (מסגרת, תאים, זוגות, רכיבים) מקובצים למשפחות בסבולת של 3%.
// מדד = 100 × (1 − ln k / ln n), כאשר n מספר היחסים ו-k מספר המשפחות. משפחה אחת: 100. כל יחס לבד: 0.
// השורש: Birkhoff, Aesthetic Measure, 1933 (סדר חלקי מורכבות), ועקרון אורך התיאור המינימלי.
import { measure, type Study } from './engine';

export const FAMILY_TOL = 0.03;

export interface ShortCode {
  n: number;
  k: number;
  index: number;
  families: { ratio: number; count: number }[];
}

export function shortCode(st: Study): ShortCode {
  const ratios = measure(st, 'golden').items.map((m) => m.value).sort((a, b) => a - b);
  const fam: number[][] = [];
  for (const r of ratios) {
    const last = fam[fam.length - 1];
    if (last && (r - last[0]) / last[0] <= FAMILY_TOL) last.push(r);
    else fam.push([r]);
  }
  const n = ratios.length;
  const k = fam.length;
  const index = n <= 1 ? 100 : Math.round(100 * (1 - Math.log(k) / Math.log(n)));
  return {
    n, k, index,
    families: fam.map((f) => ({ ratio: f.reduce((s, v) => s + v, 0) / f.length, count: f.length })).sort((a, b) => b.count - a.count),
  };
}
