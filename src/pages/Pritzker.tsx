// מסך פריצקר: חמישה מבנים אייקוניים של זוכי הפרס, מאפליקציית פרס נובל, נמדדים במנוע של המכשיר.
// הציון: שיטת היחס (זהב או פלאדיו) שמסבירה הכי טוב. שיטות המידה מוצגות בנפרד, כי מבנה של 183 מ' אינו בקנה מידה של גוף.
import { useMemo } from 'react';
import Rich from '../components/Rich';
import { measure, measureAll, pct, type Result } from '../lib/engine';
import { SYSTEM, type SystemId } from '../lib/systems';
import { NOBEL, PRITZKER, nobelHref, type PritzkerCase } from '../lib/pritzker';
import { go, href, useRoute } from '../lib/route';

const RATIO: SystemId[] = ['golden', 'palladio'];
const SIZE: SystemId[] = ['modulor', 'renard'];
const tone = (n: number) => (n >= 80 ? 'ok' : n >= 50 ? 'near' : 'off');
const VERDICT = { ok: 'מוסבר היטב', near: 'חלקית', off: 'לא מוסבר' } as const;

function scoreOf(p: PritzkerCase) {
  const all = measureAll(p.study);
  const ratio = all.filter((r) => RATIO.includes(r.system)).sort((a, b) => b.index - a.index);
  return { all, best: ratio[0] };
}

/** החזית או התוכנית כשרטוט: המסגרת, קווי החלוקה, ומלבן היעד של השיטה הטובה מונח עליה. */
function Plan({ p, best }: { p: PritzkerCase; best: Result }) {
  const st = p.study;
  const W = 520, H = W * st.aspect, pad = 34;
  const frame = best.items.find((m) => m.kind === 'frame')!;
  const long = st.aspect <= 1;
  // מלבן היעד באותו גובה (או רוחב) של המסגרת
  const tw = long ? H * frame.target : W, th = long ? H : W / frame.target;
  const color = SYSTEM[best.system].color;
  return (
    <svg className="pz-plan" viewBox={`${-pad} ${-pad} ${W + pad * 2} ${Math.max(H, th) + pad * 2 + 20}`} role="img" aria-label={`${p.work}: ${p.view}`} style={{ direction: 'ltr' }}>
      <defs><pattern id="pzgrid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0L0 0 0 10" fill="none" stroke="var(--grid)" strokeWidth=".7" /></pattern></defs>
      <rect x={-pad} y={-pad} width={W + pad * 2} height={Math.max(H, th) + pad * 2 + 20} fill="url(#pzgrid)" />
      {p.slug === 'i-m-pei'
        ? <path d={`M0 ${H}L${W / 2} 0L${W} ${H}`} fill="#fff" stroke="var(--ink)" strokeWidth="2.2" className="pz-ink" pathLength={1} />
        : <rect x={0} y={0} width={W} height={H} fill="#fff" stroke="var(--ink)" strokeWidth="2.2" className="pz-ink" pathLength={1} />}
      {p.slug === 'i-m-pei' && <rect x={0} y={0} width={W} height={H} fill="none" stroke="var(--ink-mute)" strokeDasharray="3 4" />}
      {st.vx.map((x) => <line key={x} x1={x * W} x2={x * W} y1={0} y2={H} stroke="var(--ink)" strokeWidth="1.2" />)}
      {st.hy.map((y) => <line key={y} y1={y * H} y2={y * H} x1={0} x2={W} stroke="var(--ink)" strokeWidth="1.2" />)}
      <rect x={0} y={0} width={tw} height={th} fill="none" stroke={color} strokeWidth="3" strokeDasharray="10 6" className="pz-target" />
      <g fontFamily="var(--mono)" fontSize="14" fill="var(--ink-soft)">
        <text x={W / 2} y={H + 24} textAnchor="middle">{st.widthM.toFixed(st.widthM < 40 ? 1 : 0)} m</text>
        <text x={W + 8} y={H / 2} dominantBaseline="middle">{(st.widthM * st.aspect).toFixed(1)} m</text>
      </g>
    </svg>
  );
}

