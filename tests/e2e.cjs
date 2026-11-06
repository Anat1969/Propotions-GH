// בדיקת קצה לקצה: node tests/e2e.cjs (אחרי npm run build, מריץ vite preview בעצמו)
// השרת (פונקציית Edge) ו-ai-menu.js מדומים: הסביבה לא מגיעה ל-supabase.co ול-vercel.app.
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:4199/';
const MENU = fs.readFileSync(path.join(__dirname, 'fixtures/ai-menu.js'), 'utf8');
const fails = [];
const ok = (cond, msg) => { console.log((cond ? 'PASS ' : 'FAIL ') + msg); if (!cond) fails.push(msg); };
const sent = [];

async function setup(page) {
  await page.route('**/appofapp-gh.vercel.app/**', (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: MENU }));
  await page.route('**/fonts.googleapis.com/**', (r) => r.abort());
  await page.route('**/functions/v1/proportion-read', async (r) => {
    const body = JSON.parse(r.request().postData() || '{}');
    sent.push(body);
    if (body.mode === 'detect') {
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ frame: { x0: 0.1, x1: 0.9, y0: 0.1, y1: 0.9 }, vx: [0.4, 0.6], hy: [0.5], rects: [{ x: 0.2, y: 0.2, w: 0.1, h: 0.15, label: 'חלון' }], engine: 'gemini' }) });
    }
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reading: { insight: '**הקומות** סוטות מהזהב.', detail: 'הקומה העליונה נמוכה ב-**92 ס"מ** מהיעד.' }, actions: ['להגביה את **הקומה העליונה**', 'להרחיב את **המפרש האמצעי**', 'לבדוק את **חלון הראווה**'], engine: 'gemini' }) });
  });
}

