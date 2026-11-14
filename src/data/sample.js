/**
 * SYNTHETIC SAMPLE DATA. Generated deterministically in the browser for interface
 * development. None of these numbers are NASA observations.
 *
 * To use real data, replace `loadDataset()` in ./source.js with a loader that returns
 * the same shape (see README.md).
 */
import { mulberry32, gauss } from '../lib/rng';
import { DATA_REGIONS } from './regions';

export const FIRST_MONTH = '2012-01';
export const LAST_MONTH = '2025-12';

function buildMonths() {
  const out = [];
  for (let y = 2012; y <= 2025; y += 1) {
    for (let m = 1; m <= 12; m += 1) out.push(`${y}-${String(m).padStart(2, '0')}`);
  }
  return out;
}

export const MONTHS = buildMonths();

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function qualityFor(rand, kind, cloud) {
  // Share of detections by confidence class, and simulated valid-observation coverage.
  const high = clamp((kind === 'modis' ? 0.4 : 0.22) + gauss(rand) * 0.03, 0.05, 0.8);
  const low = clamp((kind === 'modis' ? 0.16 : 0.08) + gauss(rand) * 0.02, 0.02, 0.4);
  const nominal = Math.max(0, 1 - high - low);
  const coverage = clamp((kind === 'modis' ? 0.9 : 0.93) - cloud * 0.18 + gauss(rand) * 0.02, 0.5, 0.99);
  return { high, nominal, low, coverage };
}

function buildMonthly() {
  const monthly = {};
  DATA_REGIONS.forEach((region, ri) => {
    const rand = mulberry32(1000 + ri * 97);
    const yearAnomaly = {};
    for (let y = 2012; y <= 2025; y += 1) yearAnomaly[y] = Math.exp(gauss(rand) * 0.25);

    monthly[region.id] = MONTHS.map((month) => {
      const [y, m] = month.split('-').map(Number);
      const phase = (1 + Math.cos((2 * Math.PI * (m - region.peak)) / 12)) / 2;
      const season = 0.05 + phase ** (1 + 2 * region.amp);
      const latent = region.base * season * (1 + region.trend) ** (y - 2012) * yearAnomaly[y];
      const modis = Math.round(latent * Math.exp(gauss(rand) * 0.12));
      const viirs = Math.round(latent * region.ratio * Math.exp(gauss(rand) * 0.15));
      const cloud = phase * 0.5 + rand() * 0.3;
      return {
        month,
        modis,
        viirs,
        q: { modis: qualityFor(rand, 'modis', cloud), viirs: qualityFor(rand, 'viirs', cloud) },
      };
    });
  });
  return monthly;
}

function buildPoints() {
  const points = [];
  DATA_REGIONS.forEach((region, ri) => {
    const rand = mulberry32(5000 + ri * 131);
    const [minLon, minLat, maxLon, maxLat] = region.bbox;
    const w = maxLon - minLon;
    const h = maxLat - minLat;
    const centers = Array.from({ length: 4 }, () => ({
      lon: minLon + w * (0.2 + rand() * 0.6),
      lat: minLat + h * (0.2 + rand() * 0.6),
    }));

    const make = (sensor, count) => {
      for (let i = 0; i < count; i += 1) {
        // Rejection-sample a month using the region's seasonal weight.
        let month;
        for (let tries = 0; tries < 20; tries += 1) {
          const candidate = MONTHS[Math.floor(rand() * MONTHS.length)];
          const m = Number(candidate.slice(5));
          const phase = (1 + Math.cos((2 * Math.PI * (m - region.peak)) / 12)) / 2;
          if (rand() < 0.1 + phase ** 2) {
            month = candidate;
            break;
          }
        }
        if (!month) month = MONTHS[0];
        const c = centers[Math.floor(rand() * centers.length)];
        const lon = clamp(c.lon + gauss(rand) * w * 0.12, minLon, maxLon);
        const lat = clamp(c.lat + gauss(rand) * h * 0.12, minLat, maxLat);
        const r = rand();
        const highShare = sensor === 'modis' ? 0.4 : 0.22;
        const lowShare = sensor === 'modis' ? 0.16 : 0.08;
        const conf = r < highShare ? 'high' : r < highShare + lowShare ? 'low' : 'nominal';
        points.push({
          id: `${sensor}-${region.id}-${i}`,
          sensor,
          region: region.id,
          lat,
          lon,
          month,
          frp: Math.round(Math.exp(2.4 + gauss(rand) * 0.9) * 10) / 10,
          conf,
          dn: rand() < 0.55 ? 'D' : 'N',
        });
      }
    };
    make('modis', 180);
    make('viirs', 420);
  });
  return points;
}

let cache;
export function getSampleDataset() {
  if (!cache) {
    cache = {
      synthetic: true,
      label: 'Synthetic sample data',
      months: MONTHS,
      monthly: buildMonthly(),
      points: buildPoints(),
    };
  }
  return cache;
}
