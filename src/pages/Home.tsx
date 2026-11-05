// דף הבית: מה המכשיר מודד, במבט אחד. מלבן זהב שמתפרק לריבועים מראה את המנגנון.
import { useMemo } from 'react';
import Rich from '../components/Rich';
import { bestOf, measureAll } from '../lib/engine';
import { EXAMPLES } from '../lib/examples';
import { PHI, SYSTEMS } from '../lib/systems';
import { href } from '../lib/route';
import { GoldenToy } from '../components/Visuals';
import Precedents from '../components/Precedents';

// מלבן זהב שמתפרק לריבועים: כל ריבוע שמורידים משאיר מלבן זהב קטן יותר.
export function GoldenUnfold() {
  const W = 610, H = W / PHI;
  const squares: { x: number; y: number; s: number }[] = [];
  let x = 0, y = 0, w = W, h = H;
  for (let i = 0; i < 8; i++) {
    const s = Math.min(w, h);
    const dir = i % 4;
    if (dir === 0) { squares.push({ x, y, s }); x += s; w -= s; }
    else if (dir === 1) { squares.push({ x, y, s }); y += s; h -= s; }
    else if (dir === 2) { squares.push({ x: x + w - s, y, s }); w -= s; }
    else { squares.push({ x, y: y + h - s, s }); h -= s; }
  }
  // קשתות הספירלה
  const arcs = squares.map((q, i) => {
    const d = i % 4;
    const [sx, sy, ex, ey] =
      d === 0 ? [q.x, q.y + q.s, q.x + q.s, q.y] : d === 1 ? [q.x, q.y, q.x + q.s, q.y + q.s] : d === 2 ? [q.x + q.s, q.y, q.x, q.y + q.s] : [q.x + q.s, q.y + q.s, q.x, q.y];
    return `M ${sx} ${sy} A ${q.s} ${q.s} 0 0 1 ${ex} ${ey}`;
  });
  return (
    <svg className="unfold" viewBox={`-30 -30 ${W + 60} ${H + 90}`} role="img" aria-label="מלבן זהב שמתפרק לריבועים, וספירלה שעוברת דרכם" style={{ direction: 'ltr' }}>
      <defs>
        <pattern id="hmm" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0L0 0 0 10" fill="none" stroke="var(--grid)" strokeWidth=".8" /></pattern>
        <filter id="hlift"><feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#1A1A18" floodOpacity=".13" /></filter>
      </defs>
      <rect x={-30} y={-30} width={W + 60} height={H + 90} fill="url(#hmm)" />
      <rect x={0} y={0} width={W} height={H} fill="#fff" stroke="var(--ink)" strokeWidth="2" filter="url(#hlift)" />
      {squares.map((q, i) => (
        <rect key={i} className="unf-sq" style={{ animationDelay: `${0.35 + i * 0.32}s` }} x={q.x} y={q.y} width={q.s} height={q.s} fill={i % 2 ? 'var(--gold-wash)' : '#fff'} stroke="var(--ink)" strokeWidth={i < 3 ? 1.6 : 1} />
      ))}
      {arcs.map((d, i) => <path key={i} className="unf-arc" style={{ animationDelay: `${0.6 + i * 0.32}s` }} d={d} fill="none" stroke="var(--gold)" strokeWidth={i < 3 ? 3 : 2} pathLength={1} />)}
      <g fontFamily="var(--mono)" fontSize="15" fill="var(--ink-soft)">
        <line x1={0} x2={W} y1={H + 26} y2={H + 26} stroke="var(--ink-mute)" />
        <line x1={squares[0].s} x2={squares[0].s} y1={H + 18} y2={H + 34} stroke="var(--ink-mute)" />
        <text x={squares[0].s / 2} y={H + 52} textAnchor="middle">1.000</text>
        <text x={squares[0].s + (W - squares[0].s) / 2} y={H + 52} textAnchor="middle">0.618</text>
      </g>
    </svg>
  );
}

