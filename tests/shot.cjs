// צילומי מסך לבדיקה בעין: node tests/shot.cjs <out-dir> (אחרי build, מריץ vite preview)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const MENU = fs.readFileSync('tests/fixtures/ai-menu.js', 'utf8');
const BASE = 'http://localhost:4199/';
const out = process.argv[2] || 'tests/shots';
fs.mkdirSync(out, { recursive: true });
(async () => {
  const srv = spawn('npx', ['vite', 'preview', '--port', '4199', '--strictPort'], { stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 2500));
  const b = await chromium.launch();
  try {
    for (const [n, vp] of [['desk', { width: 1440, height: 900 }], ['mob', { width: 390, height: 844 }]]) {
      const p = await b.newPage({ viewport: vp, deviceScaleFactor: 1 });
      await p.route('**/appofapp-gh.vercel.app/**', (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: MENU }));
      await p.route('**/fonts.googleapis.com/**', (r) => r.abort());
      p.on('pageerror', (e) => console.log('ERR', e.message));
      for (const h of ['', '#/measure?st=ex-residential&s=golden', '#/measure?st=ex-golden&s=golden', '#/measure?st=ex-plan&s=palladio', '#/measure?st=ex-residential&s=modulor', '#/systems', '#/method']) {
        await p.goto(BASE + h, { waitUntil: 'networkidle' });
        await p.waitForTimeout(h ? 600 : 3200);
        await p.screenshot({ path: `${out}/${n}-${(h || 'home').replace(/\W+/g, '_')}.png` });
      }
      await p.close();
    }
  } finally { await b.close(); srv.kill(); }
})();
