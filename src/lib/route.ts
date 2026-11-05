import { useEffect, useState } from 'react';

// ניתוב hash: הכתובת נושאת את הדף, המחקר והשיטה, כך שהעתקת קישור שומרת את המצב.
export type Page = 'home' | 'measure' | 'systems' | 'method';
const PAGES: Page[] = ['home', 'measure', 'systems', 'method'];

const parse = () => {
  const [path, query = ''] = window.location.hash.replace(/^#\/?/, '').split('?');
  const page = (PAGES.includes(path as Page) ? path : 'home') as Page;
  return { page, params: Object.fromEntries(new URLSearchParams(query)) as Record<string, string> };
};

export function useRoute() {
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const on = () => setRoute(parse());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

export const href = (page: Page, params?: Record<string, string>) => {
  const q = params ? '?' + new URLSearchParams(params).toString() : '';
  return page === 'home' ? '#/' : `#/${page}${q}`;
};
export const go = (page: Page, params?: Record<string, string>, replace = false) => {
  const h = href(page, params);
  if (replace) history.replaceState(null, '', h);
  else window.location.hash = h;
  if (replace) window.dispatchEvent(new HashChangeEvent('hashchange'));
};