(async () => {
  const srv = spawn('npx', ['vite', 'preview', '--port', '4199', '--strictPort'], { stdio: 'ignore', cwd: path.join(__dirname, '..') });
  await new Promise((r) => setTimeout(r, 2500));
  const b = await chromium.launch();
  const errors = [];
  try {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    p.on('pageerror', (e) => errors.push(e.message));
    await setup(p);

    // דף הבית
    await p.goto(BASE, { waitUntil: 'networkidle' });
    ok((await p.locator('h1').innerText()).includes('הקומפוזיציה נמדדת'), 'דף הבית: שורת התובנה');
    ok(await p.locator('ai-menu .logo').isVisible(), 'כפתור הלוגו A&I בסרגל');
    ok(!(await p.locator('header >> text=העתקת קישור').first().isVisible().catch(() => false)), 'אין כפתורי פיתוח חופשיים בסרגל');
    ok(await p.locator('.tone-problem').isVisible() && await p.locator('.tone-solution').isVisible() && await p.locator('.tone-insight').isVisible(), 'בעיה, פתרון ותובנה');
    ok(await p.locator('.ms-tile').count() === 5, 'דף הבית: חמש השיטות בשורה אחת');
    // הצעצוע: גרירה אל חתך הזהב נועלת
    const toy = await p.locator('.toy-svg').boundingBox();
    const scale = toy.width / 640; // viewBox רוחב 640, מתחיל ב-20-
    const gx = toy.x + (20 + 600 * 0.618034) * scale;
    await p.mouse.move(toy.x + toy.width * 0.5, toy.y + toy.height * 0.4);
    await p.mouse.down();
    await p.mouse.move(gx, toy.y + toy.height * 0.4, { steps: 8 });
    await p.mouse.up();
    ok((await p.locator('.toy-cap').innerText()).includes('ננעל: יחס הזהב'), 'צעצוע: הקו ננעל על יחס הזהב');
    ok((await p.locator('.toy-svg text').filter({ hasText: '1.618' }).count()) === 1, 'צעצוע: היחס מוצג 1.618');
    ok(await p.locator('.backdrop').count() === 1, 'רקע חי בדף הבית');

    // ניווט
    for (const [name, h1part] of [['שיטות', 'יחס הזהב'], ['כתבות', 'מיתוס, מדידה'], ['אמינות', 'מכשיר שאומר'], ['בית', 'הקומפוזיציה נמדדת']]) {
      await p.locator('.tabs').getByRole('link', { name }).click();
      await p.waitForFunction((t) => document.querySelector('h1')?.textContent.includes(t), h1part, { timeout: 4000 }).catch(() => {});
      ok((await p.locator('h1').last().innerText()).includes(h1part), `לשונית ${name}`);
      ok(await p.locator('.tabs [aria-current="page"]').innerText() === name, `לשונית ${name} מסומנת`);
    }
    await p.goto(BASE + '#/article', { waitUntil: 'networkidle' });
    const R = '.art-read ';
    ok(await p.locator('.art-item').count() === 4, 'כתבות: ארבע כתבות ברשימה');
    ok(await p.locator(R + '.timeline li').count() === 6, 'כתבה 1: ציר זמן של 6 תחנות');
    ok(await p.locator(R + '.art-quote .q-tag').innerText() === 'תרגום', 'כתבה 1: ציטוט עם תרגום ומקור');
    ok(await p.locator(R + '.art-sources li').count() >= 6, 'כתבה 1: רשימת מקורות');
    ok(await p.locator('.mini-box .art-sheet.mini').count() === 1, 'מפת העמוד המלא בצד');
    const v0 = await p.locator('.mini-view').evaluate((e) => e.style.top);
    await p.locator('.art-read').evaluate((e) => { e.style.scrollBehavior = 'auto'; e.scrollTop = 600; });
    await p.waitForTimeout(300);
    ok((await p.locator('.mini-view').evaluate((e) => e.style.top)) !== v0, 'גלילה מזיזה את המסגרת במפת העמוד');
    const [dl] = await Promise.all([p.waitForEvent('download'), p.getByRole('button', { name: 'הורדה' }).click()]);
    ok(dl.suggestedFilename().endsWith('.html'), 'הורדה: קובץ HTML של הכתבה');
    ok(await p.getByRole('button', { name: 'הדפסה' }).isVisible(), 'כפתור הדפסה');
    for (const [id, part] of [['time', 'עבר, הווה, עתיד'], ['science', 'מה המדע באמת יודע'], ['shortcode', 'הקוד הקצר']]) {
      await p.locator('.art-item', { hasText: { time: 'עבר, הווה', science: 'מיחס לחוויה', shortcode: 'הקוד הקצר' }[id] }).click();
      await p.waitForFunction((x) => document.querySelector('.art-read h1')?.textContent.includes(x), part, { timeout: 3000 }).catch(() => {});
      ok((await p.locator(R + 'h1').innerText()).includes(part), `כתבה: ${part}`);
    }
    ok(await p.locator(R + '.sc-table tbody tr').count() === 4, 'הקוד הקצר: מדידה חיה על ארבע הדוגמאות');
    ok((await p.locator(R + '.sc-table tbody tr').filter({ hasText: 'סנטה מריה' }).innerText()).includes('68'), 'הקוד הקצר: סנטה מריה נובלה 68');
    // מסך השיטות: שיטה, דוגמה, סרגלים על התמונה, השוואה
    await p.goto(BASE + '#/systems?m=palladio', { waitUntil: 'networkidle' });
    ok((await p.locator('.si-title').innerText()) === 'יחסי פלאדיו', 'שיטות: פלאדיו נבחר מהכתובת');
    ok((await p.locator('.si-dl dt').allInnerTexts()).join('|') === 'מאיפה|איפה למצוא|למה זו שיטה|מה המדע אומר|דוגמה', 'שיטות: מקור, איפה למצוא, למה, מדע, דוגמה');
    ok((await p.locator('.sci-pill').innerText()).length > 0, 'שיטות: פסק דין של המדע');
    await p.locator('.stage-bar').getByRole('button', { name: 'סנטה מריה נובלה' }).click();
    await p.waitForFunction(() => location.hash.includes('ex=novella'));
    await p.locator('.stage-bar').getByRole('button', { name: 'איור' }).click();
    ok((await p.locator('.stage-read').innerText()).includes('1.00') && (await p.locator('.stage-read').innerText()).includes('0.0%'), 'סנטה מריה נובלה: ריבוע מדויק לפי פלאדיו');
    await p.locator('.stage-bar').getByRole('button', { name: 'בניין מגורים, סכמה' }).click();
    await p.getByRole('button', { name: 'הכול' }).click();
    ok(await p.locator('.stage-svg .ruler-ov').count() === 5, 'השוואה: חמשת הסרגלים על אותה חזית');
    ok(await p.locator('.read-chip').count() === 5, 'השוואה: קריאה לכל שיטה');
    await p.locator('.sys-tab', { hasText: 'המודולור' }).click();
    await p.waitForFunction(() => location.hash.includes('m=modulor'));
    await p.waitForFunction(() => document.querySelectorAll('.stage-svg .ruler-ov').length === 1, null, { timeout: 3000 }).catch(() => {});
    ok(await p.locator('.stage-svg .ruler-ov').count() === 1, 'מעבר שיטה מאפס לסרגל שלה');
    // תקדים נמדד: אלברטי מסביר בפלאדיו
    await p.goto(BASE + '#/measure?st=ex-novella&s=palladio', { waitUntil: 'networkidle' });
    await p.waitForSelector('[data-testid=index]');
    await p.waitForTimeout(900);
    ok((await p.locator('[data-testid=index]').innerText()) === '100%', 'סנטה מריה נובלה: 100% לפי פלאדיו');
    await p.goto(BASE + '#/method', { waitUntil: 'networkidle' });
    ok((await p.locator('.m-card .big').innerText()).startsWith('0.00'), 'כיול: חזית הזהב נמדדת בסטייה 0.00%');

    // מדידה: דוגמה
    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.locator('.hero-cta').getByRole('link', { name: 'למדידה' }).click();
    await p.waitForSelector('[data-testid=index]');
    ok(p.url().includes('st=ex-residential') && p.url().includes('s=golden'), 'הכתובת נושאת מחקר ושיטה');
    const goldIdx = await p.locator('[data-testid=index]').innerText();
    ok(/^\d+%$/.test(goldIdx), `מדד ההרמוניה מוצג: ${goldIdx}`);
    ok(await p.locator('.devrow').count() > 10, 'רשימת סטיות מלאה');
    ok(await p.locator('.fixes li').count() >= 1, 'תיקון מוצע בסנטימטרים');
    ok((await p.locator('.fixes li').first().innerText()).match(/ס"מ|מ'/), 'התיקון כולל מידה');

    // החלפת שיטה מהסדרות הקטנות
    await p.locator('.sysbar', { hasText: 'מודולור' }).click();
    await p.waitForFunction(() => location.hash.includes('s=modulor'));
    ok(p.url().includes('s=modulor'), 'בחירת שיטה נשמרת בכתובת');
    ok(await p.locator('.devrow').first().innerText().then((t) => t.includes('רוחב') || t.includes('גובה')), 'שיטת מידה מודדת רוחב וגובה');
    await p.locator('.toolbar .chip-tool', { hasText: 'פלאדיו' }).click();
    await p.waitForFunction(() => location.hash.includes('s=palladio'));
    ok(await p.locator('.sysbar.is-on').innerText().then((t) => t.includes('פלאדיו')), 'סרגל הכלים והסדרות מסונכרנים');
    ok(await p.locator('.sysbar', { hasText: 'מודול' }).locator('.sb-note').isVisible(), 'מודול מסומן "בנייה" ולא נכנס לדירוג');

    // בחירת שורה מדגישה ומפרטת
    await p.locator('.devrow').first().click();
    ok(await p.locator('.dr-more').isVisible(), 'לחיצה על שורה פותחת פירוט');
    ok((await p.locator('.dr-more').innerText()).includes('אי־ודאות'), 'הפירוט כולל אי־ודאות');
    ok(await p.locator('.drawing text').filter({ hasText: '→' }).count() === 1, 'השרטוט מציג את הרכיב הנבחר');

    // קווי ויסות
    await p.locator('.toolbar .chip-tool', { hasText: 'קווי ויסות' }).click();
    ok(await p.locator('.drawing .guides').count() === 1, 'קווי ויסות נדלקים');

    // עריכה: קו אנכי על דוגמה יוצר עותק אישי ונשמר
    await p.locator('.toolbar .chip-tool', { hasText: 'קו אנכי' }).click();
    const before = await p.locator('.drawing .divline').count();
    const box = await p.locator('.drawing').boundingBox();
    await p.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.55);
    await p.waitForFunction(() => location.hash.includes('st=st-'));
    ok(await p.locator('.drawing .divline').count() === before + 1, 'קו אנכי נוסף');
    ok(p.url().includes('st=st-'), 'עריכת דוגמה פותחת עותק אישי');
    ok((await p.locator('.tb-select').inputValue()).startsWith('st-'), 'העותק מופיע ב"המחקרים שלי"');
    await p.waitForTimeout(500);
    await p.reload({ waitUntil: 'networkidle' });
    ok(await p.locator('.drawing .divline').count() === before + 1, 'נשמר אחרי רענון');

    // רכיב חדש בגרירה
    await p.locator('.toolbar .chip-tool', { hasText: 'רכיב' }).click();
    const rectsBefore = await p.locator('.drawing g.rect').count();
    const b2 = await p.locator('.drawing').boundingBox();
    await p.mouse.move(b2.x + b2.width * 0.30, b2.y + b2.height * 0.40);
    await p.mouse.down();
    await p.mouse.move(b2.x + b2.width * 0.36, b2.y + b2.height * 0.50, { steps: 6 });
    await p.mouse.up();
    ok(await p.locator('.drawing g.rect').count() === rectsBefore + 1, 'רכיב נוסף בגרירה');

    // מחיקה
    await p.locator('.toolbar .chip-tool', { hasText: 'מחיקה' }).click();
    const rb = await p.locator('.drawing g.rect').last().locator('rect').boundingBox();
    await p.mouse.click(rb.x + rb.width * 0.3, rb.y + rb.height * 0.25);
    ok(await p.locator('.drawing g.rect').count() === rectsBefore, 'מחיקת רכיב');

    // רוחב אמיתי משנה את שיטות המידה
    await p.locator('.toolbar .chip-tool', { hasText: 'מודולור' }).click();
    await p.waitForTimeout(900);
    const m1 = await p.locator('[data-testid=index]').innerText();
    await p.locator('#w').fill('21');
    await p.waitForTimeout(900);
    const m2 = await p.locator('[data-testid=index]').innerText();
    ok(m1 !== m2, `קנה מידה משנה את המודולור (${m1} ל-${m2})`);

    // קריאה בשלוש שכבות
    await p.getByRole('button', { name: 'קריאה מקצועית' }).click();
    await p.waitForSelector('[data-testid=ai-reading]');
    ok(sent.some((x) => x.mode === 'read' && x.summary && typeof x.summary.index === 'number'), 'הבקשה לשרת נושאת את המספרים שחושבו');
    ok(await p.locator('[data-testid=ai-reading] mark, [data-testid=ai-reading] strong').count() > 0, 'קריאת המודל מוצגת עם הבלטות');
    await p.locator('#note').fill('הקומה העליונה נסוגה, וזה מסביר את היחס');
    await p.waitForTimeout(500);
    await p.reload({ waitUntil: 'networkidle' });
    ok((await p.locator('#note').inputValue()).includes('נסוגה'), 'קביעת איש המקצוע נשמרת');

    // העלאת תמונה וזיהוי קווים
    const png = Buffer.from(await p.evaluate(() => { const c = document.createElement('canvas'); c.width = 400; c.height = 300; const g = c.getContext('2d'); g.fillStyle = '#ddd'; g.fillRect(0, 0, 400, 300); g.fillStyle = '#333'; g.fillRect(40, 30, 320, 240); return c.toDataURL('image/png').split(',')[1]; }), 'base64');
    await p.locator('input[type=file]').setInputFiles({ name: 'facade.png', mimeType: 'image/png', buffer: png });
    await p.waitForSelector('.rectify');
    ok(await p.locator('.rect-svg .corner').count() === 4, 'יישור פרספקטיבה נפתח עם 4 פינות');
    const c0 = await p.locator('.rect-svg .corner').first().boundingBox();
    await p.mouse.move(c0.x + c0.width / 2, c0.y + c0.height / 2);
    await p.mouse.down();
    await p.mouse.move(c0.x + c0.width / 2 + 20, c0.y + c0.height / 2 + 12, { steps: 4 });
    await p.mouse.up();
    await p.locator('.rectify-bar').getByRole('button', { name: 'יישור' }).click();
    await p.waitForSelector('.drawing image');
    ok((await p.locator('.hintline').innerText()).includes('יושרה'), 'החזית יושרה למלבן');
    ok(await p.locator('.drawing image').count() === 1, 'התמונה המיושרת נטענה לשרטוט');
    ok(await p.locator('.frame-handles rect').count() === 4, 'ידיות מסגרת');
    await p.getByRole('button', { name: 'זיהוי קווים' }).click();
    await p.waitForFunction(() => document.querySelectorAll('.drawing .divline').length === 3);
    ok(sent.some((x) => x.mode === 'detect' && x.image.length > 100), 'זיהוי קווים שולח את התמונה');
    ok((await p.locator('.hintline').innerText()).includes('זו הצעה'), 'הזיהוי מוצג כהצעה לבדיקה');

    // כל הכפתורים מרובעים
    const radius = await p.evaluate(() => [...document.querySelectorAll('button, .field')].every((x) => getComputedStyle(x).borderRadius === '0px'));
    ok(radius, 'כל הכפתורים והשדות מרובעים');

    // תפריט הלוגו: מחקר חדש
    await p.locator('ai-menu .logo').click();
    await p.locator('ai-menu').getByText('מחקר חדש').click();
    await p.waitForFunction(() => document.querySelector('.tb-select')?.selectedOptions[0]?.textContent === 'מחקר חדש');
    ok(true, 'תפריט הלוגו: מחקר חדש');

    // התקנה
    const cdp = await ctx.newCDPSession(p);
    await p.goto(BASE, { waitUntil: 'networkidle' });
    const inst = await cdp.send('Page.getInstallabilityErrors');
    ok(inst.installabilityErrors.length === 0, 'התקנה: ' + (JSON.stringify(inst.installabilityErrors) || 'אין שגיאות'));

    // צילומים מ-Commons: כשהצילום מגיע (מדומה) הוא מוצג עם קרדיט; כשלא, האיור נשאר
    {
      const ph = await b.newPage({ viewport: { width: 1440, height: 900 } });
      await setup(ph);
      const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAYAAAD0In+KAAAAEUlEQVR42mP8z8Dwn4GBgQEAFgYCAQyz7TQAAAAASUVORK5CYII=', 'base64');
      await ph.route('**/commons.wikimedia.org/wiki/Special:FilePath/**', (r) => r.fulfill({ status: 200, contentType: 'image/png', body: png }));
      await ph.goto(BASE + '#/systems?m=golden&ex=parthenon', { waitUntil: 'networkidle' });
      await ph.waitForTimeout(500);
      ok(await ph.locator('.stage-svg image').count() === 1, 'במה: הצילום נטען');
      ok((await ph.locator('.stage-read').innerText()).includes('גררו'), 'במה: לפני כיוון המסגרת, הוראה ולא מספר');
      const cr = await ph.locator('.stage-svg .corner').last().boundingBox();
      await ph.mouse.move(cr.x + cr.width / 2, cr.y + cr.height / 2); await ph.mouse.down();
      await ph.mouse.move(cr.x + cr.width / 2 - 40, cr.y + cr.height / 2 - 10, { steps: 5 }); await ph.mouse.up();
      ok((await ph.locator('.stage-read').innerText()).includes('φ'), 'במה: אחרי כיוון, קריאה מול יחס הזהב');
      ok((await ph.locator('.ov-credit').textContent()).includes('CC BY-SA'), 'במה: קרדיט ורישיון לצילום');
      await ph.goto(BASE + '#/article', { waitUntil: 'networkidle' });
      for (const el of await ph.locator('.art-read .photo').all()) { await el.scrollIntoViewIfNeeded(); await ph.waitForTimeout(250); }
      ok(await ph.locator('.art-read .photo.is-ok').count() === 1, 'כתבה: צילום הפרתנון');
      await ph.goto(BASE + '#/systems?m=modulor', { waitUntil: 'networkidle' });
      await ph.waitForTimeout(400);
      ok(await ph.locator('.si-photo.is-ok').count() === 1, 'שיטות: תבליט המודולור בהסבר המודולור');
      await ph.close();
      const nf = await b.newPage({ viewport: { width: 1440, height: 900 } });
      await setup(nf);
      await nf.route('**/commons.wikimedia.org/**', (r) => r.abort());
      await nf.goto(BASE + '#/systems?m=golden&ex=parthenon', { waitUntil: 'networkidle' });
      await nf.waitForFunction(() => document.querySelector('.stage-ink'), null, { timeout: 5000 }).catch(() => {});
      ok(await nf.locator('.stage-ink').count() === 1 && await nf.locator('.stage-svg image').count() === 0, 'בלי רשת: הבמה עוברת לאיור, בלי תמונה שבורה');
      ok(await nf.locator('.stage-bar').getByRole('button', { name: 'צילום' }).isDisabled(), 'בלי רשת: כפתור הצילום כבוי');
      await nf.close();
    }

    // נייד והפחתת תנועה
    for (const vp of [{ width: 390, height: 844 }, { width: 1280, height: 720 }]) {
      const m = await b.newPage({ viewport: vp, reducedMotion: 'reduce' });
      m.on('pageerror', (e) => errors.push(e.message));
      await setup(m);
      for (const h of ['', '#/measure?st=ex-residential&s=golden', '#/measure?st=ex-plan&s=palladio', '#/systems?m=modulor&ex=residential', '#/method', '#/article']) {
        await m.goto(BASE + h, { waitUntil: 'networkidle' });
        const hs = await m.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
        ok(!hs, `${vp.width}px ${h || 'בית'}: בלי גלילה אופקית`);
      }
      await m.goto(BASE, { waitUntil: 'networkidle' });
      const anim = await m.evaluate(() => getComputedStyle(document.querySelector('.rise')).animationName);
      ok(anim === 'none', `${vp.width}px: הפחתת תנועה מכובדת`);
      if (vp.width === 390) {
        await m.goto(BASE + '#/measure?st=ex-residential&s=golden', { waitUntil: 'networkidle' });
        await m.locator('.mobtabs').getByRole('tab', { name: 'תשובות' }).click();
        ok(await m.locator('[data-testid=index]').isVisible(), 'נייד: לשונית תשובות');
        await m.locator('.mobtabs').getByRole('tab', { name: 'סטיות ותיקון' }).click();
        ok(await m.locator('[data-testid=devlist]').isVisible(), 'נייד: לשונית סטיות');
      }
      await m.close();
    }
    ok(errors.length === 0, 'אין שגיאות JavaScript ' + errors.join(' | '));
  } finally {
    await b.close();
    srv.kill();
  }
  console.log(fails.length ? `\n${fails.length} נכשלו` : '\nהכול עבר');
  process.exit(fails.length ? 1 : 0);
})();
