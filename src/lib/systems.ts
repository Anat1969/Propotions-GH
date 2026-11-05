// חמש שיטות הפרופורציה. כל שיטה מגדירה יעדים, דרך מדידה ותחומי סבולת.
// שתי משפחות: יחס (לא תלוי בקנה מידה) ומידה (צריכה רוחב אמיתי במטרים).

export const PHI = (1 + Math.sqrt(5)) / 2;

export type SystemId = 'golden' | 'modulor' | 'palladio' | 'renard' | 'module';
export type Family = 'ratio' | 'size';

export interface Target {
  value: number;
  name: string;
}

export interface SystemDef {
  id: SystemId;
  name: string;
  short: string;
  latin: string;
  family: Family;
  /** האם השיטה בודקת הרמוניה (נכנסת לדירוג) או רק התאמה לבנייה */
  harmony: boolean;
  color: string;
  /** סף "מדויק" ו"קרוב", בשבר עשרוני של סטייה */
  green: number;
  orange: number;
  idea: string;
  why: string;
  measure: string;
  source: string;
  standard: string;
  limit: string;
}

// המודולור: סדרה אדומה (בסיס 1829 מ"מ, גובה אדם) וסדרה כחולה (בסיס 2260 מ"מ, יד מורמת), במ"מ.
// הערכים כפי שפורסמו: Le Corbusier, Le Modulor, 1950.
export const MODULOR_RED = [6, 9, 15, 24, 39, 63, 102, 165, 267, 432, 698, 1130, 1829, 2959, 4788, 7747, 12535, 20282];
export const MODULOR_BLUE = [11, 18, 30, 48, 78, 126, 204, 330, 534, 863, 1397, 2260, 3658, 5918, 9576, 15494, 25070];

// סדרת רנאר R10 (ISO 3): עשרה מספרים מועדפים בכל עשור.
export const R10 = [1, 1.25, 1.6, 2, 2.5, 3.15, 4, 5, 6.3, 8];

// שבעת יחסי החדרים של פלאדיו, I quattro libri dell'architettura, 1570, ספר ראשון, פרק 21.
// (החדר העגול מושמט: הוא לא מלבן.)
export const PALLADIO: Target[] = [
  { value: 1, name: 'ריבוע 1:1' },
  { value: Math.SQRT2, name: 'אלכסון הריבוע 1:√2' },
  { value: 4 / 3, name: 'ריבוע ושליש 3:4' },
  { value: 3 / 2, name: 'ריבוע וחצי 2:3' },
  { value: 5 / 3, name: 'ריבוע ושני שלישים 3:5' },
  { value: 2, name: 'שני ריבועים 1:2' },
];

/** המודול הבסיסי של קואורדינציה מודולרית: M = 100 מ"מ (ISO 2848). */
export const MODULE_MM = 100;

