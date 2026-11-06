// לכל שיטה: מקור, איפה למצוא, למה זו שיטה, מה המדע אומר, ודוגמה.
// עובדות בלבד, עם מקור. פסק הדין של המדע מנוסח בזהירות: מה נמצא, ומה לא.
import type { SystemId } from './systems';

export type ExampleId = 'parthenon' | 'rotonda' | 'novella' | 'residential';

export interface MethodInfo {
  id: SystemId;
  insight: string;
  source: string;
  where: { text: string; url?: string };
  why: string;
  science: { verdict: 'חזק' | 'חלקי' | 'חלש'; label: string; text: string; src: string };
  examples: ExampleId[];
  exampleNote: string;
}

export const METHODS: MethodInfo[] = [
  {
    id: 'golden',
    insight: '**יחס אחד** שחוזר בעצמו.',
    source: 'אוקלידס, יסודות, ספר שישי, הגדרה 3. בערך 300 לפנה"ס.',
    where: { text: 'Euclid, Elements, VI, def. 3. תרגום מקוון מלא: D. E. Joyce, Clark University', url: 'https://mathcs.clarku.edu/~djoyce/java/elements/elements.html' },
    why: 'נבנה ב**סרגל ומחוגה** בלבד, וכל ריבוע שיורד משאיר מלבן זהב. כלל אחד, שאפשר לחזור עליו ולבדוק.',
    science: {
      verdict: 'חלש',
      label: 'העדפה חלשה',
      text: 'פכנר מצא העדפה למלבנים קרובים ל-**φ**. ניסויים מאוחרים מצאו העדפה **חלשה**, שמשתנה מאדם לאדם.',
      src: 'G. T. Fechner, Vorschule der Ästhetik, 1876. I. C. McManus, British Journal of Psychology, 1980',
    },
    examples: ['parthenon', 'residential'],
    exampleNote: 'הפרתנון הוא הדוגמה המפורסמת, וגם המיתוס: מדידות לא תומכות בטענה (Markowsky, 1992).',
  },
  {
    id: 'modulor',
    insight: '**הגוף** הוא הסרגל.',
    source: 'לה קורבוזיה, המודולור, 1950. המשך: מודולור 2, 1955.',
    where: { text: 'Le Corbusier, Le Modulor, 1950. ארכיון: Fondation Le Corbusier, פריז', url: 'https://www.fondationlecorbusier.fr' },
    why: 'שתי סדרות מידה מגובה אדם (**1829** מ"מ) ומיד מורמת (**2260** מ"מ). כל מידה בסדרה היא גם יחס וגם מידה אנושית.',
    science: {
      verdict: 'חלקי',
      label: 'קנה המידה כן, הזהב לא',
      text: 'מידות שנגזרות מ**הגוף** מתאימות לנוחות ולשימוש, וזה מבוסס בארגונומיה. הקשר ליחס הזהב **לא הוכח**.',
      src: 'Henry Dreyfuss, The Measure of Man, 1960',
    },
    examples: ['residential'],
    exampleNote: 'תבליט המודולור יצוק בבטון ביחידות המגורים של לה קורבוזיה, למשל בברלין.',
  },
  {
    id: 'palladio',
    insight: '**מספרים שלמים**, כמו במוזיקה.',
    source: 'אנדראה פלאדיו, ארבעת ספרי האדריכלות, 1570, ספר ראשון, פרק 21.',
    where: { text: 'Palladio, The Four Books on Architecture, tr. R. Tavernor, R. Schofield, MIT Press, 1997', url: 'https://archive.org/search?query=palladio+quattro+libri' },
    why: 'שבעה יחסי חדרים, מ**ריבוע** ועד **שני ריבועים**. יחסים פשוטים שקל לבנות, למדוד ולזהות.',
    science: {
      verdict: 'חזק',
      label: 'נתמך',
      text: '**יחסים פשוטים** וסימטריה מעובדים במוח מהר יותר, וקלות העיבוד נחווית כיופי.',
      src: 'R. Reber, N. Schwarz, P. Winkielman, Personality and Social Psychology Review, 2004',
    },
    examples: ['rotonda', 'novella'],
    exampleNote: 'וילה רוטונדה של פלאדיו, וחזית סנטה מריה נובלה של אלברטי: ריבועים ושני ריבועים (Wittkower, 1949).',
  },
  {
    id: 'renard',
    insight: '**צעדים שווים** ביחס.',
    source: 'שארל רנאר, 1877, לסדרת כבלים לבלונים של צבא צרפת. התקן: ISO 3, 1973.',
    where: { text: 'ISO 3:1973, Preferred numbers. אתר ISO', url: 'https://www.iso.org' },
    why: 'כל מידה גדולה מקודמתה ב**אותו יחס** (כ-**26%**). מעט מידות מכסות טווח רחב.',
    science: {
      verdict: 'חזק',
      label: 'נתמך',
      text: 'העין שופטת הבדל **ביחס לגודל** (חוק ובר־פכנר). לכן צעדים שווים ביחס נראים שווים.',
      src: 'E. H. Weber, 1834. G. T. Fechner, Elemente der Psychophysik, 1860',
    },
    examples: ['residential'],
    exampleNote: 'בבניין: בדיקה שהמידות שייכות לסדרה אחת. בתעשייה: מידות של רכיבים ומוצרים.',
  },
  {
    id: 'module',
    insight: '**גריד משותף** לכל הרכיבים.',
    source: 'קואורדינציה מודולרית: A. F. Bemis, 1936. התקן: ISO 2848 ו-ISO 1006, מודול בסיס 100 מ"מ.',
    where: { text: 'ISO 2848:1984, Modular coordination. אתר ISO', url: 'https://www.iso.org' },
    why: 'כל מידה היא כפולה של **100 מ"מ**, ולכן בלוק, חלון ולוח משתלבים בלי חיתוך.',
    science: {
      verdict: 'חלקי',
      label: 'סדר, לא בהכרח יופי',
      text: '**חזרה** ודמיון מתקבצים לתבנית אחת, והעין קוראת אותם כסדר. סדר איננו בהכרח יופי.',
      src: 'Max Wertheimer, Untersuchungen zur Lehre von der Gestalt, 1923',
    },
    examples: ['residential'],
    exampleNote: 'המודול העתיק: גריד הטטאמי ביפן, שכל חדר נמדד במספר מחצלות.',
  },
];

export const METHOD = Object.fromEntries(METHODS.map((m) => [m.id, m])) as Record<SystemId, MethodInfo>;
