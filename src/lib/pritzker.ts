// מבנים אייקוניים של זוכי פרס פריצקר, מאפליקציית פרס נובל (PrasNovel-GH, חדר פריצקר).
// המדידה: מידות שפורסמו במקורות, לא סימון על צילום. הצילום הוא הקשר בלבד.
// כל שורת מידה מציינת את המקור ואת הפער בין המקורות, והדיוק (precision) נגזר מהפער הזה.
import type { Study } from './engine';

export const NOBEL = 'https://prasnovel-gh.vercel.app';
export const nobelHref = (slug: string) => `${NOBEL}/#/pritzker?id=${slug}`;

export interface PritzkerCase {
  slug: string;
  architect: string;
  architectEn: string;
  prize: number;
  work: string;
  workEn: string;
  place: string;
  built: number;
  /** מה נמדד, במילים */
  view: string;
  /** המידות ומקורן */
  dims: string;
  /** מה המקורות לא מסכימים עליו */
  spread: string;
  /** תובנה עד 8 מילים, וההסבר */
  insight: string;
  why: string;
  photo: { file: string; by: string; lic: string; page: string };
  study: Study;
}

const ft = (f: number) => f * 0.3048;

export const PRITZKER: PritzkerCase[] = [
  {
    slug: 'i-m-pei', architect: 'איי אם פיי', architectEn: 'I. M. Pei', prize: 1983,
    work: 'פירמידת הלובר', workEn: 'Louvre Pyramid', place: 'פריז Paris', built: 1989,
    view: 'חתך דרך הקודקוד: בסיס מול גובה',
    dims: 'בסיס **35 מ\'** (מוזיאון הלובר), גובה **21.6 מ\'**.',
    spread: 'הבסיס מדווח בין 34 ל-35.42 מ\'. בכל הטווח היחס נשאר בתוך 3% מיחס הזהב.',
    insight: '==המבנה היחיד כאן שנבנה ביחס הזהב.==',
    why: 'בסיס חלקי גובה הוא **1.62**. הדופן נוטה בכ-**51°**, קרוב לפירמידה הגדולה בגיזה (51.8°). צורה טהורה עושה את החשבון גלוי.',
    photo: { file: 'pritzker/i-m-pei.jpg', by: 'Benh LIEU SONG', lic: 'CC BY-SA 3.0', page: 'https://commons.wikimedia.org/wiki/File:Louvre_Museum_Wikimedia_Commons.jpg' },
    study: { id: 'pz-i-m-pei', name: 'פירמידת הלובר, פיי', kind: 'facade', widthM: 35, aspect: 21.6 / 35, vx: [], hy: [], rects: [], precision: 0.012, example: true },
  },
  {
    slug: 'tadao-ando', architect: 'טדאו אנדו', architectEn: 'Tadao Ando', prize: 1995,
    work: 'כנסיית האור', workEn: 'Church of the Light', place: 'איבראקי Ibaraki', built: 1989,
    view: 'חזית אורך: שלוש קוביות ברצף',
    dims: 'נפח **17.7 × 5.9 מ\'**, גובה **5.9 מ\'**: שלוש קוביות של 5.9 מ\'.',
    spread: 'מקור אחד (De Gruyter) נותן 18 × 6.28 מ\'. גם שם: שלוש קוביות.',
    insight: '==שלושה ריבועים מושלמים: פלאדיו, לא זהב.==',
    why: 'כל תא הוא **ריבוע**, היחס הראשון ברשימה של פלאדיו. החזית כולה ארוכה פי **3** מגובהה, מחוץ לכל שיטה, ולכן הציון לא 100.',
    photo: { file: 'pritzker/tadao-ando.jpg', by: 'Bergmann', lic: 'CC BY-SA 3.0', page: 'https://commons.wikimedia.org/wiki/File:Ibaraki_Kasugaoka_Church_Outside.JPG' },
    study: { id: 'pz-tadao-ando', name: 'כנסיית האור, אנדו', kind: 'facade', widthM: 17.7, aspect: 5.9 / 17.7, vx: [1 / 3, 2 / 3], hy: [], rects: [], precision: 0.01, example: true },
  },
  {
    slug: 'jorn-utzon', architect: 'יורן אוטזון', architectEn: 'Jørn Utzon', prize: 2003,
    work: 'בית האופרה של סידני', workEn: 'Sydney Opera House', place: 'סידני Sydney', built: 1973,
    view: 'תוכנית: אורך מול רוחב',
    dims: 'אורך **183 מ\'**, רוחב **120 מ\'** במקום הרחב.',
    spread: 'רוב המקורות מסכימים. מקור אחד נותן 185 מ\'.',
    insight: '==ריבוע וחצי, כמעט בדיוק.==',
    why: 'היחס **1.525** רחוק 1.7% מ**ריבוע וחצי** של פלאדיו, ו-5.7% מיחס הזהב. הקליפות חופשיות, אבל הפודיום שעליו הן עומדות מסודר.',
    photo: { file: 'pritzker/jorn-utzon.jpg', by: 'Roybb95', lic: 'CC BY-SA 3.0', page: 'https://commons.wikimedia.org/wiki/File:Sydney_Opera_House_Sails.jpg' },
    study: { id: 'pz-jorn-utzon', name: 'בית האופרה של סידני, אוטזון (תוכנית)', kind: 'plan', widthM: 183, aspect: 120 / 183, vx: [], hy: [], rects: [], precision: 0.006, example: true },
  },
  {
    slug: 'philip-johnson', architect: "פיליפ ג'ונסון", architectEn: 'Philip Johnson', prize: 1979,
    work: 'בית הזכוכית', workEn: 'Glass House', place: 'ניו כנען New Canaan', built: 1949,
    view: 'תוכנית: אורך מול רוחב',
    dims: '**56 × 32 רגל** (17.1 × 9.8 מ\'), גובה 10.5 רגל.',
    spread: 'ארכאייז נותן 55 × 33 רגל. אז היחס 1.67, בדיוק ריבוע ושני שלישים.',
    insight: '==לא זהב, למרות מה שנכתב עליו.==',
    why: 'היחס **1.75** (שבע חלקי ארבע). הוא רחוק 8% מיחס הזהב, וקרוב ל**ריבוע ושני שלישים** של פלאדיו, על הגבול: 5%. ניתוחים שמראים בו מלבן זהב מסתמכים על קווים שנבחרו אחרי מעשה.',
    photo: { file: 'pritzker/philip-johnson.jpg', by: 'Carol M. Highsmith', lic: 'נחלת הכלל', page: 'https://commons.wikimedia.org/wiki/File:Glass_House_2006.jpg' },
    study: { id: 'pz-philip-johnson', name: "בית הזכוכית, ג'ונסון (תוכנית)", kind: 'plan', widthM: ft(56), aspect: 32 / 56, vx: [], hy: [], rects: [], precision: 0.01, example: true },
  },
  {
    slug: 'renzo-piano', architect: 'רנצו פיאנו', architectEn: 'Renzo Piano', prize: 1998,
    work: "מרכז ז'ורז' פומפידו", workEn: 'Centre Georges Pompidou', place: 'פריז Paris', built: 1977,
    view: 'חזית אורך: 13 מפרשים של 12.8 מ\'',
    dims: 'אורך **166 מ\'**, גובה **42 מ\'** (מרכז פומפידו). 14 מסגרות, 13 מפרשים של **12.8 מ\'**.',
    spread: 'בצד הכיכר הגובה 45.5 מ\'. היחס משתנה, אבל נשאר רחוק מכל שיטה.',
    insight: '==מכונה, לא קומפוזיציה: אין כאן יחס.==',
    why: 'החזית ארוכה פי **4** מגובהה, ומפרש גבוה פי **3.3** מרוחבו. שניהם מחוץ לכל שיטת הרמוניה. הסדר כאן הוא **חזרה** של מפרש אחד, כמו קו ייצור. יחד עם ריצ\'רד רוג\'רס, זוכה 2007.',
    photo: { file: 'pritzker/renzo-piano.jpg', by: 'Zairon', lic: 'CC BY-SA 4.0', page: 'https://commons.wikimedia.org/wiki/File:Paris_Montmartre_Blick_aufs_Centre_Georges-Pompidou.jpg' },
    study: { id: 'pz-renzo-piano', name: 'מרכז פומפידו, פיאנו ורוג\'רס', kind: 'facade', widthM: 166.4, aspect: 42 / 166.4, vx: Array.from({ length: 12 }, (_, i) => (i + 1) / 13), hy: [], rects: [], precision: 0.005, example: true },
  },
];

export const PZ_STUDIES = PRITZKER.map((p) => p.study);
