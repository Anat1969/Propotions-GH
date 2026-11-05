// יישור פרספקטיבה: ארבע פינות בתמונה ממופות למלבן בעזרת הומוגרפיה (טרנספורמציה פרויקטיבית).
// המימוש: פתרון מערכת 8x8 בשיטת גאוס, ודגימה הפוכה בילינארית לכל פיקסל.

export type Pt = { x: number; y: number };

/** מטריצת הומוגרפיה (3x3, h33=1) שממפה את src ל-dst. */
export function homography(src: Pt[], dst: Pt[]): number[] {
  const A: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const { x, y } = src[i];
    const { x: u, y: v } = dst[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v);
  }
  const h = solve(A, b);
  return [...h, 1];
}

function solve(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    const d = M[c][c] || 1e-12;
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c] / d;
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  return M.map((r, i) => r[n] / (r[i] || 1e-12));
}

export function apply(H: number[], p: Pt): Pt {
  const w = H[6] * p.x + H[7] * p.y + H[8];
  return { x: (H[0] * p.x + H[1] * p.y + H[2]) / w, y: (H[3] * p.x + H[4] * p.y + H[5]) / w };
}

const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

/**
 * מיישר את האזור שבין ארבע הפינות (בפיקסלים, בסדר: שמאל־עליון, ימין־עליון, ימין־תחתון, שמאל־תחתון).
 * גודל הפלט: ממוצע אורכי הצלעות הנגדיות, עד 1600 פיקסלים.
 */
export async function rectifyImage(dataUrl: string, quad: Pt[]): Promise<{ data: string; w: number; h: number }> {
  const img = new Image();
  await new Promise((ok, bad) => { img.onload = ok; img.onerror = bad; img.src = dataUrl; });
  const W0 = (dist(quad[0], quad[1]) + dist(quad[3], quad[2])) / 2;
  const H0 = (dist(quad[0], quad[3]) + dist(quad[1], quad[2])) / 2;
  const k = Math.min(1, 1600 / Math.max(W0, H0));
  const w = Math.max(10, Math.round(W0 * k)), h = Math.max(10, Math.round(H0 * k));

  const sc = document.createElement('canvas');
  sc.width = img.width; sc.height = img.height;
  const sctx = sc.getContext('2d')!;
  sctx.drawImage(img, 0, 0);
  const src = sctx.getImageData(0, 0, img.width, img.height).data;

  // מיפוי הפוך: מכל פיקסל בפלט אל מקומו בתמונה המקורית
  const H = homography([{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h }], quad);
  const out = document.createElement('canvas');
  out.width = w; out.height = h;
  const octx = out.getContext('2d')!;
  const od = octx.createImageData(w, h);
  const SW = img.width, SH = img.height;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = apply(H, { x: x + 0.5, y: y + 0.5 });
      const sx = Math.min(SW - 1.001, Math.max(0, p.x - 0.5)), sy = Math.min(SH - 1.001, Math.max(0, p.y - 0.5));
      const x0 = sx | 0, y0 = sy | 0, fx = sx - x0, fy = sy - y0;
      const i00 = (y0 * SW + x0) * 4, i10 = i00 + 4, i01 = i00 + SW * 4, i11 = i01 + 4;
      const o = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        od.data[o + c] = (src[i00 + c] * (1 - fx) + src[i10 + c] * fx) * (1 - fy) + (src[i01 + c] * (1 - fx) + src[i11 + c] * fx) * fy;
      }
      od.data[o + 3] = 255;
    }
  }
  octx.putImageData(od, 0, 0);
  return { data: out.toDataURL('image/jpeg', 0.88), w, h };
}
