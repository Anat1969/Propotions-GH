import { describe, expect, it } from 'vitest';
import { measure, measureAll } from '../src/lib/engine';
import { EXAMPLES } from '../src/lib/examples';
import { nearest, PHI } from '../src/lib/systems';

describe('nearest', () => {
  it('golden', () => expect(nearest('golden', PHI).dev).toBeLessThan(1e-9));
  it('modulor red/blue', () => {
    expect(nearest('modulor', 2260).target).toBe(2260);
    expect(nearest('modulor', 1835).target).toBe(1829);
  });
  it('palladio picks 3:2', () => expect(nearest('palladio', 1.49).name).toContain('2:3'));
  it('renard', () => expect(nearest('renard', 3100).target).toBeCloseTo(3150));
  it('module offset as share of module', () => expect(nearest('module', 3020).dev).toBeCloseTo(0.2));
});

describe('measure', () => {
  const golden = EXAMPLES[0];
  it('golden example scores high on golden', () => {
    const r = measure(golden, 'golden');
    expect(r.items.find((m) => m.id === 'frame')!.dev).toBeLessThan(0.001);
    expect(r.items.find((m) => m.id === 'px0')!.dev).toBeLessThan(0.001);
    expect(r.index).toBeGreaterThan(50);
  });
  it('every system returns items and a 0..100 index for every example', () => {
    for (const st of EXAMPLES) for (const r of measureAll(st)) {
      expect(r.items.length).toBeGreaterThan(0);
      expect(r.index).toBeGreaterThanOrEqual(0);
      expect(r.index).toBeLessThanOrEqual(100);
      for (const m of r.items) expect(m.fix.length).toBeGreaterThan(0);
    }
  });
  it('fix moves the element onto the target', () => {
    const st = { ...EXAMPLES[1] };
    const r = measure(st, 'module');
    const f = r.items.find((m) => m.band !== 'ok');
    if (f) expect(f.fix).toMatch(/ס"מ|מ'/);
  });
});

import { apply, homography } from '../src/lib/rectify';
describe('rectify', () => {
  it('homography maps the 4 corners exactly', () => {
    const src = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 50 }, { x: 0, y: 50 }];
    const dst = [{ x: 12, y: 8 }, { x: 180, y: 30 }, { x: 170, y: 140 }, { x: 5, y: 120 }];
    const H = homography(src, dst);
    src.forEach((p, i) => { const q = apply(H, p); expect(q.x).toBeCloseTo(dst[i].x, 6); expect(q.y).toBeCloseTo(dst[i].y, 6); });
  });
});

import { shortCode } from '../src/lib/shortcode';
describe('short code', () => {
  it('scale does not change the index', () => {
    const st = EXAMPLES[1];
    expect(shortCode({ ...st, widthM: st.widthM * 3 }).index).toBe(shortCode(st).index);
  });
  it('one family gives 100', () => {
    const st = { ...EXAMPLES[3] }; // Novella: squares and two-squares
    const r = shortCode(st);
    expect(r.k).toBeLessThanOrEqual(2);
    expect(r.index).toBeGreaterThan(60);
  });
  it('prints the examples', () => {
    for (const s of EXAMPLES) { const r = shortCode(s); console.log(s.id, r.n, r.k, r.index, r.families.map((f) => `${f.ratio.toFixed(2)}x${f.count}`).join(' ')); }
  });
});
