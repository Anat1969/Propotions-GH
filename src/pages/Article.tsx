// כתבה מוזיאלית: יחס הזהב בין מיתוס למדידה. עמוד A4 אחד, עם ציר זמן, ציטוט, תובנה והייקו.
import Rich from '../components/Rich';
import { ModulorFigure } from '../components/Visuals';
import { GoldenUnfold } from './Home';
import { href } from '../lib/route';

const TIMELINE = [
  { y: 'c. 300', era: 'לפנה"ס', who: 'אוקלידס', latin: 'Euclid', what: 'מגדיר חלוקה ב**יחס קיצון וממוצע**.', src: 'Elements, VI, def. 3' },
  { y: '1509', era: '', who: 'לוקה פאצ\'ולי', latin: 'Luca Pacioli', what: 'קורא לו **"הפרופורציה האלוהית"**, באיורי לאונרדו.', src: 'De divina proportione' },
  { y: '1570', era: '', who: 'פלאדיו', latin: 'Palladio', what: 'שבעה יחסי חדרים, **בלי** יחס הזהב.', src: 'I quattro libri, I.21' },
  { y: '1854', era: '', who: 'אדולף צייזינג', latin: 'Adolf Zeising', what: 'טוען שהיחס **אוניברסלי** בגוף ובטבע.', src: 'Neue Lehre von den Proportionen' },
  { y: '1914', era: '', who: 'מארק באר', latin: 'Mark Barr', what: 'מציע את הסימן **φ**.', src: 'T. A. Cook, The Curves of Life' },
  { y: '1950', era: '', who: 'לה קורבוזיה', latin: 'Le Corbusier', what: 'הופך את היחס ל**סרגל מידות** של גוף האדם.', src: 'Le Modulor' },
  { y: '1992', era: '', who: 'ג\'ורג\' מרקובסקי', latin: 'George Markowsky', what: 'בודק את הטענות ומוצא שרובן **לא עומדות במדידה**.', src: 'College Mathematics Journal' },
];

export default function Article() {
  return (
    <article className="page-wide article">
      <div className="art-sheet">
        <header className="art-head">
          <div className="label">כתבה · מד הפרופורציות</div>
          <h1 className="art-title">יחס הזהב: מיתוס, מדידה ומחוגה</h1>
          <Rich as="p" className="art-sub">{'**2,300** שנה של מספר אחד, ומה קורה כשמודדים אותו.'}</Rich>
        </header>

        <figure className="art-lead">
          <GoldenUnfold />
          <figcaption className="src">מלבן זהב מתפרק לריבועים. איור בקוד, מד הפרופורציות, 2026.</figcaption>
        </figure>

        <div className="art-cols">
          <div className="art-text">
            <p className="dropcap">
              <Rich>{'כל מי שלמד אדריכלות שמע שהפרתנון בנוי ב**יחס הזהב**.'}</Rich>
            </p>
            <Rich as="p">{'הטענה מופיעה בספרי לימוד, בפוסטים ובשקופיות. מעטים מודדים אותה.'}</Rich>
            <Rich as="p">{'מתמטיקאים שבדקו את המידות מצאו שהן **לא תומכות** בטענה: המלבן המפורסם מצויר בחופש, מעל או מתחת לקו הגג.'}</Rich>
            <Rich as="p">{'אבל השאלה המעניינת איננה אם יש שם זהב.'}</Rich>
            <Rich as="p">{'==השאלה היא איזו שיטה מסבירה את מה שהעין רואה.=='}</Rich>
            <Rich as="p">{'חזית של **אלברטי** נשענת על ריבועים. תוכנית של **פלאדיו** על יחסים של מספרים שלמים. בניין מגורים טיפוסי על מודול של **10 ס"מ**.'}</Rich>
            <Rich as="p">{'מד הפרופורציות מודד את כולן יחד, ומראה איזו מהן מתאימה.'}</Rich>

            <blockquote className="art-quote">
              <p className="q-he">"קטע ישר נאמר שנחתך ביחס קיצון וממוצע, כאשר השלם אל החלק הגדול כגדול אל הקטן."</p>
              <p className="q-tag">תרגום</p>
              <p className="q-orig">"A straight line is said to have been cut in extreme and mean ratio when, as the whole line is to the greater segment, so is the greater to the less."</p>
              <p className="src">אוקלידס, יסודות, ספר שישי, הגדרה 3. Euclid, Elements, tr. T. L. Heath, 1908</p>
            </blockquote>

            <Rich as="p">{'**בעיר:** צלמו חזית ברחוב שלכם, באשדוד (Ashdod) או בכל עיר. יישרו את הפרספקטיבה, הזינו את הרוחב, וסמנו את קווי הקומות.'}</Rich>
            <a className="press btn tb-primary art-cta" href={href('measure', { st: 'ex-residential', s: 'golden' })}>למדידה</a>
          </div>

          <aside className="art-side">
            <div className="label">ציר זמן</div>
            <ol className="timeline">
              {TIMELINE.map((t) => (
                <li key={t.y + t.who}>
                  <div className="tl-year"><bdi className="num">{t.y}</bdi> <span className="tl-era">{t.era}</span></div>
                  <div className="tl-who"><b>{t.who}</b> <span className="prec-latin">{t.latin}</span></div>
                  <Rich as="div" className="tl-what">{t.what}</Rich>
                  <div className="src">{t.src}</div>
                </li>
              ))}
            </ol>
            <div className="art-mod">
              <ModulorFigure compact />
              <p className="src">המודולור: 1130, 1829 ו-2260 מ"מ. איור בקוד.</p>
            </div>
          </aside>
        </div>

        <footer className="art-foot">
          <div className="haiku">
            <p>פותחים מחוגה</p>
            <p>על חזית בטון בעיר</p>
            <p>המספר שותק</p>
            <span className="src">ההייקו מאיר: המספר לא מחליט. הוא רק מראה, והאדם מחליט.</span>
          </div>
          <div className="art-sources">
            <div className="label">מקורות</div>
            <ol className="src">
              <li>Euclid, Elements, Book VI, Definition 3. tr. T. L. Heath, Cambridge, 1908.</li>
              <li>Luca Pacioli, De divina proportione, Venezia, 1509.</li>
              <li>Andrea Palladio, I quattro libri dell'architettura, Venezia, 1570.</li>
              <li>Adolf Zeising, Neue Lehre von den Proportionen des menschlichen Körpers, Leipzig, 1854.</li>
              <li>Theodore Andrea Cook, The Curves of Life, London, 1914.</li>
              <li>Le Corbusier, Le Modulor, Boulogne, 1950.</li>
              <li>Rudolf Wittkower, Architectural Principles in the Age of Humanism, London, 1949.</li>
              <li>George Markowsky, Misconceptions about the Golden Ratio, The College Mathematics Journal 23(1), 1992.</li>
            </ol>
          </div>
        </footer>
      </div>
    </article>
  );
}
