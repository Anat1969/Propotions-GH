import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AIMenu, { type MenuItem } from './components/AIMenu';
import Home from './pages/Home';
import Measure from './pages/Measure';
import Systems from './pages/Systems';
import Method from './pages/Method';
import Articles from './pages/Articles';
import { Backdrop } from './components/Visuals';
import { go, href, useRoute, type Page } from './lib/route';
import { blankStudy, findStudy, loadStudies, newId, saveStudies, type SaveState } from './lib/store';
import type { Study } from './lib/engine';
import { SYSTEM, type SystemId } from './lib/systems';

const TABS: { id: Page; name: string }[] = [
  { id: 'home', name: 'בית' },
  { id: 'measure', name: 'מדידה' },
  { id: 'systems', name: 'שיטות' },
  { id: 'article', name: 'כתבות' },
  { id: 'method', name: 'אמינות' },
];

export default function App() {
  const { page, params } = useRoute();
  const [own, setOwn] = useState<Study[]>(loadStudies);
  const [save, setSave] = useState<SaveState>('idle');
  const timer = useRef<number>();

  const system = (params.s && params.s in SYSTEM ? params.s : 'golden') as SystemId;
  const study = findStudy(params.st, own);

  // שמירה אוטומטית, עם חיווי "נשמר" בכפתור הלוגו
  const persist = useCallback((list: Study[]) => {
    setSave('saving');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setSave(saveStudies(list) ? 'saved' : 'error'), 250);
  }, []);

  const upsert = useCallback((s: Study) => {
    setOwn((prev) => {
      const exists = prev.some((p) => p.id === s.id);
      const list = exists ? prev.map((p) => (p.id === s.id ? s : p)) : [s, ...prev];
      persist(list);
      return list;
    });
    if (s.id !== params.st) go('measure', { st: s.id, s: system }, true);
  }, [params.st, persist, system]);

  const remove = useCallback(() => {
    if (study.example) return;
    if (!window.confirm(`למחוק את "${study.name}"? אי אפשר לשחזר.`)) return;
    const list = own.filter((s) => s.id !== study.id);
    setOwn(list);
    persist(list);
    go('measure', { st: 'ex-residential', s: system });
  }, [own, persist, study, system]);

  const items: MenuItem[] = useMemo(() => [
    { label: 'מחקר חדש', hint: 'שרטוט ריק', onSelect: () => upsert(blankStudy()) },
    { label: 'שכפול המחקר', onSelect: () => upsert({ ...study, id: newId(), name: `${study.name} (עותק)`, example: false, updatedAt: Date.now() }) },
    { label: 'שינוי שם', disabled: !!study.example, onSelect: () => { const n = window.prompt('שם המחקר', study.name); if (n?.trim()) upsert({ ...study, name: n.trim().slice(0, 60) }); } },
    { label: 'תוכנית או חזית', hint: study.kind === 'plan' ? 'תוכנית' : 'חזית', onSelect: () => upsert({ ...study, kind: study.kind === 'plan' ? 'facade' : 'plan', ...(study.example ? { id: newId(), example: false } : {}) }) },
    { label: 'מחיקת המחקר', disabled: !!study.example, onSelect: remove },
    { label: 'הדפסת דוח A4', onSelect: () => { go('measure', { st: study.id, s: system }); setTimeout(() => window.print(), 300); } },
  ], [remove, study, system, upsert]);

  useEffect(() => { document.title = page === 'home' ? 'מד הפרופורציות' : `${TABS.find((t) => t.id === page)!.name} · מד הפרופורציות`; }, [page]);
  useEffect(() => { if (save === 'saved') { const t = setTimeout(() => setSave('idle'), 2200); return () => clearTimeout(t); } }, [save]);

  const tabHref = (id: Page) => (id === 'measure' ? href('measure', { st: study.id, s: system }) : href(id));

  return (
    <div className={`app-shell page-${page}`}>
      <header className="topbar">
        <div className="topbar-in">
          <a className="brand" href="#/" aria-label="מד הפרופורציות, לדף הבית">
            <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" width={26} height={26} />
            <span>מד הפרופורציות</span>
          </a>
          <nav className="tabs" aria-label="ניווט">
            {TABS.map((t) => (
              <a key={t.id} className="tab" href={tabHref(t.id)} aria-current={page === t.id ? 'page' : undefined}>{t.name}</a>
            ))}
          </nav>
          <AIMenu items={items} save={save} />
        </div>
      </header>
      {page !== 'measure' && <Backdrop />}
      <main className="app-main" id="main">
        {page === 'home' && <Home />}
        {page === 'measure' && (
          <Measure study={study} own={own} system={system} onSystem={(s) => go('measure', { st: study.id, s }, true)} onOpen={(id) => go('measure', { st: id, s: system })} onChange={upsert} />
        )}
        {page === 'systems' && <Systems />}
        {page === 'method' && <Method />}
        {page === 'article' && <Articles />}
      </main>
    </div>
  );
}
