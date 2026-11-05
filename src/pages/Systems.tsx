// חמש השיטות: הרעיון, למה הוא עובד, איך נמדד, מקור ומגבלה. לכל שיטה סרגל חזותי משלה.
import { useState } from 'react';
import Rich from '../components/Rich';
import { MODULOR_BLUE, MODULOR_RED, PALLADIO, PHI, R10, SYSTEMS, type SystemDef } from '../lib/systems';
import { href } from '../lib/route';
import { ModulorFigure } from '../components/Visuals';

function Ruler({ s }: { s: SystemDef }) {
  const W = 320, H = 70;
  if (s.id === 'golden') {
    const a = W / PHI;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="ruler" style={{ direction: 'ltr' }} aria-label="חלוקת קו ביחס הזהב">
        <rect x={0} y={14} width={a} height={22} fill={s.color} />
        <rect x={a} y={14} width={W - a} height={22} fill={s.color} opacity={0.45} />
        <text x={a / 2} y={56} textAnchor="middle" fontFamily="var(--mono)" fontSize="12">0.618</text>
        <text x={a + (W - a) / 2} y={56} textAnchor="middle" fontFamily="var(--mono)" fontSize="12">0.382</text>
      </svg>
    );
  }
  if (s.id === 'palladio') {
    const h = 40, k = 18;
    let x = 2;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="ruler" style={{ direction: 'ltr' }} aria-label="שישה יחסי חדרים של פלאדיו">
        {PALLADIO.map((p) => {
          const w = (h * p.value * k) / 18 * 0.62;
          const el = <rect key={p.name} x={x} y={8} width={w} height={h * 0.62} fill="none" stroke={s.color} strokeWidth="2" />;
          const t = <text key={p.name + 't'} x={x + w / 2} y={H - 8} textAnchor="middle" fontFamily="var(--mono)" fontSize="10">{p.value.toFixed(2)}</text>;
          x += w + 8;
          return [el, t];
        })}
      </svg>
    );
  }
  if (s.id === 'modulor') {
    const lg = (v: number) => (Math.log10(v) - Math.log10(100)) / (Math.log10(2300) - Math.log10(100)) * (W - 10) + 5;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="ruler" style={{ direction: 'ltr' }} aria-label="הסדרה האדומה והכחולה של המודולור, 100 עד 2260 מילימטר">
        <line x1={0} x2={W} y1={30} y2={30} stroke="var(--rule)" />
        {MODULOR_RED.filter((v) => v >= 100 && v <= 2300).map((v) => <g key={'r' + v}><line x1={lg(v)} x2={lg(v)} y1={10} y2={30} stroke={s.color} strokeWidth="3" /><text x={lg(v)} y={8} fontSize="9" textAnchor="middle" fontFamily="var(--mono)">{v}</text></g>)}
        {MODULOR_BLUE.filter((v) => v >= 100 && v <= 2300).map((v) => <g key={'b' + v}><line x1={lg(v)} x2={lg(v)} y1={30} y2={50} stroke={s.color} strokeWidth="1.5" strokeDasharray="3 2" /><text x={lg(v)} y={62} fontSize="9" textAnchor="middle" fontFamily="var(--mono)">{v}</text></g>)}
      </svg>
    );
  }
  if (s.id === 'renard') {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="ruler" style={{ direction: 'ltr' }} aria-label="עשרת המספרים המועדפים של R10">
        {R10.map((v, i) => { const x = 8 + i * 31; const hh = v * 4.6; return <g key={v}><rect x={x} y={44 - hh} width={20} height={hh} fill={s.color} opacity={0.4 + i * 0.06} /><text x={x + 10} y={60} fontSize="10" textAnchor="middle" fontFamily="var(--mono)">{v}</text></g>; })}
      </svg>
    );
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="ruler" style={{ direction: 'ltr' }} aria-label="גריד של 100 מילימטר">
      {Array.from({ length: 17 }, (_, i) => <line key={i} x1={8 + i * 19} x2={8 + i * 19} y1={10} y2={i % 3 === 0 ? 44 : 34} stroke={s.color} strokeWidth={i % 3 === 0 ? 2 : 1} />)}
      <text x={8} y={60} fontSize="10" fontFamily="var(--mono)">0</text>
      <text x={8 + 3 * 19} y={60} fontSize="10" textAnchor="middle" fontFamily="var(--mono)">300</text>
      <text x={8 + 6 * 19} y={60} fontSize="10" textAnchor="middle" fontFamily="var(--mono)">600</text>
    </svg>
  );
}