export const SYSTEMS: SystemDef[] = [
  {
    id: 'golden',
    name: 'יחס הזהב',
    short: 'זהב',
    latin: 'φ = 1.618',
    family: 'ratio',
    harmony: true,
    color: 'var(--gold)',
    green: 0.02,
    orange: 0.05,
    idea: 'חלוקה שבה **השלם** מתייחס לחלק הגדול כמו הגדול לקטן.',
    why: 'היחס חוזר בעצמו, ולכן **מלבן זהב** שמוריד ממנו ריבוע משאיר מלבן זהב קטן יותר.',
    measure: 'כל מלבן וכל זוג מקטעים סמוכים: היחס בין הגדול לקטן, מול **1.618**.',
    source: 'אוקלידס, יסודות, ספר שישי, הגדרה 3. Euclid, Elements, c. 300 BCE',
    standard: 'הגדרה מתמטית: (1+√5)/2',
    limit: 'יחס בלבד. לא אומר דבר על גודל אמיתי או על נוחות לאדם.',
  },
  {
    id: 'modulor',
    name: 'המודולור',
    short: 'מודולור',
    latin: 'Le Modulor',
    family: 'size',
    harmony: true,
    color: 'var(--blue)',
    green: 0.02,
    orange: 0.05,
    idea: 'סרגל מידות שנגזר מ**גוף האדם**: גובה 1.83 מטר ויד מורמת 2.26 מטר, מחולקים ביחס הזהב.',
    why: 'מחבר בין **יחס** לבין **מידה**: כל מידה בסדרה היא גם הרמונית וגם בקנה מידה אנושי.',
    measure: 'כל רוחב מפרש וגובה קומה, במילימטרים, מול הערך הקרוב בסדרה **האדומה** או **הכחולה**.',
    source: 'לה קורבוזיה, המודולור. Le Corbusier, Le Modulor, 1950',
    standard: 'סדרות פורסמו בספר. גובה האדם 1829 מ"מ',
    limit: 'צריך קנה מידה. מבוסס על גבר בגובה 1.83 מטר, ולא על טווח הגוף האנושי.',
  },
  {
    id: 'palladio',
    name: 'יחסי פלאדיו',
    short: 'פלאדיו',
    latin: 'Palladio',
    family: 'ratio',
    harmony: true,
    color: 'var(--violet)',
    green: 0.02,
    orange: 0.05,
    idea: 'שבעה יחסים "יפים ומוצלחים" לחדרים, מ**ריבוע** ועד **שני ריבועים**.',
    why: 'יחסים פשוטים של מספרים שלמים, כמו מרווחים במוזיקה, שקל לבנות ולזהות.',
    measure: 'כל מלבן וכל זוג מקטעים מול היחס הקרוב: **1**, **√2**, **4:3**, **3:2**, **5:3**, **2**.',
    source: 'אנדראה פלאדיו, ארבעת ספרי האדריכלות. Andrea Palladio, I quattro libri dell\'architettura, 1570',
    standard: 'ספר ראשון, פרק 21',
    limit: 'נוסח לחדרים בתוכנית. בחזית הוא קנה מידה מקובל, לא כלל של פלאדיו עצמו.',
  },
  {
    id: 'renard',
    name: 'סדרת רנאר R10',
    short: 'R10',
    latin: 'ISO 3 · R10',
    family: 'size',
    harmony: true,
    color: 'var(--teal)',
    green: 0.02,
    orange: 0.05,
    idea: 'עשרה **מספרים מועדפים** בכל עשור, בצעדים שווים של כ-**26%**.',
    why: 'סדרה גאומטרית: כל מידה גדולה מקודמתה באותו יחס, ולכן מכפלות ויחסים נשארים בסדרה.',
    measure: 'כל מידה, במילימטרים, מול המספר המועדף הקרוב: 1, 1.25, 1.6, 2, 2.5, 3.15, 4, 5, 6.3, 8 כפול חזקה של 10.',
    source: 'שארל רנאר, 1877. ISO 3:1973, Preferred numbers',
    standard: 'ISO 3, ISO 17',
    limit: 'תקן תעשייתי לסדרות מוצרים. בבניין הוא מבחן לשיטתיות, לא ליופי.',
  },
  {
    id: 'module',
    name: 'מודול 10 ס"מ',
    short: 'מודול',
    latin: 'ISO 2848 · M',
    family: 'size',
    harmony: false,
    color: 'var(--slate)',
    green: 0.1,
    orange: 0.25,
    idea: 'כל מידה היא כפולה של **מודול בסיס** של 100 מילימטר.',
    why: 'מידות על גריד משותף מאפשרות לרכיבים מתועשים (בלוק, חלון, לוח) להשתלב בלי חיתוך.',
    measure: 'כל מידה: המרחק מהכפולה הקרובה של **100 מ"מ**, כאחוז מהמודול. עד **10 מ"מ** נחשב מדויק.',
    source: 'ISO 2848:1984, Building construction, Modular coordination',
    standard: 'ISO 2848, ISO 1006 (מודול בסיס M=100 מ"מ)',
    limit: 'בודק התאמה לבנייה, לא הרמוניה. בסטייה מרבית של 50 מ"מ.',
  },
];

export const SYSTEM = Object.fromEntries(SYSTEMS.map((s) => [s.id, s])) as Record<SystemId, SystemDef>;

/** היעד הקרוב והסטייה היחסית לכל מידה או יחס. */
export function nearest(system: SystemId, v: number): { target: number; name: string; dev: number } {
  switch (system) {
    case 'golden':
      return { target: PHI, name: 'φ 1.618', dev: Math.abs(v - PHI) / PHI };
    case 'palladio': {
      let best = PALLADIO[0];
      for (const t of PALLADIO) if (Math.abs(v - t.value) / t.value < Math.abs(v - best.value) / best.value) best = t;
      return { target: best.value, name: best.name, dev: Math.abs(v - best.value) / best.value };
    }
    case 'modulor': {
      let best = MODULOR_RED[0];
      let series = 'אדומה';
      for (const [list, nm] of [[MODULOR_RED, 'אדומה'], [MODULOR_BLUE, 'כחולה']] as const) {
        for (const t of list) if (Math.abs(v - t) / t < Math.abs(v - best) / best) { best = t; series = nm; }
      }
      return { target: best, name: `${best} מ"מ, סדרה ${series}`, dev: Math.abs(v - best) / best };
    }
    case 'renard': {
      const k = Math.floor(Math.log10(Math.max(v, 1e-6)));
      let best = 1;
      for (const e of [k - 1, k, k + 1]) for (const r of R10) {
        const t = r * 10 ** e;
        if (Math.abs(v - t) / t < Math.abs(v - best) / best) best = t;
      }
      return { target: best, name: `${+best.toPrecision(3)} מ"מ`, dev: Math.abs(v - best) / best };
    }
    case 'module': {
      const t = Math.max(MODULE_MM, Math.round(v / MODULE_MM) * MODULE_MM);
      return { target: t, name: `${t / 10} ס"מ`, dev: Math.abs(v - t) / MODULE_MM };
    }
  }
}

export const HARMONY = SYSTEMS.filter((s) => s.harmony).map((s) => s.id);
