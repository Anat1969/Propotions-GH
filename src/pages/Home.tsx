// דף הבית: מה המכשיר מודד, במבט אחד. מלבן זהב שמתפרק לריבועים מראה את המנגנון.
import Rich from '../components/Rich';
import { PHI, SYSTEM } from '../lib/systems';
import { METHODS } from '../lib/methods';
import { href } from '../lib/route';
import { GoldenToy } from '../components/Visuals';

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
  return (
    <div className="home home-fit">
      <section className="hero">
        <div className="hero-text rise">
          <div className="label">מד הפרופורציות · אבחון ומדידה</div>
          <h1 className="hero-title">הקומפוזיציה נמדדת, לא מורגשת.</h1>
          <Rich as="p" className="hero-sub">{'מסמנים קווים על **חזית** או **תוכנית**.'}</Rich>
          <Rich as="p" className="hero-sub">{'המכשיר מודד מול **5** שיטות, ומראה איפה הסטייה ובכמה.'}</Rich>
          <div className="hero-cta">
            <a className="press btn tb-primary" href={href('measure', { st: 'ex-residential', s: 'golden' })}>למדידה</a>
            <a className="press btn" href={href('systems', { m: 'golden' })}>השוואת השיטות על תמונה</a>
          </div>
          <div className="tones">
            <div className="tone tone-problem"><h4>הבעיה</h4><Rich as="p">{'"לא מאוזן" היא תחושה, בלי מספר.'}</Rich></div>
            <div className="tone tone-solution"><h4>הפתרון</h4><Rich as="p">{'סטייה **באחוזים** ותיקון **בסנטימטרים**.'}</Rich></div>
            <div className="tone tone-insight"><h4>התובנה</h4><Rich as="p">{'==שיטה אחת לא מסבירה הכול.=='}</Rich></div>
          </div>
        </div>
        <div className="hero-fig rise" style={{ animationDelay: '.15s' }}>
          <div className="label">נסו: גררו את הקו</div>
          <GoldenToy />
        </div>
      </section>

      <section className="method-strip" aria-label="חמש השיטות">
        {METHODS.map((x) => (
          <a key={x.id} className="ms-tile press" href={href('systems', { m: x.id })} style={{ ['--sys' as string]: SYSTEM[x.id].color }}>
            <span className="ms-name"><i className="sys-dot" />{SYSTEM[x.id].name}</span>
            <Rich as="span" className="ms-insight">{x.insight}</Rich>
            <span className="ms-sci">מדע: {x.science.label}</span>
          </a>
        ))}
      </section>
    </div>
  );
}
