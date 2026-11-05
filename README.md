# מד הפרופורציות

**[propotions-gh.vercel.app](https://propotions-gh.vercel.app)**

המיזוג האחרון, בלי Vercel: [raw.githack.com/Anat1969/Propotions-GH/main/app/index.html](https://raw.githack.com/Anat1969/Propotions-GH/main/app/index.html) (בפעם הראשונה: "Open the page").

בודק חזית או תוכנית מול **יחס הזהב**, **המודולור**, **יחסי פלאדיו**, **סדרת רנאר R10** ו**מודול 10 ס"מ**, ומראה היכן הקומפוזיציה סוטה, בכמה, ומה לתקן בסנטימטרים.

## הרצה

```bash
npm install
npm run dev
```

```bash
npm run build && npm test
```

## מבנה

- `src/lib/systems.ts`: חמש השיטות, הסדרות, הסבולות והמקורות.
- `src/lib/engine.ts`: מנוע המדידה. דטרמיניסטי, בלי שרת. מכאן נגזרות כל התצוגות.
- `src/lib/examples.ts`: שלוש דוגמאות סכמטיות.
- `src/components/Drawing.tsx`: השרטוט החי, עם קווים, רכיבים, שכבת סטייה וקווי ויסות.
- `src/components/Panels.tsx`: ארבע השאלות והקריאה בשלוש שכבות.
- `src/lib/rectify.ts`, `src/components/Rectify.tsx`: יישור פרספקטיבה בארבע פינות.
- `src/components/Visuals.tsx`, `Precedents.tsx`: רקע חי, צעצוע הזהב, דמות המודולור, תקדימים בקו דיו.
- `src/pages/Article.tsx`: הכתבה.
- `supabase/functions/proportion-read`: פונקציית Edge. Gemini החינמי קודם, Claude כגיבוי.
- `tests/`: בדיקות יחידה (vitest), קצה לקצה (Playwright), `fit.cjs` ו-`overlap.cjs`.

## החלטות

- המספרים מחושבים בדפדפן. המודל רק מנסח, ולא מחשב.
- מחקרים נשמרים ב-localStorage. אין מידע אישי, ולכן אין בסיס נתונים.
- מודול 10 ס"מ בודק התאמה לבנייה, ולכן לא נכנס לדירוג "מי מסביר הכי טוב".
