import { useMemo, useState } from 'react';
import { COLORS } from '../../lib/theme';
import { fmtNum, monthLabel } from '../../lib/format';
import { DATA_REGIONS } from '../../data/regions';
import { Tooltip, useWidth } from '../charts/chartKit';

/**
 * Equirectangular point map. No basemap is bundled: only a lat/lon graticule and the
 * region boxes are drawn, so what you see is exactly the data plus coordinates.
 */
export function FireMap({ points, bbox, regionId, height = 420 }) {
  const [ref, width] = useWidth(720);
  const [hover, setHover] = useState(null);
  const [minLon, minLat, maxLon, maxLat] = bbox;

  const pad = 24;
  const spanLon = maxLon - minLon;
  const spanLat = maxLat - minLat;
  // Fit the box into the available width/height while keeping degrees square.
  const scale = Math.min((width - pad * 2) / spanLon, (height - pad * 2) / spanLat);
  const mapW = spanLon * scale;
  const mapH = spanLat * scale;
  const ox = (width - mapW) / 2;
  const oy = (height - mapH) / 2;
  const px = (lon) => ox + (lon - minLon) * scale;
  const py = (lat) => oy + (maxLat - lat) * scale;

  const gridStep = spanLon > 120 ? 30 : spanLon > 40 ? 10 : 5;
  const lons = useMemo(() => {
    const out = [];
    for (let v = Math.ceil(minLon / gridStep) * gridStep; v <= maxLon; v += gridStep) out.push(v);
    return out;
  }, [minLon, maxLon, gridStep]);
  const lats = useMemo(() => {
    const out = [];
    for (let v = Math.ceil(minLat / gridStep) * gridStep; v <= maxLat; v += gridStep) out.push(v);
    return out;
  }, [minLat, maxLat, gridStep]);

  const showRegionBoxes = regionId === 'all';
  const modisR = spanLon > 120 ? 3 : 4.5;
  const viirsR = spanLon > 120 ? 1.6 : 2.4;
  const hp = hover != null ? points[hover] : null;

  return (
    <div ref={ref} className="relative overflow-hidden rounded-md border border-line bg-bg">
      <svg width={width} height={height} role="img" aria-label={`Map of ${points.length} detections`} onMouseLeave={() => setHover(null)}>
        <rect x={ox} y={oy} width={mapW} height={mapH} fill="#0c1526" stroke="#1f2d46" />
        {lons.map((v) => (
          <g key={`lon${v}`}>
            <line x1={px(v)} x2={px(v)} y1={oy} y2={oy + mapH} stroke={COLORS.grid} strokeWidth="1" />
            <text x={px(v)} y={oy + mapH + 14} textAnchor="middle" fontSize="10" fill={COLORS.axis} className="num">
              {Math.abs(v)}°{v < 0 ? 'W' : v > 0 ? 'E' : ''}
            </text>
          </g>
        ))}
        {lats.map((v) => (
          <g key={`lat${v}`}>
            <line x1={ox} x2={ox + mapW} y1={py(v)} y2={py(v)} stroke={COLORS.grid} strokeWidth="1" />
            <text x={ox - 6} y={py(v)} dy="0.32em" textAnchor="end" fontSize="10" fill={COLORS.axis} className="num">
              {Math.abs(v)}°{v < 0 ? 'S' : v > 0 ? 'N' : ''}
            </text>
          </g>
        ))}

        {showRegionBoxes &&
          DATA_REGIONS.map((r) => (
            <g key={r.id}>
              <rect
                x={px(r.bbox[0])}
                y={py(r.bbox[3])}
                width={(r.bbox[2] - r.bbox[0]) * scale}
                height={(r.bbox[3] - r.bbox[1]) * scale}
                fill="none"
                stroke="#2c3d5c"
                strokeDasharray="3 3"
              />
            </g>
          ))}

        {points.map((p, i) =>
          p.sensor === 'modis' ? (
            <circle
              key={p.id}
              cx={px(p.lon)}
              cy={py(p.lat)}
              r={modisR}
              fill="none"
              stroke={COLORS.modis}
              strokeWidth="1.25"
              strokeOpacity="0.85"
              onMouseEnter={() => setHover(i)}
            />
          ) : (
            <circle
              key={p.id}
              cx={px(p.lon)}
              cy={py(p.lat)}
              r={viirsR}
              fill={COLORS.viirs}
              fillOpacity="0.8"
              onMouseEnter={() => setHover(i)}
            />
          ),
        )}
        {hp && <circle cx={px(hp.lon)} cy={py(hp.lat)} r="8" fill="none" stroke="#e8eef8" strokeWidth="1.25" />}
      </svg>

      {hp && (
        <Tooltip
          x={px(hp.lon)}
          y={py(hp.lat)}
          containerWidth={width}
          title={`${hp.sensor === 'modis' ? 'MODIS' : 'VIIRS'} detection · ${monthLabel(hp.month)}`}
          rows={[
            { label: 'Location', color: 'transparent', value: `${fmtNum(hp.lat, 2)}°, ${fmtNum(hp.lon, 2)}°` },
            { label: 'FRP (MW)', color: 'transparent', value: fmtNum(hp.frp, 1) },
            { label: 'Confidence', color: 'transparent', value: hp.conf },
            { label: 'Overpass', color: 'transparent', value: hp.dn === 'D' ? 'Day' : 'Night' },
          ]}
        />
      )}

      {points.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-faint">
          No detections for this selection. Enable a sensor or widen the date range.
        </div>
      )}
    </div>
  );
}
