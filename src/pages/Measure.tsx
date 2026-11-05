// מסך המדידה: סרגל כלים קבוע, שרטוט חי במרכז, ותשובות לארבע שאלות סביבו.
import { useEffect, useMemo, useRef, useState } from 'react';
import Drawing, { type Tool } from '../components/Drawing';
import Rectify from '../components/Rectify';
import { rectifyImage, type Pt } from '../lib/rectify';
import { DeviationsPanel, IndexPanel, ReadingPanel, SystemsPanel } from '../components/Panels';
import { measure, measureAll, type Study } from '../lib/engine';
import { EXAMPLES } from '../lib/examples';
import { SYSTEMS, SYSTEM, type SystemId } from '../lib/systems';
import { newId, readImage } from '../lib/store';
import { askDetect } from '../lib/ai';

interface Props {
  study: Study;
  own: Study[];
  system: SystemId;
  onSystem: (s: SystemId) => void;
  onOpen: (id: string) => void;
  onChange: (s: Study) => void;
}

const TOOLS: { id: Tool; name: string; hint: string }[] = [
  { id: 'select', name: 'בחירה', hint: 'גוררים קו, רכיב או ידית מסגרת. לחיצה על תא מדגישה אותו.' },
  { id: 'v', name: 'קו אנכי', hint: 'לחיצה על השרטוט מוסיפה קו חלוקה אנכי: גבול מפרש או חדר.' },
  { id: 'h', name: 'קו אופקי', hint: 'לחיצה על השרטוט מוסיפה קו חלוקה אופקי: קו קומה או כרכוב.' },
  { id: 'rect', name: 'רכיב', hint: 'גוררים מלבן סביב חלון, דלת או חדר.' },
  { id: 'erase', name: 'מחיקה', hint: 'לחיצה על קו או רכיב מוחקת אותו.' },
];

type MobTab = 'draw' | 'answers' | 'dev';

