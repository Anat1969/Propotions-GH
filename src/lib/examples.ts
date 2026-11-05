// דוגמאות סכמטיות להדגמה. המידות נקבעו לצורך ההדגמה, לא מדידה של בניין קיים.
import { PHI } from './systems';
import type { Study, Rect } from './engine';

const win = (id: string, x: number, y: number, w: number, h: number, label?: string): Rect => ({ id, x, y, w, h, label });

// 1. חזית בחלוקה זהובה: גובה = רוחב / φ, קומות וחלונות מתוכננים לפי φ.
const gW = 12;
const gH = gW / PHI; // 7.416
const gFloors = [1 - 1 / PHI]; // קומה עליונה 0.382 מהגובה
const classic: Study = {
  id: 'ex-golden',
  name: 'חזית בחלוקה זהובה',
  kind: 'facade',
  widthM: gW,
  aspect: gH / gW,
  vx: [1 - 1 / PHI, 1 / PHI],
  hy: gFloors,
  rects: [
    win('w1', 0.12, 0.5, 0.14, 0.14 * gW * PHI / gH, 'חלון שמאל'),
    win('w2', 0.441, 0.52, 0.118, 0.36, 'דלת הכניסה'),
    win('w3', 0.74, 0.5, 0.14, 0.14 * gW * PHI / gH, 'חלון ימין'),
  ],
  precision: 0.001,
  example: true,
};

// 2. בניין מגורים טיפוסי בן 4 קומות על עמודים, עם חזית מסחרית (סכמה בהשראת רחוב מגורים באשדוד).
const rW = 18;
const rH = 15.2;
const residential: Study = {
  id: 'ex-residential',
  name: 'בניין מגורים בן 4 קומות',
  kind: 'facade',
  widthM: rW,
  aspect: rH / rW,
  vx: [5.4 / rW, 12.6 / rW],
  hy: [2.9 / rH, 5.8 / rH, 8.7 / rH, 11.6 / rH],
  rects: [
    win('a', 1.1 / rW, 0.75 / rH, 3.2 / rW, 1.5 / rH, 'חלון סלון, קומה עליונה'),
    win('b', 7.2 / rW, 0.85 / rH, 3.6 / rW, 1.3 / rH, 'מרפסת, קומה עליונה'),
    win('c', 13.7 / rW, 0.75 / rH, 3.2 / rW, 1.5 / rH, 'חלון חדר, קומה עליונה'),
    win('d', 7.4 / rW, 12.1 / rH, 3.2 / rW, 2.8 / rH, 'חלון ראווה'),
  ],
  precision: 0.001,
  example: true,
};

// 3. תוכנית דירה (סכמה): רוחב 12 מ', עומק 9 מ'. חדרים בריבוע ובריבוע וחצי, כמו אצל פלאדיו.
const pW = 12;
const pH = 9;
const plan: Study = {
  id: 'ex-plan',
  name: 'תוכנית דירה',
  kind: 'plan',
  widthM: pW,
  aspect: pH / pW,
  vx: [4.5 / pW, 7.5 / pW],
  hy: [4.5 / pH],
  rects: [win('k', 0.45 / pW, 0.6 / pH, 3.6 / pW, 2.4 / pH, 'מטבח'), win('t', 4.7 / pW, 5 / pH, 1.6 / pW, 2.2 / pH, 'חדר רחצה')],
  precision: 0.001,
  example: true,
};

// 4. חזית סנטה מריה נובלה של אלברטי, 1470, סכמה על פי ניתוח ויטקובר (1949):
// החזית חסומה בריבוע, הקומה העליונה ריבוע ברבע השטח, והתחתונה שני ריבועים. הרוחב להדגמה בלבד.
const novella: Study = {
  id: 'ex-novella',
  name: 'סנטה מריה נובלה (סכמה)',
  kind: 'facade',
  widthM: 30,
  aspect: 1,
  vx: [0.25, 0.75],
  hy: [0.5],
  rects: [],
  precision: 0.001,
  example: true,
};

export const EXAMPLES: Study[] = [classic, residential, plan, novella];
