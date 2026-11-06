// כתבות: קוראים בגלילה, ובצד מפת העמוד המלא שמראה את הפריסה ואת המקום בקריאה. הדפסה והורדה.
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Rich from '../components/Rich';
import { ModulorFigure } from '../components/Visuals';
import Photo, { PHOTOS } from '../components/Photo';
import { GoldenUnfold } from './Home';
import { href, useRoute, go } from '../lib/route';
import { EXAMPLES } from '../lib/examples';
import { shortCode } from '../lib/shortcode';
import { measureAll, bestOf } from '../lib/engine';
import { SYSTEM } from '../lib/systems';

/* ---------- רכיבי כתבה משותפים ---------- */
const Head = ({ kicker, title, sub }: { kicker: string; title: string; sub: string }) => (
  <header className="art-head">
    <div className="label">{kicker}</div>
    <h1 className="art-title">{title}</h1>
    <Rich as="p" className="art-sub">{sub}</Rich>
  </header>
);
const P = ({ children, drop }: { children: string; drop?: boolean }) => <Rich as="p" className={drop ? 'dropcap' : undefined}>{children}</Rich>;
const Haiku = ({ lines, note }: { lines: [string, string, string]; note: string }) => (
  <div className="haiku">{lines.map((l) => <p key={l}>{l}</p>)}<span className="src">{note}</span></div>
);
const Sources = ({ items }: { items: string[] }) => (
  <div className="art-sources"><div className="label">מקורות</div><ol className="src">{items.map((s) => <li key={s}>{s}</li>)}</ol></div>
);
const Foot = ({ haiku, note, sources }: { haiku: [string, string, string]; note: string; sources: string[] }) => (
  <footer className="art-foot"><Haiku lines={haiku} note={note} /><Sources items={sources} /></footer>
);

/* ---------- 1. יחס הזהב: מיתוס, מדידה ומחוגה ---------- */
const TIMELINE = [
  { y: 'c. 300', era: 'לפנה"ס', who: 'אוקלידס', latin: 'Euclid', what: 'מגדיר חלוקה ב**יחס קיצון וממוצע**.', src: 'Elements, VI, def. 3' },
  { y: '1509', era: '', who: 'לוקה פאצ\'ולי', latin: 'Luca Pacioli', what: 'קורא לו **"הפרופורציה האלוהית"**, באיורי לאונרדו.', src: 'De divina proportione' },
  { y: '1854', era: '', who: 'אדולף צייזינג', latin: 'Adolf Zeising', what: 'טוען שהיחס **אוניברסלי** בגוף ובטבע.', src: 'Neue Lehre von den Proportionen' },
  { y: '1914', era: '', who: 'מארק באר', latin: 'Mark Barr', what: 'מציע את הסימן **φ**.', src: 'T. A. Cook, The Curves of Life' },
  { y: '1950', era: '', who: 'לה קורבוזיה', latin: 'Le Corbusier', what: 'הופך את היחס ל**סרגל מידות** של גוף האדם.', src: 'Le Modulor' },
  { y: '1992', era: '', who: 'ג\'ורג\' מרקובסקי', latin: 'George Markowsky', what: 'בודק את הטענות ומוצא שרובן **לא עומדות במדידה**.', src: 'College Mathematics Journal' },
];

