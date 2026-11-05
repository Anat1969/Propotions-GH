// צילום מ-Wikimedia Commons, עם קרדיט, רישיון וקישור לדף הקובץ.
// נטען בדפדפן של המשתמש. אם הוא לא נטען, הרכיב נעלם ומשאיר את האיור: חור עדיף על תמונה שבורה.
import { useEffect, useRef, useState } from 'react';

export interface PhotoSrc {
  file: string;
  author: string;
  license: string;
  year: string;
  caption: string;
}

export const commonsUrl = (file: string, width = 1000) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file.replace(/ /g, '_'))}?width=${width}`;
export const commonsPage = (file: string) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, '_'))}`;

export default function Photo({ src, className, onFail, width }: { src: PhotoSrc; className?: string; onFail?: () => void; width?: number }) {
  const [state, setState] = useState<'loading' | 'ok' | 'err'>('loading');
  const img = useRef<HTMLImageElement>(null);
  // שגיאה מהירה מאוד יכולה לקרות לפני ש-React מחבר את onError: בודקים גם כשהרכיב עולה, וגם מדי פעם עד שהמצב ברור
  useEffect(() => {
    const check = () => {
      const el = img.current;
      if (!el || !el.complete) return false;
      if (el.naturalWidth > 0) setState('ok'); else { setState('err'); onFail?.(); }
      return true;
    };
    if (check()) return;
    const t = window.setInterval(() => { if (check()) window.clearInterval(t); }, 700);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (state === 'err') return null;
  return (
    <figure className={`photo ${className ?? ''} is-${state}`}>
      <img
        ref={img}
        src={commonsUrl(src.file, width)}
        alt={src.caption}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={() => setState('ok')}
        onError={() => { setState('err'); onFail?.(); }}
      />
      <figcaption>
        <span className="ph-cap">{src.caption}</span>
        <a className="ph-credit" href={commonsPage(src.file)} target="_blank" rel="noreferrer">
          {src.author}, {src.year}, {src.license}, Wikimedia Commons
        </a>
      </figcaption>
    </figure>
  );
}

/** מקורות שאומתו: שם קובץ, צלם ורישיון. */
export const PHOTOS = {
  parthenon: { file: 'The East Facade of the Parthenon on March 22, 2021.jpg', author: 'George E. Koronaios', license: 'CC BY-SA 2.0', year: '2021', caption: 'הפרתנון, החזית המזרחית' },
  rotonda: { file: 'VillaCapra 2007 07 18 3.jpg', author: 'Hans A. Rosbach', license: 'CC BY-SA', year: '2007', caption: 'וילה רוטונדה, ויצ\'נצה' },
  rotondaPlan: { file: 'PalladioRotondaPlan.jpg', author: 'Andrea Palladio', license: 'נחלת הכלל', year: '1570', caption: 'תוכנית הרוטונדה מתוך ארבעת הספרים' },
} satisfies Record<string, PhotoSrc>;
