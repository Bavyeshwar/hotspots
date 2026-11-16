import { useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Popup, Rectangle, TileLayer, Tooltip, useMap } from 'react-leaflet';
import { Maximize2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './leaflet-theme.css';
import { COLORS, SENSOR_META } from '../../lib/theme';
import { fmtNum, monthLabel } from '../../lib/format';
import { DATA_REGIONS, REGION_BY_ID } from '../../data/regions';
import { PopupCard } from './PopupCard';

/**
 * Basemap tiles.
 * (comment block: CARTO with key, OSM fallback, key is visible in the client bundle)
 */
const CARTO_KEY = import.meta.env.VITE_CARTO_API_KEY;

const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const CARTO_STYLES = { dark: 'dark_all', standard: 'voyager' };

function resolveTiles(basemap) {
  if (CARTO_KEY) {
    const style = CARTO_STYLES[basemap] ?? CARTO_STYLES.standard;
    return {
      url: `https://basemaps.cartocdn.com/rastertiles/${style}/{z}/{x}/{y}.png?key=${encodeURIComponent(CARTO_KEY)}`,
      attribution: `${OSM_ATTRIBUTION} &copy; <a href="https://carto.com/attributions">CARTO</a>`,
      maxZoom: 19,
      cssDim: false, // CARTO's dark style is already dark; don't invert it.
    };
  }
  return {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: OSM_ATTRIBUTION,
    maxZoom: 19,
    cssDim: basemap === 'dark',
  };
}

const MARKER_STYLE = {
  modis: { color: COLORS.modisStroke, weight: 2, opacity: 1, fillColor: COLORS.modis, fillOpacity: 0.25 },
  viirs: { color: COLORS.viirsStroke, weight: 1, opacity: 1, fillColor: COLORS.viirs, fillOpacity: 0.9 },
};

/** MapContainer ignores prop changes after mount, so refit whenever bounds (or the reset button) change. */
function FitBounds({ bounds, tick }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds, { padding: [16, 16], animate: false });
  }, [map, bounds, tick]);
  return null;
}

function PointMarker({ p, radius, popupNote }) {
  const meta = SENSOR_META[p.sensor];
  return (
    <CircleMarker center={[p.lat, p.lon]} radius={radius} pathOptions={MARKER_STYLE[p.sensor]}>
      <Tooltip direction="top" offset={[0, -4]} className="fire-tooltip">
        {meta.name} · {monthLabel(p.month)}
      </Tooltip>
      <Popup className="fire-popup" minWidth={220}>
        <PopupCard
          title={`${meta.name} detection`}
          note={popupNote}
          rows={[
            ['Date', monthLabel(p.month)],
            ['Region', REGION_BY_ID[p.region]?.name ?? p.region],
            ['Location', `${fmtNum(p.lat, 2)}°, ${fmtNum(p.lon, 2)}°`],
            ['FRP (MW)', fmtNum(p.frp, 1)],
            ['Confidence', p.conf],
            ['Overpass', p.dn === 'D' ? 'Day' : 'Night'],
            ['Resolution', meta.resolution],
          ]}
        />
      </Popup>
    </CircleMarker>
  );
}

export function FireMap({
  points = [],
  cells = [],
  bbox,
  regionId = 'all',
  height = 420,
  basemap = 'dark',
  popupNote,
}) {
  const [tick, setTick] = useState(0);
  const tiles = useMemo(() => resolveTiles(basemap), [basemap]);

  const [minLon, minLat, maxLon, maxLat] = bbox;
  const bounds = useMemo(() => [[minLat, minLon], [maxLat, maxLon]], [minLon, minLat, maxLon, maxLat]);
  const wide = maxLon - minLon > 120;
  const modisR = wide ? 5 : 7;
  const viirsR = wide ? 2.5 : 3.5;
  const empty = points.length === 0 && cells.length === 0;

  return (
    <div
      role="region"
      aria-label={`Map showing ${cells.length ? `${cells.length} grid cells` : `${points.length} detections`}`}
      className={`relative overflow-hidden rounded-md border border-line ${tiles.cssDim ? 'fire-map--dark' : 'fire-map--standard'}`}
      style={{ height }}
    >
      <MapContainer
        bounds={bounds}
        preferCanvas
        worldCopyJump
        minZoom={2}
        maxBounds={[[-85, -240], [85, 240]]}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer key={tiles.url} url={tiles.url} attribution={tiles.attribution} maxZoom={tiles.maxZoom} />
        <FitBounds bounds={bounds} tick={tick} />

        {regionId === 'all' &&
          DATA_REGIONS.map((r) => (
            <Rectangle
              key={r.id}
              bounds={[[r.bbox[1], r.bbox[0]], [r.bbox[3], r.bbox[2]]]}
              pathOptions={{ color: '#93a3bf', weight: 1, dashArray: '4 4', fill: false, interactive: false }}
            />
          ))}

        {cells.map((c) => (
          <Rectangle key={c.id} bounds={c.bounds} pathOptions={c.style}>
            {c.label && <Tooltip sticky className="fire-tooltip">{c.label}</Tooltip>}
            {c.popup && <Popup className="fire-popup" minWidth={220}>{c.popup}</Popup>}
          </Rectangle>
        ))}

        {points.map((p) => (
          <PointMarker key={p.id} p={p} radius={p.sensor === 'modis' ? modisR : viirsR} popupNote={popupNote} />
        ))}
      </MapContainer>

      <button type="button" onClick={() => setTick((t) => t + 1)} className="absolute right-3 top-3 ...">
        <Maximize2 size={13} strokeWidth={1.75} aria-hidden />
        Reset view
      </button>

      {empty && (
        <div className="pointer-events-none absolute inset-0 z-[400] ...">
          No detections for this selection. Enable a source or widen the date range.
        </div>
      )}
    </div>
  );
}