function ArtGolden() {
  return (
    <>
      <Head kicker="כתבה 1 · מיתוס" title="יחס הזהב: מיתוס, מדידה ומחוגה" sub="**2,300** שנה של מספר אחד, ומה קורה כשמודדים אותו." />
      <figure className="art-lead"><GoldenUnfold /><figcaption className="src">מלבן זהב מתפרק לריבועים. איור בקוד.</figcaption></figure>
      <div className="art-cols">
        <div className="art-text">
          <P drop>{'כל מי שלמד אדריכלות שמע שהפרתנון בנוי ב**יחס הזהב**.'}</P>
          <P>{'מתמטיקאים שבדקו את המידות מצאו שהן **לא תומכות** בטענה: המלבן המפורסם מצויר בחופש, מעל קו הגג או מתחתיו.'}</P>
          <Photo src={PHOTOS.parthenon} className="art-photo" width={1200} />
          <P>{'==השאלה איננה אם יש שם זהב, אלא איזו שיטה מסבירה את מה שהעין רואה.=='}</P>
          <P>{'חזית של **אלברטי** נשענת על ריבועים. תוכנית של **פלאדיו** על מספרים שלמים. בניין מגורים על מודול של **10 ס"מ**.'}</P>
          <blockquote className="art-quote">
            <p className="q-he">"קטע ישר נאמר שנחתך ביחס קיצון וממוצע, כאשר השלם אל החלק הגדול כגדול אל הקטן."</p>
            <p className="q-tag">תרגום</p>
            <p className="q-orig">"A straight line is said to have been cut in extreme and mean ratio when, as the whole line is to the greater segment, so is the greater to the less."</p>
            <p className="src">Euclid, Elements, VI, def. 3, tr. T. L. Heath, 1908</p>
          </blockquote>
          <P>{'**בעיר:** צלמו חזית ברחוב שלכם, באשדוד (Ashdod) או בכל עיר, ומדדו.'}</P>
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
        </aside>
      </div>
      <Foot haiku={['פותחים מחוגה', 'על חזית בטון בעיר', 'המספר שותק']} note="ההייקו מאיר: המספר לא מחליט. הוא רק מראה." sources={[
        'Euclid, Elements, VI, def. 3. tr. T. L. Heath, 1908.', 'Luca Pacioli, De divina proportione, 1509.', 'Adolf Zeising, Neue Lehre von den Proportionen des menschlichen Körpers, 1854.',
        'T. A. Cook, The Curves of Life, 1914.', 'Le Corbusier, Le Modulor, 1950.', 'George Markowsky, Misconceptions about the Golden Ratio, College Mathematics Journal 23(1), 1992.',
      ]} />
    </>
  );
}

/* ---------- 2. עבר, הווה, עתיד ---------- */
const ERAS = [
  { k: 'עבר', items: [
    { y: '25 לפנה"ס', t: '**ויטרוביוס**: מידות המקדש נגזרות מגוף האדם.' },
    { y: '1485', t: '**אלברטי**: הרמוניה (concinnitas) של מספרים, כמו במוזיקה.' },
    { y: '1570', t: '**פלאדיו**: שבעה יחסי חדרים, ספר שמודד.' },
  ] },
  { k: 'הווה', items: [
    { y: '1923', t: '**לה קורבוזיה**: קווי ויסות, "ביטוח מפני השרירותי".' },
    { y: '1950', t: '**המודולור**: סרגל אחד לגוף ולבניין.' },
    { y: '1984', t: '**ISO 2848**: מודול של 100 מ"מ לבנייה מתועשת.' },
  ] },
  { k: 'עתיד', items: [
    { y: 'היום', t: '**מעבדות אסתטיקה**: מעקב עיניים ומדידת העדפה בקנה מידה גדול.' },
    { y: 'מחר', t: '**מכשיר ולא כלל**: מדידה שמראה, ואדם שמחליט.' },
  ] },
];

function TimeBand() {
  const pts = ERAS.flatMap((e, ei) => e.items.map((it, ii) => ({ ...it, ei, ii })));
  const W = 720;
  return (
    <svg viewBox={`0 0 ${W} 120`} className="time-band" role="img" aria-label="ציר זמן: עבר, הווה ועתיד של שיטות הפרופורציה" style={{ direction: 'ltr' }}>
      {/* מימין לשמאל: עבר בימין, הווה במרכז, עתיד בשמאל, ברוחב לפי מספר התחנות */}
      {(() => { const n = pts.length, step = (W - 40) / (n - 1); const cuts = [0, 3, 6, n]; return [0, 1, 2].map((e) => { const xr = W - (cuts[e] === 0 ? 0 : 20 + (cuts[e] - 0.5) * step); const xl = W - (cuts[e + 1] === n ? W : 20 + (cuts[e + 1] - 0.5) * step); return <rect key={e} x={xl} y={44} width={xr - xl} height={14} fill={['#EFE7D2', '#E2E8EF', '#E3F1EB'][e]} />; }); })()}
      {pts.map((p, i) => {
        const x = W - (20 + i * ((W - 40) / (pts.length - 1)));
        return <g key={i}><circle cx={x} cy={51} r={6} fill="#fff" stroke="var(--ink)" strokeWidth={2} /><text x={x} y={82} textAnchor="middle" fontFamily="var(--mono)" fontSize="11" fill="var(--ink-soft)">{/^\d/.test(p.y) ? p.y : ''}</text></g>;
      })}
    </svg>
  );
}

