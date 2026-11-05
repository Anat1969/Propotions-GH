// לוחות התשובות: כל לוח עונה על שאלה אחת של המשתמש, עם מספר גדול ותובנה מחושבת מתחתיו.
import { useState } from 'react';
import { BAND_NAME, bandColor, bestOf, worstOf, cm, computedReading, pct, type Measured, type Result, type Study } from '../lib/engine';
import { SYSTEM, SYSTEMS, type SystemId } from '../lib/systems';
import { askReading, type Reading } from '../lib/ai';
import Rich from './Rich';

const verdict = (i: number) => (i >= 80 ? 'הרמוני' : i >= 55 ? 'קרוב' : 'סוטה');
const verdictBand = (i: number) => (i >= 80 ? 'ok' : i >= 55 ? 'near' : 'off') as 'ok' | 'near' | 'off';

/** שאלה 1: כמה הקומפוזיציה הרמונית? */
export function IndexPanel({ res, study }: { res: Result; study: Study }) {
  const def = SYSTEM[res.system];
  const n = res.items.length;
  const r = computedReading(study, res, [res]);
  return (
    <section className="q" aria-labelledby="q1">
      <div className="q-label" id="q1">1. כמה {study.kind === 'plan' ? 'התוכנית' : 'החזית'} הרמונית?</div>
      <div className="big-row">
        <bdi className="big num" data-testid="index" style={{ color: bandColor(verdictBand(res.index)) }}>{res.index}%</bdi>
        <div className="big-side">
          <div className="big-verdict">{verdict(res.index)}</div>
          <div className="big-sys">לפי {def.name}</div>
        </div>
      </div>
      <div className="bandbar" aria-label="התפלגות הרכיבים">
        {(['ok', 'near', 'off'] as const).map((b) => {
          const c = b === 'ok' ? res.okCount : b === 'near' ? res.nearCount : res.offCount;
          return c ? <span key={b} style={{ flex: c, background: bandColor(b) }} title={`${BAND_NAME[b]}: ${c}`} /> : null;
        })}
      </div>
      <div className="legend-row">
        <span><i style={{ background: 'var(--ok)' }} />מדויק <b className="num">{res.okCount}</b></span>
        <span><i style={{ background: 'var(--near)' }} />קרוב <b className="num">{res.nearCount}</b></span>
        <span><i style={{ background: 'var(--off)' }} />סוטה <b className="num">{res.offCount}</b></span>
        <span className="mute">מתוך <b className="num">{n}</b></span>
      </div>
      <Rich as="p" className="insight-line">{r.insight}</Rich>
      <Rich as="p" className="explain">{`${def.family === 'ratio' ? 'היחס הממוצע סוטה' : 'המידה הממוצעת סוטה'} ב-**${pct(res.meanDev)}** מהיעד הקרוב.`}</Rich>
      {res.edgeCount > 0 && <Rich as="p" className="explain mute">{`**${res.edgeCount}** רכיבים על הגבול: דיוק הסימון לא מאפשר להכריע.`}</Rich>}
    </section>
  );
}

/** שאלה 3: איזו שיטה מסבירה את הקומפוזיציה הכי טוב? (סדרות קטנות) */
export function SystemsPanel({ all, system, onPick }: { all: Result[]; system: SystemId; onPick: (s: SystemId) => void }) {
  const best = bestOf(all);
  const worst = worstOf(all);
  return (
    <section className="q" aria-labelledby="q3">
      <div className="q-label" id="q3">3. איזו שיטה מסבירה אותה הכי טוב?</div>
      <div className="sysbars">
        {SYSTEMS.map((s) => {
          const r = all.find((x) => x.system === s.id)!;
          return (
            <button key={s.id} className={`sysbar press${system === s.id ? ' is-on' : ''}`} aria-pressed={system === s.id} onClick={() => onPick(s.id)}>
              <span className="sb-name">{s.short}{!s.harmony && <small className="sb-note">בנייה</small>}</span>
              <span className="sb-track"><span className="sb-fill" style={{ width: `${r.index}%`, background: s.color }} /></span>
              <bdi className="sb-val num">{r.index}%</bdi>
            </button>
          );
        })}
      </div>
      <Rich as="p" className="insight-line">{`**${SYSTEM[best.system].name}** מסביר הכי טוב.`}</Rich>
      <Rich as="p" className="explain">{`${best.index}% מול ${worst.index}% לפי ${SYSTEM[worst.system].name}. מודול 10 ס"מ בודק התאמה לבנייה, ולא נכנס לדירוג: **${all.find((r) => r.system === 'module')!.index}%**.`}</Rich>
    </section>
  );
}

