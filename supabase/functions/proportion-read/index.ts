// Propotions-GH: "מד הפרופורציות". שני מצבים:
// read   - קריאה מקצועית מזוקקת של תוצאות המדידה (המספרים חושבו בדפדפן, המודל רק מנסח).
// detect - הצעה לקווי חלוקה מתוך תמונת חזית או תוכנית. המשתמש מאשר ומתקן.
// Gemini החינמי (GEMINI_API_KEY) קודם, Claude (ANTHROPIC_API_KEY) רק כגיבוי. פלט JSON מובנה, מגבלת קצב.
// כל טקסט לפי תקן הזיקוק: https://github.com/Anat1969/Claude-GH/blob/main/docs/ai-text-standard.md
import Anthropic from 'npm:@anthropic-ai/sdk';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

// מגבלת קצב: 10 בקשות בדקה לכל כתובת.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 60000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 10;
}

const READ_SYSTEM = `את/ה אדריכל/ית מבקר/ת שקורא/ת תוצאות של מד פרופורציות לחזית או לתוכנית.
המספרים כבר חושבו בקוד. אל תחשב/י מחדש ואל תמציא/י מספרים: השתמש/י רק במספרים שנמסרו.

זקק, אל תתאר. עברית טבעית, קצרה ומקצועית, בגוף שלישי. בלי סימני קריאה, בלי אימוג'י, בלי מילים ריקות.
מבנה קבוע, בהיררכיה:
1. reading.insight: שורת תובנה עד 8 מילים, כמו כותרת שמבטאת את העיקר. מסתיימת בנקודה.
2. reading.detail: משפט הסבר אחד, עד 20 מילים, שמפרט את התובנה.
3. actions: בדיוק 3 פעולות תיקון, כל אחת עד 12 מילים, מתוך שדות fix שנמסרו, בסדר חשיבות.
הבלטות ב-**כוכביות כפולות**: בשורת התובנה המושג המרכזי בלבד. במשפט ההסבר ובפעולות 1 עד 3 הבלטות, לפרמטרים, מספרים ושמות רכיבים. לא מבליטים מילות קישור ולא משפט שלם.
אם שיטה אחרת מסבירה טוב יותר (index גבוה יותר), אמור/י זאת במשפט ההסבר.`;

const DETECT_SYSTEM = `You read an orthogonal architectural drawing or photo of a building facade or floor plan.
Return the main composition lines as fractions of the IMAGE (0..1, x from left, y from top):
- frame: the outer rectangle of the facade or plan.
- vx: vertical division lines inside the frame (bay or room boundaries, main pilasters), as x fractions of the image.
- hy: horizontal division lines inside the frame (floor lines, cornices, room boundaries), as y fractions of the image.
- rects: up to 8 main openings or rooms (x, y, w, h as image fractions) with a short Hebrew label.
Only lines that are clearly visible. At most 8 vx and 8 hy. If unsure, return fewer.`;

const PART = { type: 'object', additionalProperties: false, required: ['insight', 'detail'], properties: { insight: { type: 'string' }, detail: { type: 'string' } } };
const READ_SCHEMA = { type: 'object', additionalProperties: false, required: ['reading', 'actions'], properties: { reading: PART, actions: { type: 'array', items: { type: 'string' } } } };
const G_READ = { type: 'OBJECT', required: ['reading', 'actions'], properties: { reading: { type: 'OBJECT', required: ['insight', 'detail'], properties: { insight: { type: 'STRING' }, detail: { type: 'STRING' } } }, actions: { type: 'ARRAY', items: { type: 'STRING' } } } };
const RECT = { type: 'object', additionalProperties: false, required: ['x', 'y', 'w', 'h', 'label'], properties: { x: { type: 'number' }, y: { type: 'number' }, w: { type: 'number' }, h: { type: 'number' }, label: { type: 'string' } } };
const DETECT_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['frame', 'vx', 'hy', 'rects'],
  properties: {
    frame: { type: 'object', additionalProperties: false, required: ['x0', 'x1', 'y0', 'y1'], properties: { x0: { type: 'number' }, x1: { type: 'number' }, y0: { type: 'number' }, y1: { type: 'number' } } },
    vx: { type: 'array', items: { type: 'number' } }, hy: { type: 'array', items: { type: 'number' } }, rects: { type: 'array', items: RECT },
  },
};
const G_DETECT = {
  type: 'OBJECT', required: ['frame', 'vx', 'hy', 'rects'],
  properties: {
    frame: { type: 'OBJECT', required: ['x0', 'x1', 'y0', 'y1'], properties: { x0: { type: 'NUMBER' }, x1: { type: 'NUMBER' }, y0: { type: 'NUMBER' }, y1: { type: 'NUMBER' } } },
    vx: { type: 'ARRAY', items: { type: 'NUMBER' } }, hy: { type: 'ARRAY', items: { type: 'NUMBER' } },
    rects: { type: 'ARRAY', items: { type: 'OBJECT', required: ['x', 'y', 'w', 'h', 'label'], properties: { x: { type: 'NUMBER' }, y: { type: 'NUMBER' }, w: { type: 'NUMBER' }, h: { type: 'NUMBER' }, label: { type: 'STRING' } } } },
  },
};