function ArtTime() {
  return (
    <>
      <Head kicker="כתבה 2 · זמן" title="עבר, הווה, עתיד: מסרגל אבן למכשיר מדידה" sub="אותה שאלה כבר **2,000** שנה. הכלים השתנו, והתשובות התחדדו." />
      <figure className="art-lead"><TimeBand /><figcaption className="src">ציר זמן: מימין עבר, במרכז הווה, משמאל עתיד.</figcaption></figure>
      <div className="art-cols">
        <div className="art-text">
          <P drop>{'**בעבר** הפרופורציה הייתה כלל: מורה מסר לתלמיד יחסים, והבניין נבנה לפיהם.'}</P>
          <P>{'ויטרוביוס גזר את המקדש מגוף האדם. אלברטי ופלאדיו גזרו אותו ממספרים שלמים, כמו מרווחים במוזיקה.'}</P>
          <blockquote className="art-quote">
            <p className="q-he">"בלי סימטריה ופרופורציה אין עקרונות בתכנון של מקדש כלשהו."</p>
            <p className="q-tag">תרגום</p>
            <p className="q-orig">"Without symmetry and proportion there can be no principles in the design of any temple."</p>
            <p className="src">Vitruvius, De architectura, III.1, tr. M. H. Morgan, 1914</p>
          </blockquote>
          <P>{'**בהווה** הפרופורציה הפכה לתקן: המודולור קושר יחס לגוף, ו-ISO 2848 קושר מידה למפעל.'}</P>
          <P>{'הכלל כבר לא רק יפה. הוא גם **מתועש**, והבלוק, החלון והלוח נפגשים על אותו גריד.'}</P>
          <P>{'**בעתיד** הפרופורציה הופכת למדידה: לא "האם זה זהב", אלא "מה העין רואה, ומה המספרים מראים".'}</P>
          <P>{'==המעבר הוא מכלל שמחייב, למכשיר שמראה.=='}</P>
          <P>{'זו הערכה, לא עובדה: מעבדות לאסתטיקה אמפירית כבר מודדות העדפה, אבל אין עדיין שיטה אחת שכולם מקבלים.'}</P>
        </div>
        <aside className="art-side">
          {ERAS.map((e) => (
            <div key={e.k} className="era">
              <div className="era-k">{e.k}</div>
              <ul>{e.items.map((it) => <li key={it.y}><span className="era-y">{it.y}</span> <Rich>{it.t}</Rich></li>)}</ul>
            </div>
          ))}
          <div className="art-mod"><ModulorFigure compact /><p className="src">המודולור, 1950: הגשר בין עבר להווה.</p></div>
        </aside>
      </div>
      <Foot haiku={['סרגל של אבן', 'עובר מיד ליד אל', 'מסך מחשב']} note="ההייקו מאיר: הכלי מתחלף, והשאלה נשארת." sources={[
        'Vitruvius, The Ten Books on Architecture, tr. M. H. Morgan, Harvard, 1914.', 'Leon Battista Alberti, De re aedificatoria, 1485.', 'Andrea Palladio, I quattro libri dell\'architettura, 1570.',
        'Le Corbusier, Vers une architecture, 1923.', 'Le Corbusier, Le Modulor, 1950.', 'ISO 2848:1984, Building construction, Modular coordination.',
      ]} />
    </>
  );
}