/** שאלות 2 ו-4: איפה היא סוטה ובכמה, ומה לתקן? */
export function DeviationsPanel({ res, selected, onSelect }: { res: Result; selected: string | null; onSelect: (id: string | null) => void }) {
  const rows = [...res.items].sort((a, b) => b.dev - a.dev);
  const def = SYSTEM[res.system];
  const max = Math.max(def.orange * 3, ...rows.map((r) => r.dev));
  const worst = rows[0];
  const fixes = rows.filter((r) => r.band !== 'ok').slice(0, 3);
  return (
    <section className="q q-dev" aria-labelledby="q2">
      <div className="q-label" id="q2">2. איפה היא סוטה ובכמה?</div>
      {worst ? (
        <>
          <Rich as="p" className="insight-line">{`הסטייה הגדולה: **${worst.label}**.`}</Rich>
          <Rich as="p" className="explain">{`${worst.unit === 'ratio' ? `יחס ${worst.value.toFixed(2)}` : cm(worst.value)} מול ${worst.targetName}: סטייה של **${pct(worst.dev)}**.`}</Rich>
        </>
      ) : (
        <p className="explain">אין עדיין רכיבים למדידה. בחרו "קו אנכי" או "קו אופקי" וסמנו על השרטוט.</p>
      )}
      <div className="devscale" aria-hidden="true">
        <span style={{ width: `${(def.green / max) * 100}%`, background: 'var(--ok-wash)' }}>מדויק</span>
        <span style={{ width: `${((def.orange - def.green) / max) * 100}%`, background: 'var(--near-wash)' }}>קרוב</span>
        <span style={{ flex: 1, background: 'var(--off-wash)' }}>סוטה</span>
      </div>
      <ul className="devlist scroll-in" data-testid="devlist">
        {rows.map((m) => (
          <DevRow key={m.id} m={m} max={max} on={selected === m.id} onClick={() => onSelect(selected === m.id ? null : m.id)} />
        ))}
      </ul>
      <div className="q-label q4">4. מה לתקן קודם?</div>
      {fixes.length ? (
        <ol className="fixes">
          {fixes.map((m) => <li key={m.id}><Rich>{`**${m.label}:** ${m.fix}.`}</Rich></li>)}
        </ol>
      ) : (
        <p className="explain tone-ok-text">כל הרכיבים בתחום. אין מה לתקן לפי {def.name}.</p>
      )}
    </section>
  );
}

function DevRow({ m, max, on, onClick }: { m: Measured; max: number; on: boolean; onClick: () => void }) {
  return (
    <li>
      <button className={`devrow${on ? ' is-sel' : ''}`} onClick={onClick} aria-pressed={on}>
        <span className="dr-label">{m.label}</span>
        <span className="dr-bar"><span style={{ width: `${Math.min(100, (m.dev / max) * 100)}%`, background: bandColor(m.band) }} /></span>
        <bdi className="dr-val num" style={{ color: bandColor(m.band) }}>{pct(m.dev)}</bdi>
      </button>
      {on && (
        <div className="dr-more">
          <span className="label">נמדד</span> <bdi className="num">{m.unit === 'ratio' ? m.value.toFixed(3) : cm(m.value)}</bdi>
          <span className="label">יעד</span> <span>{m.targetName}</span>
          <span className="label">אי־ודאות</span> <bdi className="num">±{pct(m.unc)}</bdi>
          <div className="dr-fix"><Rich>{`**תיקון:** ${m.fix}`}</Rich></div>
        </div>
      )}
    </li>
  );
}

/** קריאה מקצועית: שכבה מחושבת (תמיד), שכבת מודל (בלחיצה) ושכבת איש המקצוע (הערה). */
export function ReadingPanel({ study, res, all, onNote }: { study: Study; res: Result; all: Result[]; onNote: (note: string) => void }) {
  const [ai, setAi] = useState<Reading | null>(null);
  const [state, setState] = useState<'idle' | 'busy' | 'error'>('idle');
  const [err, setErr] = useState('');
  const r = computedReading(study, res, all);
  const ask = async () => {
    setState('busy'); setErr('');
    try { setAi(await askReading(study, res, all)); setState('idle'); } catch (e) { setErr((e as Error).message); setState('error'); }
  };
  return (
    <section className="q reading" aria-labelledby="q5">
      <div className="q-label" id="q5">קריאה בשלוש שכבות</div>
      <div className="layer">
        <span className="label">מחושב בקוד</span>
        <Rich as="p" className="insight-line">{r.insight}</Rich>
        <Rich as="p" className="explain">{r.detail}</Rich>
        <Rich as="p" className="explain">{r.cross}</Rich>
      </div>
      <div className="layer">
        <span className="label">ניסוח מודל {ai ? `(${ai.engine === 'claude' ? 'Claude' : 'Gemini'})` : ''}</span>
        {ai ? (
          <div data-testid="ai-reading">
            <Rich as="p" className="insight-line">{ai.reading.insight}</Rich>
            <Rich as="p" className="explain">{ai.reading.detail}</Rich>
            <ol className="fixes">{ai.actions.slice(0, 3).map((a, i) => <li key={i}><Rich>{a}</Rich></li>)}</ol>
          </div>
        ) : (
          <button className="press btn" onClick={ask} disabled={state === 'busy' || !res.items.length}>{state === 'busy' ? 'קורא...' : 'קריאה מקצועית'}</button>
        )}
        {state === 'error' && <p className="explain err" role="alert">{err}</p>}
      </div>
      <div className="layer">
        <label className="label" htmlFor="note">קביעת איש המקצוע</label>
        <textarea id="note" className="field note" rows={2} placeholder="מה ראית שהמכשיר לא רואה? נשמר אוטומטית." value={study.note ?? ''} onChange={(e) => onNote(e.target.value)} />
      </div>
    </section>
  );
}
