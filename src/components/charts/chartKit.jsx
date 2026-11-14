import { useEffect, useRef, useState } from 'react';
import { fmtCompact } from '../../lib/format';

/** Tracks the rendered width of a container so SVG charts stay crisp and responsive. */
export function useWidth(initial = 640) {
  const ref = useRef(null);
  const [width, setWidth] = useState(initial);
  useEffect(() => {
    if (!ref.current) return undefined;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(240, Math.floor(entry.contentRect.width))));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

export function niceMax(v) {
  if (!v || v <= 0) return 1;
  const exp = 10 ** Math.floor(Math.log10(v));
  const f = v / exp;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nice * exp;
}

export function ticks(max, count = 4) {
  return Array.from({ length: count + 1 }, (_, i) => (max / count) * i);
}

export const MARGIN = { l: 52, r: 12, t: 12, b: 30 };

export function YAxis({ scale, tickValues, width, format = fmtCompact, label }) {
  return (
    <g>
      {tickValues.map((t) => (
        <g key={t}>
          <line x1={MARGIN.l} x2={width - MARGIN.r} y1={scale(t)} y2={scale(t)} stroke="#1f2d46" strokeWidth="1" />
          <text x={MARGIN.l - 8} y={scale(t)} dy="0.32em" textAnchor="end" fontSize="10.5" fill="#62738f" className="num">
            {format(t)}
          </text>
        </g>
      ))}
      {label && (
        <text x={MARGIN.l} y={8} fontSize="10.5" fill="#62738f">
          {label}
        </text>
      )}
    </g>
  );
}

export function Legend({ items }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-2">
          {i.dashed ? (
            <span className="h-0 w-4 border-t border-dashed" style={{ borderColor: i.color }} aria-hidden />
          ) : (
            <span className="h-2 w-2 rounded-full" style={{ background: i.color }} aria-hidden />
          )}
          {i.label}
        </li>
      ))}
    </ul>
  );
}

export function Tooltip({ x, y, containerWidth, title, rows }) {
  const flip = x > containerWidth * 0.6;
  return (
    <div
      className="pointer-events-none absolute z-10 min-w-[8rem] rounded-md border border-line-strong bg-raised px-3 py-2 text-xs shadow-pop"
      style={{ left: x, top: y, transform: `translate(${flip ? 'calc(-100% - 12px)' : '12px'}, 0)` }}
    >
      <p className="mb-1.5 font-medium text-ink">{title}</p>
      <ul className="space-y-1">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted">
              <span className="h-2 w-2 rounded-full" style={{ background: r.color }} aria-hidden />
              {r.label}
            </span>
            <span className="num text-ink">{r.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