/* ---------- 3. מיחס לחוויה: מה המדע יודע ---------- */
const EVIDENCE = [
  { id: 'palladio', level: 3, claim: 'יחסים פשוטים וסימטריה', finding: 'מעובדים מהר, וקלות העיבוד נחווית כיופי.', src: 'Reber, Schwarz, Winkielman, 2004' },
  { id: 'renard', level: 3, claim: 'צעדים שווים ביחס', finding: 'העין שופטת הבדל ביחס לגודל.', src: 'Weber 1834; Fechner 1860' },
  { id: 'module', level: 2, claim: 'חזרה על גריד', finding: 'חזרה נקראת כסדר. סדר איננו בהכרח יופי.', src: 'Wertheimer 1923' },
  { id: 'modulor', level: 2, claim: 'מידה מהגוף', finding: 'נוחות ושימוש: כן. קשר לזהב: לא הוכח.', src: 'Dreyfuss 1960' },
  { id: 'golden', level: 1, claim: 'מלבן זהב', finding: 'העדפה חלשה, ומשתנה בין אנשים.', src: 'Fechner 1876; McManus 1980; Green 1995' },
] as const;

function EvidenceLadder() {
  // מימין לשמאל: שם השיטה בימין, הפס גדל שמאלה לפי עוצמת הראיות
  const R = 600, U = 180;
  return (
    <svg viewBox="0 0 720 230" className="evidence" role="img" aria-label="סולם הראיות: עוצמת הקשר המדעי בין יחס לחוויה בכל שיטה" style={{ direction: 'ltr' }}>
      {[1, 2, 3].map((i) => <line key={i} x1={R - i * U} x2={R - i * U} y1={10} y2={200} stroke="var(--rule)" />)}
      {EVIDENCE.map((e, i) => (
        <g key={e.id}>
          <rect x={R - e.level * U} y={16 + i * 38} width={e.level * U} height={22} fill={SYSTEM[e.id].color} opacity={0.85} className="ev-bar" style={{ animationDelay: `${i * 0.12}s` }} />
          <text x={R + 12} y={32 + i * 38} textAnchor="start" fontSize="15" fontWeight="600" fill="var(--ink)" style={{ direction: 'rtl' }}>{SYSTEM[e.id].short}</text>
        </g>
      ))}
      {['חלש', 'חלקי', 'חזק'].map((l, i) => <text key={l} x={R - (i + 0.5) * U} y={220} textAnchor="middle" fontSize="13" fill="var(--ink-mute)" style={{ direction: 'rtl' }}>{l}</text>)}
    </svg>
  );
}