export default function Pritzker() {
  const { params } = useRoute();
  const rows = useMemo(() => PRITZKER.map((p) => ({ p, ...scoreOf(p) })).sort((a, b) => b.best.index - a.best.index), []);
  const cur = rows.find((r) => r.p.slug === params.id) ?? rows[0];
  const { p, best, all } = cur;
  const frame = best.items.find((m) => m.kind === 'frame')!;

  return (
    <div className="pz-screen">
      <header className="pz-head">
        <div className="label">פריצקר × מד הפרופורציות · <bdi className="num">5</bdi> מבנים מתוך <a href={`${NOBEL}/#/pritzker`} target="_blank" rel="noreferrer">חדר פריצקר באפליקציית פרס נובל</a></div>
        <Rich as="h1" className="pz-title">{'==רק הפירמידה של פיי נבנתה ביחס הזהב.=='}</Rich>
        <Rich as="p" className="pz-sub">{'המידות ממקורות שפורסמו, לא מסימון על צילום. **הציון**: שיטת היחס שמסבירה הכי טוב, זהב או פלאדיו, במנוע של המכשיר.'}</Rich>
      </header>

      <ol className="pz-rank" aria-label="דירוג המבנים">
        {rows.map((r, i) => (
          <li key={r.p.slug}>
            <a className={`pz-row press${r.p.slug === p.slug ? ' is-on' : ''}`} aria-current={r.p.slug === p.slug ? 'true' : undefined} href={href('pritzker', { id: r.p.slug })} onClick={(e) => { e.preventDefault(); go('pritzker', { id: r.p.slug }, true); }}>
              <bdi className="num pz-i">{i + 1}</bdi>
              <span className="pz-name"><b>{r.p.work}</b><span>{r.p.architect} · פריצקר <bdi className="num">{r.p.prize}</bdi></span></span>
              <span className={`pz-score num tone-${tone(r.best.index)}`}>{r.best.index}</span>
              <span className="pz-sys"><i className="sys-dot" style={{ ['--sys' as string]: SYSTEM[r.best.system].color }} />{SYSTEM[r.best.system].short}</span>
            </a>
          </li>
        ))}
        <li className="pz-key explain">ציון <b className="tone-ok">80+</b> מוסבר היטב · <b className="tone-near">50 עד 79</b> חלקית · <b className="tone-off">מתחת ל-50</b> לא מוסבר.</li>
      </ol>

      <section className="pz-focus" key={p.slug}>
        <div className="pz-visual">
          <figure className="pz-photo">
            <img src={`${import.meta.env.BASE_URL}${p.photo.file}`} alt={`${p.work}, ${p.place}`} loading="lazy" />
            <figcaption><span>{p.work} · {p.workEn} · {p.place} · <bdi className="num">{p.built}</bdi></span><a href={p.photo.page} target="_blank" rel="noreferrer">{p.photo.by}, {p.photo.lic}, Wikimedia Commons</a></figcaption>
          </figure>
          <figure className="pz-draw">
            <Plan p={p} best={best} />
            <figcaption className="explain"><b>{p.view}.</b> קו דיו: המבנה. <span style={{ color: SYSTEM[best.system].color }}>מקווקו בצבע: היעד של {SYSTEM[best.system].short}, {frame.targetName}</span>, באותו גובה.</figcaption>
          </figure>
        </div>

        <div className="pz-read">
          <p className="label">{p.architect} {p.architectEn} · <a href={nobelHref(p.slug)} target="_blank" rel="noreferrer">בפרס נובל</a></p>
          <h2 className="pz-work">{p.work}</h2>
          <div className="pz-verdict">
            <span className={`pz-big num tone-${tone(best.index)}`}>{best.index}</span>
            <span><b className={`tone-${tone(best.index)}`}>{VERDICT[tone(best.index)]}</b> לפי {SYSTEM[best.system].name}<br /><span className="explain">יחס המסגרת <bdi className="num">{frame.value.toFixed(2)}</bdi>, סטייה <bdi className="num">{pct(frame.dev)}</bdi> מ-{frame.targetName}</span></span>
          </div>
          <Rich as="p" className="pz-insight">{p.insight}</Rich>
          <Rich as="p" className="pz-why">{p.why}</Rich>

          <div className="pz-bars" aria-label="ציון לכל שיטה">
            {[...RATIO, ...SIZE].map((id) => {
              const r = all.find((x) => x.system === id) ?? measure(p.study, id);
              const size = SIZE.includes(id);
              return (
                <div key={id} className={`pz-bar${size ? ' is-size' : ''}`} style={{ ['--sys' as string]: SYSTEM[id].color }}>
                  <span className="pz-bar-n">{SYSTEM[id].short}</span>
                  <span className="pz-bar-t"><i style={{ width: `${r.index}%` }} /></span>
                  <bdi className="num">{r.index}</bdi>
                </div>
              );
            })}
            <p className="explain">המודולור ו-R10 בודקים <b>מידה</b>, לא יחס. הם נבנו לקנה מידה של גוף ומוצר, ולכן לא נכנסים לציון.{p.slug === 'tadao-ando' && <> ובכל זאת: הקובייה של אנדו, <bdi className="num">5.9</bdi> מ', כמעט זהה ל-<bdi className="num">5918</bdi> מ"מ בסדרה הכחולה של המודולור.</>}</p>
          </div>

          <dl className="pz-src">
            <dt className="label">מידות</dt><dd><Rich>{p.dims}</Rich></dd>
            <dt className="label">פער בין מקורות</dt><dd>{p.spread}</dd>
          </dl>
          <a className="press btn tb-primary" href={href('measure', { st: p.study.id, s: best.system })}>למדידה המלאה: קווים, סטיות ותיקון</a>
        </div>
      </section>
    </div>
  );
}
