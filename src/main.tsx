import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './base.css';
import './app.css';

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);

// service worker רק כשהבסיס הוא השורש (Vercel), לא בעותק היחסי של raw.githack
if ('serviceWorker' in navigator && location.protocol === 'https:' && import.meta.env.BASE_URL === '/') {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
