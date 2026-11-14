import { useState } from 'react';
import { fmtCompact, fmtInt } from '../../lib/format';
import { Legend, MARGIN, Tooltip, YAxis, niceMax, ticks, useWidth } from './chartKit';
import { EmptyChart } from './LineChart';

/**
 * Grouped bars. series: [{ id, label, color, values: number[] }]; categories: string[]
 * `partial` optionally marks categories with incomplete data (drawn with reduced opacity).
 */
export function BarChart({
  series,
  categories,
  categoryLabel = (c) => c,
  valueFormat = fmtCompact,
  tooltipFormat = fmtInt,
  partial = [],
  height = 260,
  ariaLabel,
}) {
  const [ref, width] = useWidth();
  const [hover, setHover] = useState(null);
  const n = categories.length;
  if (!n) return <EmptyChart height={height} />;

  const innerW = width - MARGIN.l - MARGIN.r;
  const innerH = height - MARGIN.t - MARGIN.b;
  const max = niceMax(Math.max(...series.flatMap((s) => s.values)));
  const y = (v) => MARGIN.t + innerH - (v / max) * innerH;
  const band = innerW / n;
  const groupW = Math.min(band * 0.72, 56 * series.length);
  const barW = groupW / series.length - 2;
  const step = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(innerW / 48))));

  return (
    <div>
      <div ref={ref} className="relative">
        <svg width={width} height={height} role="img" aria-label={ariaLabel} onMouseLeave={() => setHover(null)}>
          <YAxis scale={y} tickValues={ticks(max)} width={width} format={valueFormat} />
          {categories.map((c, i) => {
            const cx = MARGIN.l + band * i + band / 2;
            const isPartial = partial.includes(c);
            return (
              <g key={c} onMouseEnter={() => setHover(i)}>
                <rect x={MARGIN.l + band * i} y={MARGIN.t} width={band} height={innerH} fill={hover === i ? '#152036' : 'transparent'} opacity="0.6" />
                {series.map((s, si) => {
                  const bx = cx - groupW / 2 + si * (groupW / series.length) + 1;
                  const h = Math.max(0, MARGIN.t + innerH - y(s.values[i]));
                  return (
                    <rect
                      key={s.id}
                      x={bx}
                      y={y(s.values[i])}
                      width={Math.max(2, barW)}
                      height={h}
                      rx="2"
                      fill={s.color}
                      opacity={isPartial ? 0.45 : 1}
                    />
                  );
                })}
                {i % step === 0 && (
                  <text x={cx} y={height - 10} textAnchor="middle" fontSize="10.5" fill="#62738f">
                    {categoryLabel(c)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        {hover != null && (
          <Tooltip
            x={MARGIN.l + band * hover + band / 2}
            y={MARGIN.t}
            containerWidth={width}
            title={`${categoryLabel(categories[hover])}${partial.includes(categories[hover]) ? ' (partial)' : ''}`}
            rows={series.map((s) => ({ label: s.label, color: s.color, value: tooltipFormat(s.values[hover]) }))}
          />
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <Legend items={series.map((s) => ({ label: s.label, color: s.color }))} />
        {partial.length > 0 && <span className="text-xs text-faint">Lighter bars = fewer than 12 months of data</span>}
      </div>
    </div>
  );
}
