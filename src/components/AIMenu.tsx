import { useEffect, useRef } from 'react';
import type { SaveState } from '../lib/store';

export const DEV_SESSION_URL = 'https://claude.ai/code/session_01UBnSCHyJcGmQjfHLWuNMZE';

export interface MenuItem { label: string; hint?: string; pressed?: boolean; disabled?: boolean; onSelect: () => unknown }
interface MenuElement extends HTMLElement { items: MenuItem[]; status: string }

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'ai-menu': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { chat?: string; research?: string };
    }
  }
}

const STATUS: Record<SaveState, string> = { idle: '', saving: 'שומר...', saved: 'נשמר', error: 'לא נשמר: הזיכרון המקומי מלא' };

/** כפתור הלוגו A&I (ai-menu.js). כל פעולות העריכה והמערכת נמצאות בתוכו. */
export default function AIMenu({ items, save }: { items: MenuItem[]; save: SaveState }) {
  const ref = useRef<MenuElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.items = items;
    el.status = STATUS[save];
  }, [items, save]);
  return <ai-menu ref={ref} chat={DEV_SESSION_URL} />;
}
