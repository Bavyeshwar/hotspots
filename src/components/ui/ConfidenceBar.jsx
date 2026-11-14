import { COLORS } from '../../lib/theme';
import { fmtPct } from '../../lib/format';

const SEGMENTS = [
  { key: 'high', label: 'High', color: COLORS.high },
  { key: 'nominal', label: 'Nominal', color: COLORS.nominal },
  { key: 'low', label: 'Low', color: COLORS.low },
];

/** Stacked bar of detection confidence classes. `q` = { high, nominal, low } fractions. */
export function ConfidenceBar({ q, legend = true }) {
  if (!q) return <p className="text-xs text-faint">No detections in selection.</p>;
  return (
    <div>
      <div
        className="flex h-2.5 overflow-hidden rounded-full bg-raised"
        role="img"
        aria-label={SEGMENTS.map((s) => `${s.label} ${fmtPct(q[s.key])}`).join(', ')}
      >
        {SEGMENTS.map((s) => (
          <div key={s.key} style={{ width: `${q[s.key] * 100}%`, background: s.color }} />
        ))}
      </div>
      {legend && (
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          {SEGMENTS.map((s) => (
            <li key={s.key} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} aria-hidden />
              {s.label} <span className="num text-ink">{fmtPct(q[s.key])}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
