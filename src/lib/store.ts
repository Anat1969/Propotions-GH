// שמירה אוטומטית ב-localStorage. מחקרים של המשתמש בלבד; הדוגמאות נטענות מהקוד.
import type { Study } from './engine';
import { EXAMPLES } from './examples';

const KEY = 'proportions.studies.v1';
export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export function loadStudies(): Study[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as Study[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveStudies(list: Study[]): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

export const findStudy = (id: string | undefined, own: Study[]) => own.find((s) => s.id === id) ?? EXAMPLES.find((s) => s.id === id) ?? EXAMPLES[1];

export const newId = () => `st-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function blankStudy(): Study {
  return { id: newId(), name: 'מחקר חדש', kind: 'facade', widthM: 12, aspect: 0.6, vx: [], hy: [], rects: [], precision: 0.004, updatedAt: Date.now() };
}

/** מקטין תמונה לשמירה מקומית: עד 1600 פיקסלים, JPEG. */
export function readImage(file: File): Promise<{ data: string; w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 1600 / Math.max(img.width, img.height));
      const w = Math.round(img.width * k), h = Math.round(img.height * k);
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      c.getContext('2d')!.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve({ data: c.toDataURL('image/jpeg', 0.85), w, h });
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('הקובץ אינו תמונה שהדפדפן יודע לקרוא. נסו JPG או PNG.')); };
    img.src = url;
  });
}
