// שיטת המדידה ואמינות: על מה המכשיר נשען, איך הוא מחשב, ואיך הוא בודק את עצמו.
import { useMemo } from 'react';
import Rich from '../components/Rich';
import { measure } from '../lib/engine';
import { EXAMPLES } from '../lib/examples';

export default function Method() {
  // כיול: חזית הזהב תוכננה כך שהמסגרת והקצב בין המפרשים יהיו φ בדיוק
  const cal = useMemo(() => {
    const r = measure(EXAMPLES[0], 'golden');
    const designed = r.items.filter((m) => m.id === 'frame' || m.id.startsWith('px'));
    return { max: Math.max(...designed.map((m) => m.dev)), n: designed.length };
  }, []);
  return (
    <div className="page-wide method-page">
      <header className="page-head">
        <div className="label">שיטת המדידה ואמינות</div>
        <h1 className="page-title">מכשיר שאומר גם כמה הוא בטוח.</h1>
        <Rich as="p" className="page-sub">{'כל מספר נגזר מכלל כתוב. כל תוצאה מגיעה עם **אי־ודאות**, ומה שלא נמדד נשאר לאיש המקצוע.'}</Rich>
      </header>

      <div className="method-grid">
        <section className="m-card">
          <h2 className="m-h">1. מה נמדד</h2>
          <ul className="m-list">
            <li><Rich>{'**המסגרת:** יחס רוחב לגובה של החזית או התוכנית.'}</Rich></li>
            <li><Rich>{'**תאים:** כל מלבן בין שני קווים אנכיים ושני אופקיים.'}</Rich></li>
            <li><Rich>{'**קצב:** כל זוג מפרשים סמוכים, וכל זוג קומות סמוכות. זוג שווה הוא חזרה, ולא נמדד.'}</Rich></li>
            <li><Rich>{'**רכיבים:** חלון, דלת או חדר שסומנו במלבן.'}</Rich></li>
            <li><Rich>{'**בשיטות מידה:** רוחב כל מפרש, גובה כל קומה, ורוחב וגובה כל רכיב, במילימטרים.'}</Rich></li>
          </ul>
        </section>

        <section className="m-card">
          <h2 className="m-h">2. איך מחושב המדד</h2>
          <div className="formula" dir="ltr">dev = |v − t| / t</div>
          <Rich as="p" className="explain">{'**v** הערך שנמדד, **t** היעד הקרוב בשיטה. במודול 10 ס"מ: המרחק מהכפולה הקרובה, חלקי **100 מ"מ**.'}</Rich>
          <div className="formula" dir="ltr">score = max(0, 1 − dev / (2 · orange))</div>
          <Rich as="p" className="explain">{'ציון **100** בסטייה אפס, יורד ליניארית עד **0** בפעמיים סף ה"קרוב". ==מדד ההרמוניה הוא ממוצע הציונים.=='}</Rich>
        </section>

        <section className="m-card">
          <h2 className="m-h">3. אי־ודאות</h2>
          <div className="formula" dir="ltr">δ(a/b) ≈ e·D/a + e·D/b</div>
          <Rich as="p" className="explain">{'**e** דיוק הסימון: **0.4%** מממד המסגרת בתמונה, **0.1%** בדוגמה מספרית.'}</Rich>
          <Rich as="p" className="explain">{'רכיב שאי־הוודאות שלו חוצה סף מסומן **על הגבול**. המכשיר לא מכריע עליו.'}</Rich>
        </section>

        <section className="m-card">
          <h2 className="m-h">4. כיול</h2>
          <div className="big-row"><bdi className="big num" style={{ color: 'var(--ok)' }}>{(cal.max * 100).toFixed(2)}%</bdi><div className="big-side"><div className="big-verdict">סטייה מרבית</div><div className="big-sys">ב-{cal.n} יחסים שתוכננו כ-φ</div></div></div>
          <Rich as="p" className="explain">{'חזית הזהב בנויה מחישוב, לא מסימון. המכשיר חייב להחזיר עליה **אפס**, וזו הבדיקה הראשונה בכל גרסה.'}</Rich>
        </section>

        <section className="m-card">
          <h2 className="m-h">5. שלוש שכבות שקופות</h2>
          <ul className="m-list">
            <li><Rich>{'**מחושב בקוד:** כל המספרים, הסטיות והתיקונים. דטרמיניסטי, בלי שרת.'}</Rich></li>
            <li><Rich>{'**ניסוח מודל:** Gemini החינמי, ו-Claude כגיבוי. מנסח רק מהמספרים שנמסרו לו.'}</Rich></li>
            <li><Rich>{'**איש המקצוע:** הערה שנשמרת עם המחקר. ==ההחלטה נשארת אצלו.=='}</Rich></li>
          </ul>
        </section>

        <section className="m-card tone tone-problem">
          <h2 className="m-h">6. מה המכשיר לא עושה</h2>
          <ul className="m-list">
            <li><Rich>{'**צילום בפרספקטיבה** מעוות יחסים. צריך חזית חזיתית, או שרטוט.'}</Rich></li>
            <li><Rich>{'**עדשה רחבה** מעקמת קווים בשולי התמונה.'}</Rich></li>
            <li><Rich>{'**יופי** אינו מספר. מדד גבוה אומר עקביות עם שיטה, לא איכות אדריכלית.'}</Rich></li>
            <li><Rich>{'**זיהוי קווים אוטומטי** הוא הצעה. כל קו נבדק בעין לפני מדידה.'}</Rich></li>
          </ul>
        </section>
      </div>

      <section className="m-howto">
        <div className="section-title">איך משתמשים, בארבעה צעדים</div>
        <ol className="steps">
          <li><Rich>{'**מעלים תמונה** של חזית חזיתית, או בוחרים דוגמה.'}</Rich></li>
          <li><Rich>{'**מכוונים את המסגרת** לקצוות, ומזינים את הרוחב האמיתי במטרים.'}</Rich></li>
          <li><Rich>{'**מסמנים קווים** אנכיים ואופקיים, ומלבנים סביב חלונות.'}</Rich></li>
          <li><Rich>{'**קוראים את התשובות:** מדד, סטיות, השיטה המסבירה ותיקון בסנטימטרים.'}</Rich></li>
        </ol>
      </section>
    </div>
  );
}
