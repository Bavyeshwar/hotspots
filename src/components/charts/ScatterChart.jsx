import { useState } from 'react';
import { fmtCompact, fmtInt, monthLabel } from '../../lib/format';
import { Legend, MARGIN, Tooltip, YAxis, niceMax, ticks, useWidth } from './chartKit';
import { EmptyChart } from './LineChart';

/** Monthly MODIS (x) vs harmonized VIIRS (y) with a dashed 1:1 reference line. */
export function ScatterChart({ points, xLabel, yLabel, color, height = 300 }) {
  const [ref, width] = useWidth();
  const [hover, setHover] = useState(null);
  if (!points.length) return <EmptyChart height={height} />;

  const innerW = width - MARGIN.l - MARGIN.r;
  const innerH = height - MARGIN.t - MARGIN.b;
  const max = niceMax(Math.max(...points.flatMap((p) => [p.x, p.y])));
  const x = (v) => MARGIN.l + (v / max) * innerW;
  const y = (v) => MARGIN.t + innerH - (v / max) * innerH;

  return (
    <div>
      <div ref={ref} className="relative">
        <svg width={width} height={height} role="img" aria-label={`Scatter plot of ${yLabel} against ${xLabel}`} onMouseLeave={() => setHover(null)}>
          <YAxis scale={y} tickValues={ticks(max)} width={width} />
          {ticks(max).map((t) => (
            <text key={t} x={x(t)} y={height - 10} textAnchor="middle" fontSize="10.5" fill="#62738f" className="num">
              {fmtCompact(t)}
            </text>
          ))}
          <line x1={x(0)} y1={y(0)} x2={x(max)} y2={y(max)} stroke="#62738f" strokeDasharray="4 4" />
          {points.map((p, i) => (
            <circle
              key={p.month}
              cx={x(p.x)}
              cy={y(p.y)}
              r={hover === i ? 5 : 3.5}
              fill={color}
              fillOpacity="0.7"
              stroke={hover === i ? '#e8eef8' : 'none'}
              onMouseEnter={() => setHover(i)}
            />
          ))}
        </svg>
        {hover != null && (
          <Tooltip
            x={x(points[hover].x)}
            y={y(points[hover].y)}
            containerWidth={width}
            title={monthLabel(points[hover].month)}
            rows={[
              { label: xLabel, color: '#3dd0e0', value: fmtInt(points[hover].x) },
              { label: yLabel, color, value: fmtInt(points[hover].y) },
            ]}
          />
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <Legend items={[{ label: 'Month', color }, { label: '1:1 line', color: '#62738f', dashed: true }]} />
        <span className="text-xs text-faint">
          x: {xLabel} · y: {yLabel}
        </span>
      </div>
    </div>
  );
}
