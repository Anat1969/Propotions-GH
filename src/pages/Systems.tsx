// מסך השיטות: בוחרים שיטה, רואים אותה מונחת על דוגמה, ומשווים לשאר השיטות על אותה תמונה.
import { useEffect, useMemo, useState } from 'react';
import Rich from '../components/Rich';
import Stage, { EXAMPLES, readouts } from '../components/Stage';
import Photo, { PHOTOS } from '../components/Photo';
import { METHOD, METHODS, type ExampleId } from '../lib/methods';
import { SYSTEM, SYSTEMS, type SystemId } from '../lib/systems';
import { go, href, useRoute } from '../lib/route';
import { pct } from '../lib/engine';

const EX_ORDER: ExampleId[] = ['parthenon', 'rotonda', 'novella', 'residential'];
const VERDICT_TONE = { 'חזק': 'ok', 'חלקי': 'near', 'חלש': 'off' } as const;

export default function Systems() {
  const { params } = useRoute();
  const m = (params.m && params.m in SYSTEM ? params.m : 'golden') as SystemId;
  const info = METHOD[m];
  const ex = (params.ex && params.ex in EXAMPLES ? params.ex : info.examples[0]) as ExampleId;
  const E = EXAMPLES[ex];
  const [active, setActive] = useState<SystemId[]>([m]);
  const [photoMode, setPhotoMode] = useState(true);
  const [noPhoto, setNoPhoto] = useState<Record<string, boolean>>({});
  const [ratio, setRatio] = useState<number | null>(null);
  const [aligned, setAligned] = useState(false);
  const [width, setWidth] = useState<string>('');

  useEffect(() => { setActive([m]); }, [m]);
  useEffect(() => { setRatio(null); setAligned(false); setWidth(E.photoHint ? E.photoHint.match(/[\d.]+/)?.[0] ?? '' : ''); }, [ex, photoMode, E.photoHint]);

  const usePhoto = photoMode && !!E.photo && !noPhoto[ex];
  const r = usePhoto ? ratio ?? (0.84 * 600) / (0.76 * 400) : E.frame.w / E.frame.h;
  const wM = usePhoto ? (parseFloat(width) || null) : E.widthM ?? null;
  const showRead = (usePhoto && aligned) || (!usePhoto && E.exact);
  const rows = useMemo(() => readouts(active, r, wM), [active, r, wM]);
  const toggle = (id: SystemId) => setActive((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  const all = active.length === SYSTEMS.length;

  return (
    <div className="sys-screen">
      <nav className="sys-nav" aria-label="שיטות">
        <div className="label">שיטה</div>
        {METHODS.map((x) => (
          <a key={x.id} className={`sys-tab press${x.id === m ? ' is-on' : ''}`} aria-current={x.id === m ? 'true' : undefined} href={href('systems', { m: x.id })} style={{ ['--sys' as string]: SYSTEM[x.id].color }}>
            <span className="st-name"><i className="sys-dot" />{SYSTEM[x.id].name}</span>
            <span className={`st-sci tone-${VERDICT_TONE[x.science.verdict]}`}>{x.science.label}</span>
          </a>
        ))}
        <p className="explain sys-how">בוחרים שיטה. הסרגל שלה מונח על הדוגמה. מדליקים סרגלים נוספים כדי להשוות.</p>
      </nav>

      <section className="sys-stage">
        <div className="stage-bar">
          <div className="tb-group" role="group" aria-label="דוגמה">
            <span className="label">דוגמה</span>
            {EX_ORDER.map((id) => (
              <button key={id} className="chip-tool" aria-pressed={id === ex} onClick={() => go('systems', { m, ex: id }, true)}>
                {EXAMPLES[id].name}{info.examples.includes(id) && <i className="rec-dot" title="דוגמה לשיטה הזו" />}
              </button>
            ))}
          </div>
          <div className="tb-group" role="group" aria-label="בסיס">
            <button className="chip-tool" aria-pressed={!usePhoto} onClick={() => setPhotoMode(false)}>איור</button>
            <button className="chip-tool" aria-pressed={usePhoto} disabled={!E.photo || noPhoto[ex]} title={noPhoto[ex] ? 'הצילום לא נטען' : undefined} onClick={() => setPhotoMode(true)}>צילום</button>
            {usePhoto && (
              <>
                <label className="label" htmlFor="sw">רוחב, מ'</label>
                <input id="sw" className="field tb-num" type="number" min={1} step={0.01} value={width} placeholder="?" onChange={(e) => setWidth(e.target.value)} />
              </>
            )}
          </div>
          <div className="tb-group" role="group" aria-label="סרגלים">
            <span className="label">סרגלים</span>
            {SYSTEMS.map((s) => (
              <button key={s.id} className="chip-tool" aria-pressed={active.includes(s.id)} onClick={() => toggle(s.id)} style={{ ['--sys' as string]: s.color }}>
                <i className="sys-dot" />{s.short}
              </button>
            ))}
            <button className="chip-all" aria-pressed={all} onClick={() => setActive(all ? [m] : SYSTEMS.map((s) => s.id))}>הכול</button>
          </div>
        </div>

        <div className="stage-wrap">
          <Stage key={ex + String(usePhoto)} example={ex} active={active} photoMode={usePhoto} widthM={wM} onFrame={(r2, al) => { setRatio(r2); setAligned(al); }} onPhotoFail={() => setNoPhoto((n) => ({ ...n, [ex]: true }))} />
        </div>

        <div className="stage-read" aria-live="polite">
          {!showRead ? (
            usePhoto ? <span className="explain"><b>גררו את שתי הפינות הלבנות</b> לקצות החזית, ואז תופיע הקריאה.</span>
              : <span className="explain">איור סכמטי: הסרגלים מראים את הדרך, לא מדידה. למדידה: <b>צילום</b>, וכיוון המסגרת לקצוות החזית.</span>
          ) : rows.length === 0 ? (
            <span className="explain">הדליקו סרגל כדי לקרוא.</span>
          ) : (
            rows.map((x) => (
              <span key={x.id} className="read-chip" style={{ ['--sys' as string]: SYSTEM[x.id].color }}>
                <i className="sys-dot" /><b>{SYSTEM[x.id].short}</b> {x.text}
                {!isNaN(x.dev) && <bdi className="num" style={{ color: x.ok ? 'var(--ok)' : 'var(--off)' }}> {pct(x.dev)}</bdi>}
              </span>
            ))
          )}
          {usePhoto && aligned && E.photoHint && <span className="explain mute">{E.photoHint}</span>}
        </div>
      </section>

      <aside className="sys-info" style={{ ['--sys' as string]: SYSTEM[m].color }}>
        <div className="si-head">
          <h1 className="si-title">{SYSTEM[m].name}</h1>
          <span className="sys-latin">{SYSTEM[m].latin}</span>
        </div>
        <Rich as="p" className="si-insight">{info.insight}</Rich>
        <dl className="si-dl">
          <dt className="label">מאיפה</dt>
          <dd>{info.source}</dd>
          <dt className="label">איפה למצוא</dt>
          <dd>{info.where.url ? <a href={info.where.url} target="_blank" rel="noreferrer">{info.where.text}</a> : info.where.text}</dd>
          <dt className="label">למה זו שיטה</dt>
          <dd><Rich>{info.why}</Rich></dd>
          <dt className="label">מה המדע אומר</dt>
          <dd>
            <span className={`sci-pill tone-${VERDICT_TONE[info.science.verdict]}`}>{info.science.label}</span>
            <Rich as="span" className="sci-text">{info.science.text}</Rich>
            <span className="src">{info.science.src}</span>
          </dd>
          <dt className="label">דוגמה</dt>
          <dd>{info.exampleNote}</dd>
        </dl>
        {m === 'modulor' && <Photo src={PHOTOS.modulor} className="si-photo" width={600} />}
        <a className="press btn tb-primary si-go" href={href('measure', { st: 'ex-residential', s: m })}>למדידה לפי {SYSTEM[m].short}</a>
      </aside>
    </div>
  );
}