export default function Home() {
  const scores = useMemo(() => EXAMPLES.map((s) => ({ s, all: measureAll(s) })), []);
  return (
    <div className="home page-wide">
      <section className="hero">
        <div className="hero-text rise">
          <div className="label">מד הפרופורציות · אבחון ומדידה</div>
          <h1 className="hero-title">הקומפוזיציה נמדדת, לא מורגשת.</h1>
          <Rich as="p" className="hero-sub">{'מסמנים קווי חלוקה על **חזית** או **תוכנית**.'}</Rich>
          <Rich as="p" className="hero-sub">{'המכשיר מודד כל יחס מול **5** שיטות, ומראה היכן הוא סוטה ובכמה.'}</Rich>
          <div className="hero-cta">
            <a className="press btn tb-primary" href={href('measure', { st: 'ex-residential', s: 'golden' })}>מדידת דוגמה</a>
            <a className="press btn" href={href('measure', { st: 'ex-golden', s: 'golden' })}>חזית זהובה</a>
            <a className="press btn" href={href('article')}>הכתבה: מיתוס ומדידה</a>
          </div>
          <div className="tones">
            <div className="tone tone-problem"><h4>הבעיה</h4><Rich as="p">{'"נראה לא מאוזן" היא תחושה. **יחס הזהב** מוזכר בלי שנמדד.'}</Rich></div>
            <div className="tone tone-solution"><h4>הפתרון</h4><Rich as="p">{'כל תא, מפרש וחלון נמדד מול יעד, עם **סטייה באחוזים** ותיקון בסנטימטרים.'}</Rich></div>
            <div className="tone tone-insight"><h4>התובנה</h4><Rich as="p">{'==שיטה אחת לא מסבירה הכול.== ההשוואה בין השיטות חושפת את ההיגיון של המתכנן.'}</Rich></div>
          </div>
        </div>
        <div className="hero-fig rise" style={{ animationDelay: '.15s' }}>
          <div className="label">נסו בעצמכם</div>
          <GoldenToy />
        </div>
      </section>

      <section className="home-band">
        <div className="section-title">שלושה תקדימים: מה נכתב עליהם, ומה נמדד</div>
        <Precedents />
      </section>

      <section className="home-band">
        <div className="section-title">ארבע דוגמאות, חמש שיטות: מי מסביר מה</div>
        <div className="ex-grid">
          {scores.map(({ s, all }) => {
            const best = bestOf(all);
            return (
              <a key={s.id} className="ex-card press" href={href('measure', { st: s.id, s: best.system })}>
                <div className="ex-name">{s.name}</div>
                <div className="ex-bars">
                  {all.map((r) => {
                    const def = SYSTEMS.find((x) => x.id === r.system)!;
                    return (
                      <div key={r.system} className="ex-bar" title={`${def.name}: ${r.index}%`}>
                        <span className="ex-fill" style={{ height: `${Math.max(4, r.index)}%`, background: def.color, opacity: r.system === best.system ? 1 : 0.45 }} />
                        <span className="ex-lbl">{def.short}</span>
                      </div>
                    );
                  })}
                </div>
                <Rich as="p" className="explain">{`**${SYSTEMS.find((x) => x.id === best.system)!.name}** מסביר הכי טוב: ${best.index}%.`}</Rich>
              </a>
            );
          })}
        </div>
      </section>

      <section className="home-band home-foot">
        <blockquote className="quote">
          <p className="q-he">"קו הוויסות הוא ביטוח מפני השרירותי."</p>
          <p className="q-orig">«Le tracé régulateur est une assurance contre l'arbitraire.» <span className="src">לה קורבוזיה, לקראת אדריכלות. Le Corbusier, Vers une architecture, 1923</span></p>
        </blockquote>
        <div className="haiku">
          <p>קו זהב סמוי</p>
          <p>חוצה חלון בקומה</p>
          <p>הצל מתיישר</p>
          <span className="src">הייקו: המדידה לא מייפה. היא מראה איפה העין כבר הרגישה.</span>
        </div>
        <p className="inspire src">השראה: המודולור של לה קורבוזיה (Le Corbusier, Le Modulor, 1950), ושרטוטי קווי הוויסות בחזיתות של וילה שטיין (Villa Stein, Garches, 1927).</p>
      </section>
    </div>
  );
}