export default function Measure({ study, own, system, onSystem, onOpen, onChange }: Props) {
  const [tool, setTool] = useState<Tool>('select');
  const [guides, setGuides] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [mob, setMob] = useState<MobTab>('draw');
  const [msg, setMsg] = useState<{ t: 'err' | 'ok'; s: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [rectifying, setRectifying] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  const all = useMemo(() => measureAll(study), [study]);
  const res = useMemo(() => measure(study, system), [study, system]);
  useEffect(() => setSelected(null), [system, study.id]);
  useEffect(() => { if (!study.image) setRectifying(false); }, [study.image]);

  // מקלדת: Delete מוחק את הרכיב הנבחר, Escape מבטל בחירה
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input,textarea')) return;
      if (e.key === 'Escape') { setSelected(null); setTool('select'); }
      const keys: Record<string, Tool> = { v: 'v', h: 'h', r: 'rect', s: 'select' };
      if (keys[e.key] && !e.metaKey && !e.ctrlKey) setTool(keys[e.key]);
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, []);

  const editable = (s: Study) => {
    // דוגמה נפתחת כעותק אישי בעריכה הראשונה, כך שהדוגמה המקורית נשמרת
    if (!s.example) return s;
    return { ...s, id: newId(), name: `${s.name} (עותק)`, example: false };
  };
  const change = (s: Study) => onChange(editable(s));

  const upload = async (f?: File) => {
    if (!f) return;
    setMsg(null);
    try {
      const img = await readImage(f);
      const st: Study = {
        id: newId(), name: f.name.replace(/\.[^.]+$/, '').slice(0, 40) || 'חזית מתמונה', kind: 'facade', widthM: 12,
        image: img.data, imgW: img.w, imgH: img.h, frame: { x0: 0.05, x1: 0.95, y0: 0.05, y1: 0.95 },
        aspect: (0.9 * img.h) / (0.9 * img.w), vx: [], hy: [], rects: [], precision: 0.004, updatedAt: Date.now(),
      };
      onChange(st);
      setTool('select');
      setRectifying(true);
      setMsg({ t: 'ok', s: 'התמונה נטענה. אם צולמה מזווית, גררו את ארבע הפינות ליישור. אם היא חזיתית: "ביטול".' });
    } catch (e) {
      setMsg({ t: 'err', s: (e as Error).message });
    }
  };

  const detect = async () => {
    if (!study.image) return;
    setBusy(true); setMsg(null);
    try {
      const d = await askDetect(study.image);
      const f = d.frame.x1 - d.frame.x0 > 0.1 && d.frame.y1 - d.frame.y0 > 0.1 ? d.frame : study.frame!;
      const fx = (v: number) => (v - f.x0) / (f.x1 - f.x0);
      const fy = (v: number) => (v - f.y0) / (f.y1 - f.y0);
      onChange({
        ...study, frame: f, aspect: ((f.y1 - f.y0) * study.imgH!) / ((f.x1 - f.x0) * study.imgW!),
        vx: d.vx.map(fx).filter((v) => v > 0.01 && v < 0.99), hy: d.hy.map(fy).filter((v) => v > 0.01 && v < 0.99),
        rects: d.rects.map((r) => ({ id: newId(), x: fx(r.x), y: fy(r.y), w: r.w / (f.x1 - f.x0), h: r.h / (f.y1 - f.y0), label: r.label })).filter((r) => r.w > 0.01 && r.h > 0.01 && r.x >= 0 && r.y >= 0),
        updatedAt: Date.now(),
      });
      setMsg({ t: 'ok', s: `זוהו ${d.vx.length} קווים אנכיים ו-${d.hy.length} אופקיים. זו הצעה: גררו או מחקו מה שלא מדויק.` });
    } catch (e) {
      setMsg({ t: 'err', s: `הזיהוי האוטומטי לא הצליח: ${(e as Error).message} אפשר לסמן ידנית בכלי "קו אנכי".` });
    } finally {
      setBusy(false);
    }
  };

  const rectify = async (quad: Pt[]) => {
    if (!study.image) return;
    setBusy(true);
    try {
      const r = await rectifyImage(study.image, quad);
      onChange({ ...study, image: r.data, imgW: r.w, imgH: r.h, frame: { x0: 0, x1: 1, y0: 0, y1: 1 }, aspect: r.h / r.w, updatedAt: Date.now() });
      setRectifying(false);
      setMsg({ t: 'ok', s: 'החזית יושרה למלבן. הזינו את הרוחב האמיתי במטרים, וסמנו קווי חלוקה.' });
    } catch {
      setMsg({ t: 'err', s: 'היישור לא הצליח. נסו להזיז את הפינות כך שייצרו מרובע קמור.' });
    } finally {
      setBusy(false);
    }
  };
  const initialQuad = (): Pt[] | undefined => {
    if (!study.imgW || !study.imgH || !study.frame) return undefined;
    const { x0, x1, y0, y1 } = study.frame; const W = study.imgW, H = study.imgH;
    return [{ x: x0 * W, y: y0 * H }, { x: x1 * W, y: y0 * H }, { x: x1 * W, y: y1 * H }, { x: x0 * W, y: y1 * H }];
  };

  const hint = TOOLS.find((t) => t.id === tool)!.hint;

  return (
    <div className="measure">
      <div className="toolbar" role="toolbar" aria-label="סרגל כלים">
        <div className="tb-group" aria-label="מחקר">
          <span className="label">מחקר</span>
          <select className="field tb-select" aria-label="בחירת מחקר" value={study.id} onChange={(e) => onOpen(e.target.value)}>
            <optgroup label="דוגמאות">{EXAMPLES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</optgroup>
            {own.length > 0 && <optgroup label="המחקרים שלי">{own.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</optgroup>}
          </select>
          <button className="press btn tb-primary" onClick={() => file.current?.click()}>העלאת תמונה</button>
          <input ref={file} type="file" accept="image/*" hidden aria-label="קובץ תמונה" onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ''; }} />
          {study.image && <button className="press btn" onClick={() => setRectifying(!rectifying)} aria-pressed={rectifying}>יישור פרספקטיבה</button>}
          {study.image && <button className="press btn" onClick={detect} disabled={busy || rectifying}>{busy && !rectifying ? 'מזהה...' : 'זיהוי קווים'}</button>}
        </div>
        <div className="tb-group" aria-label="כלים">
          <span className="label">כלי</span>
          {TOOLS.map((t) => (
            <button key={t.id} className="chip-tool" aria-pressed={tool === t.id} onClick={() => setTool(t.id)} title={t.hint}>{t.name}</button>
          ))}
        </div>
        <div className="tb-group" aria-label="קנה מידה">
          <label className="label" htmlFor="w">רוחב, מ'</label>
          <input id="w" className="field tb-num" type="number" min={0.5} max={500} step={0.1} value={study.widthM}
            onChange={(e) => { const v = parseFloat(e.target.value); if (v > 0) change({ ...study, widthM: v, updatedAt: Date.now() }); }} />
          <span className="tb-h mute">גובה <bdi className="num">{(study.widthM * study.aspect).toFixed(2)}</bdi> מ'</span>
        </div>
        <div className="tb-group" aria-label="שיטה">
          <span className="label">שיטה</span>
          {SYSTEMS.map((s) => (
            <button key={s.id} className="chip-tool" aria-pressed={system === s.id} onClick={() => onSystem(s.id)} style={{ ['--sys' as string]: s.color }}>
              <i className="sys-dot" />{s.short}
            </button>
          ))}
          <button className="chip-tool" aria-pressed={guides} onClick={() => setGuides(!guides)} title="חתכי זהב ואלכסוני המסגרת">קווי ויסות</button>
        </div>
      </div>
      <div className="hintline" aria-live="polite">
        {msg ? <span className={msg.t === 'err' ? 'err' : 'ok-text'} role={msg.t === 'err' ? 'alert' : undefined}>{msg.s}</span> : <span><b>{TOOLS.find((t) => t.id === tool)!.name}:</b> {hint} {SYSTEM[system].family === 'size' && <span className="mute">מידות במטרים בשרטוט.</span>}</span>}
      </div>

      <div className="mobtabs" role="tablist">
        {([['draw', 'שרטוט'], ['answers', 'תשובות'], ['dev', 'סטיות ותיקון']] as const).map(([id, nm]) => (
          <button key={id} role="tab" className="chip-tool" aria-selected={mob === id} aria-pressed={mob === id} onClick={() => setMob(id)}>{nm}</button>
        ))}
      </div>

      <div className={`mgrid mob-${mob}`}>
        <aside className="col-answers">
          <IndexPanel res={res} study={study} />
          <SystemsPanel all={all} system={system} onPick={onSystem} />
        </aside>
        <figure className="col-draw">
          {rectifying && study.image ? (
            <Rectify key={study.id + study.imgW} image={study.image} w={study.imgW!} h={study.imgH!} initial={initialQuad()} busy={busy} onApply={rectify} onCancel={() => { setRectifying(false); setMsg(null); }} />
          ) : (
            <Drawing study={study} result={res} tool={tool} guides={guides} selected={selected} onSelect={setSelected} onChange={change} />
          )}
          <figcaption className="draw-legend">
            <span><i style={{ background: 'var(--ok)' }} />מדויק עד {Math.round(SYSTEM[system].green * 100)}%</span>
            <span><i style={{ background: 'var(--near)' }} />קרוב עד {Math.round(SYSTEM[system].orange * 100)}%</span>
            <span><i style={{ background: 'var(--off)' }} />סוטה</span>
            {guides && <span><i className="dash" />חתך זהב 0.382 / 0.618</span>}
            <span className="mute">{study.example ? 'סכמה להדגמה, לא מדידה של בניין קיים' : study.name}</span>
          </figcaption>
        </figure>
        <aside className="col-dev">
          <DeviationsPanel res={res} selected={selected} onSelect={setSelected} />
          <ReadingPanel study={study} res={res} all={all} onNote={(note) => change({ ...study, note, updatedAt: Date.now() })} />
        </aside>
      </div>
    </div>
  );
}