const GEMINI_MODELS = [...new Set([Deno.env.get('GEMINI_MODEL') ?? 'gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'])];

type Parts = ({ text: string } | { inline_data: { mime_type: string; data: string } })[];

async function viaGemini(key: string, system: string, parts: Parts, schema: unknown) {
  let last: unknown;
  for (const model of GEMINI_MODELS) {
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: 'user', parts }],
          generationConfig: { responseMimeType: 'application/json', responseSchema: schema, temperature: 0.3 },
        }),
        signal: AbortSignal.timeout(30000),
      });
      if (!r.ok) throw Object.assign(new Error(`Gemini ${model} ${r.status}`), { status: r.status });
      const j = await r.json();
      const text = j?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
      return JSON.parse(text);
    } catch (err) {
      last = err;
      const st = (err as { status?: number }).status;
      if (st === 400 || st === 401 || st === 403) break;
    }
  }
  throw last;
}

async function viaClaude(key: string, system: string, parts: Parts, schema: unknown) {
  const client = new Anthropic({ apiKey: key });
  const content = parts.map((p) => ('text' in p ? { type: 'text', text: p.text } : { type: 'image', source: { type: 'base64', media_type: p.inline_data.mime_type, data: p.inline_data.data } }));
  const response = await client.beta.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 3000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system,
    output_config: { effort: 'low', format: { type: 'json_schema', schema } },
    messages: [{ role: 'user', content }],
  } as never);
  if (response.stop_reason === 'refusal') throw new Error('הבקשה נדחתה');
  const text = response.content.filter((b: { type: string }) => b.type === 'text').map((b: { text: string }) => b.text).join('');
  return JSON.parse(text);
}

const clamp01 = (v: unknown) => Math.min(1, Math.max(0, Number(v) || 0));

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'POST בלבד' }, 405);
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anon';
  if (limited(ip)) return json({ error: 'יותר מדי בקשות. נסו שוב בעוד דקה.' }, 429);

  let body: { mode?: string; summary?: unknown; image?: string };
  try { body = await req.json(); } catch { return json({ error: 'גוף הבקשה אינו JSON' }, 400); }

  let system: string, parts: Parts, schema: unknown, gSchema: unknown;
  if (body.mode === 'detect') {
    const image = String(body.image ?? '');
    if (image.length < 100 || image.length > 2_000_000) return json({ error: 'התמונה חסרה או גדולה מדי.' }, 400);
    system = DETECT_SYSTEM; schema = DETECT_SCHEMA; gSchema = G_DETECT;
    parts = [{ inline_data: { mime_type: 'image/jpeg', data: image } }, { text: 'Find the frame and the division lines.' }];
  } else {
    const s = JSON.stringify(body.summary ?? {}).slice(0, 6000);
    if (s.length < 10) return json({ error: 'אין תוצאות מדידה לקריאה.' }, 400);
    system = READ_SYSTEM; schema = READ_SCHEMA; gSchema = G_READ;
    parts = [{ text: `תוצאות המדידה (JSON):\n${s}` }];
  }

  const gk = Deno.env.get('GEMINI_API_KEY');
  const ak = Deno.env.get('ANTHROPIC_API_KEY');
  const errors: string[] = [];
  let out: Record<string, unknown> | null = null;
  let engine = '';
  if (gk) { try { out = await viaGemini(gk, system, parts, gSchema); engine = 'gemini'; } catch (e) { errors.push(String((e as Error).message ?? e)); } }
  if (!out && ak) { try { out = await viaClaude(ak, system, parts, schema); engine = 'claude'; } catch (e) { errors.push(String((e as Error).message ?? e)); } }
  if (!out) return json({ error: `אין מנוע זמין כרגע (${errors.join('; ') || 'חסר מפתח'}). הקריאה המחושבת למטה נשארת תקפה.` }, 503);

  if (body.mode === 'detect') {
    const f = (out.frame ?? {}) as Record<string, number>;
    const frame = { x0: clamp01(f.x0), x1: clamp01(f.x1), y0: clamp01(f.y0), y1: clamp01(f.y1) };
    const vx = (Array.isArray(out.vx) ? out.vx : []).map(clamp01).slice(0, 8);
    const hy = (Array.isArray(out.hy) ? out.hy : []).map(clamp01).slice(0, 8);
    const rects = (Array.isArray(out.rects) ? out.rects : []).slice(0, 8).map((r: Record<string, unknown>) => ({ x: clamp01(r.x), y: clamp01(r.y), w: clamp01(r.w), h: clamp01(r.h), label: String(r.label ?? '').slice(0, 40) }));
    return json({ frame, vx, hy, rects, engine });
  }
  return json({ ...out, engine });
});