function ArtScience() {
  return (
    <>
      <Head kicker="כתבה 3 · מדע" title="מיחס לחוויה: מה המדע באמת יודע" sub="**150** שנה של ניסויים. חלק מהשיטות נתמכות, וחלק נשענות על מיתוס." />
      <figure className="art-lead"><EvidenceLadder /><figcaption className="src">סולם הראיות: אורך הפס לפי עוצמת הקשר שנמצא בין היחס לחוויה.</figcaption></figure>
      <div className="art-cols">
        <div className="art-text">
          <P drop>{'ב-1876 הניח **גוסטב פכנר** עשרה מלבנים לפני אנשים, וביקש לבחור את היפה.'}</P>
          <P>{'הוא מצא העדפה למלבנים קרובים ליחס הזהב. אבל ניסויים מאוחרים, בשיטות זהירות יותר, מצאו העדפה **חלשה**, שמשתנה מאדם לאדם.'}</P>
          <P>{'==היופי לא יושב במספר אחד, אלא בקלות שבה העין קוראת את הצורה.=='}</P>
          <P>{'זה הממצא החזק ביותר: **יחסים פשוטים**, סימטריה וחזרה מעובדים מהר, והמוח חווה את קלות העיבוד כהנאה.'}</P>
          <P>{'גם **מורכבות** משחקת: מעט מדי משעמם, הרבה מדי מעייף. ההנאה בשיא, באמצע.'}</P>
          <P>{'**מה זה אומר לכל שיטה:** פלאדיו ו-R10 נשענים על מנגנון מוכח. המודולור נשען על הגוף, לא על הזהב. יחס הזהב לבדו הוא הטענה החלשה מכולן.'}</P>
        </div>
        <aside className="art-side">
          <div className="label">שיטה, טענה, ממצא</div>
          <ul className="ev-list">
            {EVIDENCE.map((e) => (
              <li key={e.id} style={{ ['--sys' as string]: SYSTEM[e.id].color }}>
                <b><i className="sys-dot" />{SYSTEM[e.id].name}</b>
                <span>{e.claim}: {e.finding}</span>
                <span className="src">{e.src}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
      <Foot haiku={['העין נחה', 'במקום שקל לקרוא', 'ולא בזהב']} note="ההייקו מאיר: הקלות היא החוויה, לא המספר." sources={[
        'G. T. Fechner, Vorschule der Ästhetik, 1876.', 'I. C. McManus, The aesthetics of simple figures, British Journal of Psychology 71, 1980.',
        'C. D. Green, All that glitters: a review of psychological research on the aesthetics of the golden section, Perception 24, 1995.',
        'D. E. Berlyne, Aesthetics and Psychobiology, 1971.', 'R. Reber, N. Schwarz, P. Winkielman, Processing fluency and aesthetic pleasure, Personality and Social Psychology Review 8(4), 2004.',
        'M. Wertheimer, Untersuchungen zur Lehre von der Gestalt, 1923.', 'H. Dreyfuss, The Measure of Man, 1960.',
      ]} />
    </>
  );
}

/* ---------- 4. שיטה חדשה: הקוד הקצר ---------- */
function FamiliesFig() {
  const rows = EXAMPLES.map((s) => ({ s, sc: shortCode(s) }));
  const PAL = ['#A8862B', '#6A4C93', '#23807A', '#2F5D8C', '#C9761E', '#5E6470', '#C23B3B', '#1D9E75', '#8A8984', '#B98CC9'];
  return (
    <svg viewBox="0 0 720 196" className="families" role="img" aria-label="משפחות יחס בכל דוגמה: כל נקודה יחס, כל צבע משפחה" style={{ direction: 'ltr' }}>
      {rows.map(({ s, sc }, ri) => {
        let x = 470;
        return (
          <g key={s.id} transform={`translate(0 ${18 + ri * 44})`}>
            <text x={712} y={14} textAnchor="end" fontSize="14" fill="var(--ink)" style={{ direction: 'rtl' }}>{s.name}</text>
            <text x={500} y={15} textAnchor="middle" fontFamily="var(--mono)" fontSize="20" fontWeight="600" fill="var(--ink)">{sc.index}</text>
            {sc.families.flatMap((f, fi) => Array.from({ length: f.count }, (_, j) => {
              const cx = x - 10; x -= 17; if (j === f.count - 1) x -= 9;
              return <circle key={`${fi}-${j}`} cx={cx} cy={8} r={7} fill={PAL[fi % PAL.length]} className="fam-dot" style={{ animationDelay: `${(ri * 6 + fi) * 0.05}s` }} />;
            }))}
          </g>
        );
      })}
    </svg>
  );
}

function ArtShortCode() {
  const rows = useMemo(() => EXAMPLES.map((s) => ({ s, sc: shortCode(s), best: bestOf(measureAll(s)) })), []);
  return (
    <>
      <Head kicker="כתבה 4 · הצעה של בינה מלאכותית" title="הקוד הקצר: שיטה שלא בוחרת מספר" sub="במקום לשאול **איזה יחס**, השיטה שואלת **כמה יחסים** צריך כדי לתאר את החזית." />
      <figure className="art-lead"><FamiliesFig /><figcaption className="src">כל נקודה יחס בחזית, כל צבע משפחת יחסים. המספר: מדד הקוד הקצר. מחושב בקוד, עכשיו.</figcaption></figure>
      <div className="art-cols">
        <div className="art-text">
          <P drop>{'כל שיטה קלאסית מתחילה בבחירה: **φ**, ריבוע, או גוף האדם. אני מציע להפוך את השאלה.'}</P>
          <P>{'**ההגדרה:** מקבצים את כל יחסי החזית למשפחות, בסבולת של **3%**. סופרים: **n** יחסים, **k** משפחות.'}</P>
          <div className="formula" dir="ltr">index = 100 · (1 − ln k / ln n)</div>
          <P>{'משפחה אחת נותנת **100**. כל יחס לבדו נותן **0**. השורש: מדד היופי של בירקהוף, סדר חלקי מורכבות (1933).'}</P>
          <P>{'**למה היא חזקה, בארבע טענות:**'}</P>
          <ol className="claims">
            <li><Rich>{'**היא מכילה את כל השיטות.** חזית שכולה φ, או כולה ריבועים, היא משפחה אחת. כל שיטה קלאסית היא מקרה פרטי.'}</Rich></li>
            <li><Rich>{'**היא לא תלויה בקנה מידה.** היחסים לא משתנים כשמגדילים בניין, ולכן גם המדד. נבדק בקוד.'}</Rich></li>
            <li><Rich>{'**היא מתיישבת עם המדע.** אנשים שונים בטעם שלהם ליחס, אבל כולם מעבדים מהר יותר צורה שחוזרת על עצמה.'}</Rich></li>
            <li><Rich>{'**היא ניתנת להפרכה.** אם אנשים לא יעדיפו חזיתות עם מדד גבוה יותר, השיטה נכשלת.'}</Rich></li>
          </ol>
          <P>{'==מה בינה מלאכותית מוסיפה: היא לא מעדיפה מספר. היא רואה עקביות.=='}</P>
          <P>{'**מה עוד לא הוכח:** הקשר להעדפה של אנשים. הניסוי המוצע: **40** זוגות חזיתות, ובכל זוג בוחרים את היפה. המדד צריך לנבא את הבחירה.'}</P>
        </div>
        <aside className="art-side">
          <div className="label">המדידה, על ארבע הדוגמאות</div>
          <table className="sc-table">
            <thead><tr><th>דוגמה</th><th>n</th><th>k</th><th>מדד</th><th>הקלאסית הטובה</th></tr></thead>
            <tbody>
              {rows.map(({ s, sc, best }) => (
                <tr key={s.id}><td>{s.name}</td><td className="num">{sc.n}</td><td className="num">{sc.k}</td><td className="num"><b>{sc.index}</b></td><td>{SYSTEM[best.system].short} <bdi className="num">{best.index}%</bdi></td></tr>
              ))}
            </tbody>
          </table>
          <P>{'**מה רואים:** בניין המגורים לא שייך לאף שיטה קלאסית, אבל המדד מגלה בו משפחה של **8** תאים זהים. הוא מסביר את מה שהשיטות פספסו.'}</P>
          <a className="press btn tb-primary" href={href('measure', { st: 'ex-residential', s: 'golden' })}>לבדוק על חזית</a>
        </aside>
      </div>
      <Foot haiku={['שלוש משפחות', 'מספרות את החזית', 'הקוד מתקצר']} note="ההייקו מאיר: פחות סוגים, יותר שקט." sources={[
        'G. D. Birkhoff, Aesthetic Measure, Harvard, 1933.', 'J. Rissanen, Modeling by shortest data description, Automatica 14, 1978.',
        'R. Reber, N. Schwarz, P. Winkielman, Processing fluency and aesthetic pleasure, 2004.', 'I. C. McManus, The aesthetics of simple figures, 1980.',
        'השיטה הוצעה על ידי Claude, בינה מלאכותית של Anthropic, באפליקציה הזו, 2026.',
      ]} />
    </>
  );
}

/* ---------- מסך הכתבות ---------- */
const ARTICLES: { id: string; title: string; kicker: string; C: () => ReactNode }[] = [
  { id: 'golden', title: 'יחס הזהב: מיתוס, מדידה ומחוגה', kicker: 'מיתוס', C: ArtGolden },
  { id: 'time', title: 'עבר, הווה, עתיד', kicker: 'זמן', C: ArtTime },
  { id: 'science', title: 'מיחס לחוויה: מה המדע יודע', kicker: 'מדע', C: ArtScience },
  { id: 'shortcode', title: 'הקוד הקצר: שיטה חדשה', kicker: 'הצעה', C: ArtShortCode },
];

const A4 = 794; // רוחב A4 ב-96 נקודות לאינץ'

function downloadHtml(title: string, id: string, sheet: HTMLElement) {
  let css = '';
  for (const ss of Array.from(document.styleSheets)) {
    try { css += Array.from(ss.cssRules).map((r) => r.cssText).join('\n'); } catch { /* גיליון חיצוני */ }
  }
  const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans+Hebrew:wght@400;500;600;700&display=swap" rel="stylesheet"><style>${css}\nbody{background:#fff;padding:24px}.art-sheet{margin:0 auto}</style></head><body>${sheet.outerHTML}</body></html>`;
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
  const a = document.createElement('a');
  a.href = url; a.download = `proportions-article-${id}.html`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export default function Articles() {
  const { params } = useRoute();
  const art = ARTICLES.find((a) => a.id === params.a) ?? ARTICLES[0];
  const read = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const miniBox = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ top: 0, h: 0.2, full: 1 });
  const [ms, setMs] = useState(0.3);

  const measureView = () => {
    const r = read.current, s = sheet.current;
    if (!r || !s) return;
    const full = s.offsetHeight || 1;
    setView({ top: r.scrollTop / full, h: Math.min(1, r.clientHeight / full), full });
    if (miniBox.current) setMs(miniBox.current.clientWidth / A4);
  };
  useEffect(() => {
    const r = read.current;
    if (!r) return;
    r.scrollTop = 0;
    measureView();
    const ro = new ResizeObserver(measureView);
    if (sheet.current) ro.observe(sheet.current);
    if (miniBox.current) ro.observe(miniBox.current);
    r.addEventListener('scroll', measureView, { passive: true });
    return () => { ro.disconnect(); r.removeEventListener('scroll', measureView); };
  }, [art.id]);

  const jump = (e: React.MouseEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const f = (e.clientY - box.top) / box.height;
    read.current?.scrollTo({ top: f * view.full - (read.current.clientHeight / 2), behavior: 'smooth' });
  };

  return (
    <div className="art-screen">
      <aside className="art-panel">
        <div className="label">כתבות</div>
        <nav className="art-list">
          {ARTICLES.map((a, i) => (
            <a key={a.id} className={`art-item press${a.id === art.id ? ' is-on' : ''}`} href={href('article', { a: a.id })} aria-current={a.id === art.id ? 'true' : undefined}
              onClick={(e) => { e.preventDefault(); go('article', { a: a.id }, true); }}>
              <span className="ai-k">{i + 1} · {a.kicker}</span>
              <span className="ai-t">{a.title}</span>
            </a>
          ))}
        </nav>
        <div className="label">העמוד המלא</div>
        <div className="mini-box" ref={miniBox} onClick={jump} role="img" aria-label="מפת העמוד: לחיצה קופצת למקום" style={{ height: view.full * ms }}>
          <div className="mini-scale" style={{ transform: `scale(${ms})` }}>
            <div className="art-sheet mini" aria-hidden="true"><art.C /></div>
          </div>
          <div className="mini-view" style={{ top: `${view.top * 100}%`, height: `${view.h * 100}%` }} />
        </div>
        <div className="art-actions">
          <button className="press btn" onClick={() => window.print()}>הדפסה</button>
          <button className="press btn" onClick={() => sheet.current && downloadHtml(art.title, art.id, sheet.current)}>הורדה</button>
        </div>
        <p className="explain mute">הדפסה: A4, אפשר לשמור כ-PDF. הורדה: קובץ HTML שנפתח בכל דפדפן.</p>
      </aside>
      <div className="art-read" ref={read}>
        <article className="art-sheet" ref={sheet} key={art.id}><art.C /></article>
      </div>
    </div>
  );
}