const POST = `מלבן זהב הוא לא סוד של יופי. הוא החלטה שאפשר למדוד.

כשמסמנים את קווי הקומות והמפרשים על חזית, כל תא הופך ליחס. מספר אחד שאפשר להשוות ל-1.618, ל-3:2 של פלאדיו, או לסדרה של המודולור.

מה שמפתיע: חזיתות טובות לא נשענות על שיטה אחת. בניין מגורים טיפוסי יכול לסטות מיחס הזהב ב-20%, ולשבת בדיוק על יחסי פלאדיו. המדידה לא שופטת. היא חושפת את ההיגיון שהמתכנן בחר, גם כשלא כתב אותו.

הצעד המעשי: לפני שמשנים חזית, למדוד אותה. הרכיב שסוטה הכי הרבה הוא בדרך כלל זה שהעין כבר הרגישה.

איזו חזית בעיר שלכם הייתם רוצים למדוד?`;

export default function Systems() {
  const [copied, setCopied] = useState(false);
  return (
    <div className="page-wide systems-page">
      <header className="page-head">
        <div className="label">שיטות</div>
        <h1 className="page-title">חמש שיטות, שתי משפחות: יחס ומידה.</h1>
        <Rich as="p" className="page-sub">{'**שיטות יחס** לא תלויות בגודל. **שיטות מידה** צריכות רוחב אמיתי במטרים.'}</Rich>
      </header>
      <div className="sys-grid">
        {SYSTEMS.map((s) => (
          <article key={s.id} className="sys-card" style={{ ['--sys' as string]: s.color }}>
            <div className="sys-top">
              <h2 className="sys-name">{s.name}</h2>
              <span className="sys-latin">{s.latin}</span>
              <span className="sys-fam">{s.family === 'ratio' ? 'יחס' : 'מידה'}</span>
            </div>
            {s.id === 'modulor' ? <div className="mod-wrap"><ModulorFigure compact /><Ruler s={s} /></div> : <Ruler s={s} />}
            <dl className="sys-dl">
              <dt className="label">הרעיון</dt><dd><Rich>{s.idea}</Rich></dd>
              <dt className="label">למה</dt><dd><Rich>{s.why}</Rich></dd>
              <dt className="label">איך נמדד</dt><dd><Rich>{s.measure}</Rich></dd>
              <dt className="label">סבולת</dt><dd><Rich>{`מדויק עד **${Math.round(s.green * 100)}%**, קרוב עד **${Math.round(s.orange * 100)}%**.`}</Rich></dd>
              <dt className="label">מגבלה</dt><dd className="lim">{s.limit}</dd>
            </dl>
            <p className="src">{s.source}. תקן: {s.standard}</p>
            <a className="press btn sys-try" href={href('measure', { st: 'ex-residential', s: s.id })}>מדידה לפי {s.short}</a>
          </article>
        ))}
        <article className="sys-card post-card">
          <div className="label">פוסט מוכן להעתקה</div>
          <div className="post">{POST.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}</div>
          <button className="press btn" onClick={() => navigator.clipboard?.writeText(POST).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); })}>{copied ? 'הועתק' : 'העתקת הפוסט'}</button>
        </article>
      </div>
    </div>
  );
}
