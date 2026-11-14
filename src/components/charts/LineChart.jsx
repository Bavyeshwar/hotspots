import { useState } from 'react';
import { fmtCompact, fmtInt } from '../../lib/format';
import { Legend, MARGIN, Tooltip, YAxis, niceMax, ticks, useWidth } from './chartKit';

/**
 * series: [{ id, label, color, values: number[], dashed?: boolean }]
 * categories: string[] (same length as each values array)
 */
export function LineChart({
  series,
  categories,
  categoryLabel = (c) => c,
  tooltipTitle = categoryLabel,
  valueFormat = fmtCompact,
  tooltipFormat = fmtInt,
  yMax,
  height = 260,
  ariaLabel,
}) {
  const [ref, width] = useWidth();
  const [hover, setHover] = useState(null);
  const n = categories.length;
  if (!n) return <EmptyChart height={height} />;

  const innerW = width - MARGIN.l - MARGIN.r;
  const innerH = height - MARGIN.t - MARGIN.b;
  const max = yMax ?? niceMax(Math.max(...series.flatMap((s) => s.values)));
  const x = (i) => MARGIN.l + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const y = (v) => MARGIN.t + innerH - (v / max) * innerH;
  const step = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(innerW / 72))));

  const path = (values) => values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const i = Math.round(((px - MARGIN.l) / innerW) * (n - 1));
    setHover(Math.min(n - 1, Math.max(0, i)));
  };

  return (
    <div>
      <div ref={ref} className="relative">
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={ariaLabel}
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
        >
          <YAxis scale={y} tickValues={ticks(max)} width={width} format={valueFormat} />
          {categories.map(
            (c, i) =>
              i % step === 0 && (
                <text key={c} x={x(i)} y={height - 10} textAnchor="middle" fontSize="10.5" fill="#62738f">
                  {categoryLabel(c)}
                </text>
              ),
          )}
          {series.map((s) => (
            <path
              key={s.id}
              d={path(s.values)}
              fill="none"
              stroke={s.color}
              strokeWidth="1.75"
              strokeLinejoin="round"
              strokeDasharray={s.dashed ? '4 4' : undefined}
            />
          ))}
          {hover != null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={MARGIN.t} y2={MARGIN.t + innerH} stroke="#2c3d5c" />
              {series.map((s) => (
                <circle key={s.id} cx={x(hover)} cy={y(s.values[hover])} r="3.5" fill={s.color} stroke="#0f1829" strokeWidth="1.5" />
              ))}
            </g>
          )}
        </svg>
        {hover != null && (
          <Tooltip
            x={x(hover)}
            y={MARGIN.t}
            containerWidth={width}
            title={tooltipTitle(categories[hover])}
            rows={series.map((s) => ({ label: s.label, color: s.color, value: tooltipFormat(s.values[hover]) }))}
          />
        )}
      </div>
      <div className="mt-3">
        <Legend items={series.map((s) => ({ label: s.label, color: s.color, dashed: s.dashed }))} />
      </div>
    </div>
  );
}

export function EmptyChart({ height = 200, message = 'No data for this selection.' }) {
  return (
    <div className="flex items-center justify-center rounded-md border border-dashed border-line text-xs text-faint" style={{ height }}>
      {message}
    </div>
  );
}
