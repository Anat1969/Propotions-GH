// שלושה תקדימים בקו דיו, בסיס לבמת ההשוואה. הדיו נמתח בכניסה.
// איורים סכמטיים שנבנו בקוד, לא העתקה של שרטוט מדידה.
import { PHI } from '../lib/systems';

const W = 600;
const P = (d: string, k?: string) => <path key={k ?? d} d={d} pathLength={1} className="ink" />;

export function Parthenon({ over }: { over: boolean }) {
  // יחסים סכמטיים: עמוד כשליש מהרוחב, שמונה עמודים בחזית
  const base = 330, steps = 24, col = 200, ent = 64, ped = 66;
  const top = base - steps - col - ent;
  const cols = Array.from({ length: 8 }, (_, i) => 30 + i * (540 / 7));
  return (
    <g>
      {[0, 1, 2].map((i) => P(`M${-4 + i * 8} ${base - i * 8}H${W + 4 - i * 8}`, `s${i}`))}
      {cols.map((x) => P(`M${x - 15} ${base - steps}V${base - steps - col}M${x + 15} ${base - steps}V${base - steps - col}M${x - 20} ${base - steps - col}H${x + 20}`, `c${x}`))}
      {P(`M10 ${base - steps - col}H${W - 10}V${top}H10Z`)}
      {P(`M10 ${base - steps - col - ent / 2}H${W - 10}`)}
      {Array.from({ length: 16 }, (_, i) => P(`M${22 + i * 36.5} ${base - steps - col - ent / 2}V${top}`, `t${i}`))}
      {P(`M4 ${top}L${W / 2} ${top - ped}L${W - 4} ${top}Z`)}
      {over && (
        <g className="reg">
          <rect x={0} y={base - W / PHI} width={W} height={W / PHI} />
          <rect x={0} y={base - W / PHI} width={W / PHI} height={W / PHI} />
          <text x={W / 2} y={base - W / PHI - 8} textAnchor="middle">φ</text>
        </g>
      )}
    </g>
  );
}

export function Rotonda({ over }: { over: boolean }) {
  const base = 330;
  return (
    <g>
      {P(`M60 ${base}H540`)}
      {P(`M200 ${base}L215 ${base - 50}H385L400 ${base}`)}
      {Array.from({ length: 6 }, (_, i) => 222 + i * 31).map((x) => P(`M${x} ${base - 50}V${base - 160}`, `c${x}`))}
      {P(`M214 ${base - 160}H386V${base - 176}H214Z`)}
      {P(`M206 ${base - 176}L300 ${base - 214}L394 ${base - 176}Z`)}
      {P(`M110 ${base - 50}H490V${base - 196}H110Z`)}
      {[140, 170, 430, 460].map((x) => P(`M${x} ${base - 90}h16v-34h-16Z`, `w${x}`))}
      {P(`M220 ${base - 196}Q300 ${base - 300} 380 ${base - 196}`)}
      {P(`M290 ${base - 248}h20v-20h-20Z`)}
      {over && (
        <g className="reg">
          <rect x={110} y={base - 430} width={380} height={380} />
          <circle cx={300} cy={base - 240} r={86} />
        </g>
      )}
    </g>
  );
}

export function Novella({ over }: { over: boolean }) {
  const base = 340, S = 300, x0 = 150; // החזית חסומה בריבוע S
  const mid = base - S / 2;
  return (
    <g>
      {P(`M${x0} ${base}H${x0 + S}V${mid}H${x0}Z`)}
      {Array.from({ length: 7 }, (_, i) => x0 + 6 + i * 41.5).map((x, i) => (i === 3 ? P(`M${x} ${base}V${base - 92}Q${x + 15} ${base - 116} ${x + 30} ${base - 92}V${base}`, `p${x}`) : P(`M${x + 4} ${base - 20}V${base - 74}Q${x + 15} ${base - 90} ${x + 26} ${base - 74}V${base - 20}`, `a${x}`)))}
      {P(`M${x0} ${mid + 18}H${x0 + S}`)}
      {P(`M${x0 + S / 4} ${mid}H${x0 + (3 * S) / 4}V${base - S + 22}H${x0 + S / 4}Z`)}
      {P(`M${x0 + S / 4 - 6} ${base - S + 22}L${x0 + S / 2} ${base - S}L${x0 + (3 * S) / 4 + 6} ${base - S + 22}Z`)}
      <circle cx={x0 + S / 2} cy={mid - 70} r={20} pathLength={1} className="ink" fill="none" />
      {P(`M${x0 + S / 4} ${mid}Q${x0 + 40} ${mid - 6} ${x0 + 30} ${mid - 30}Q${x0 + 60} ${mid - 30} ${x0 + S / 4} ${mid - 60}`)}
      {P(`M${x0 + (3 * S) / 4} ${mid}Q${x0 + S - 40} ${mid - 6} ${x0 + S - 30} ${mid - 30}Q${x0 + S - 60} ${mid - 30} ${x0 + (3 * S) / 4} ${mid - 60}`)}
      {over && (
        <g className="reg">
          <rect x={x0} y={base - S} width={S} height={S} />
          <rect x={x0} y={mid} width={S / 2} height={S / 2} />
          <rect x={x0 + S / 2} y={mid} width={S / 2} height={S / 2} />
          <rect x={x0 + S / 4} y={base - S} width={S / 2} height={S / 2} />
        </g>
      )}
    </g>
  );
}

