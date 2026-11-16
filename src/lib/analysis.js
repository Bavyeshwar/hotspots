import { DATA_REGIONS } from '../data/regions';

const sum = (a) => a.reduce((s, v) => s + v, 0);
const mean = (a) => (a.length ? sum(a) / a.length : null);

export function pearson(x, y) {
  const n = x.length;
  if (n < 3) return null;
  const mx = mean(x);
  const my = mean(y);
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i += 1) {
    sxy += (x[i] - mx) * (y[i] - my);
    sxx += (x[i] - mx) ** 2;
    syy += (y[i] - my) ** 2;
  }
  return sxx && syy ? sxy / Math.sqrt(sxx * syy) : null;
}

/** Ordinary least squares y = a + b x. */
export function ols(x, y) {
  const mx = mean(x);
  const my = mean(y);
  let sxy = 0;
  let sxx = 0;
  for (let i = 0; i < x.length; i += 1) {
    sxy += (x[i] - mx) * (y[i] - my);
    sxx += (x[i] - mx) ** 2;
  }
  const b = sxx ? sxy / sxx : 0;
  return { a: (my ?? 0) - b * (mx ?? 0), b };
}

function quantileMap(source, target) {
  const n = source.length;
  if (n < 2) return source.slice();
  const sortedT = target.slice().sort((p, q) => p - q);
  const order = source.map((v, i) => [v, i]).sort((p, q) => p[0] - q[0]);
  const out = new Array(n);
  order.forEach(([, idx], rank) => {
    const pos = (rank / (n - 1)) * (sortedT.length - 1);
    const lo = Math.floor(pos);
    const hi = Math.ceil(pos);
    out[idx] = sortedT[lo] + (sortedT[hi] - sortedT[lo]) * (pos - lo);
  });
  return out;
}

/** Adds `viirsH` (harmonized VIIRS) to each monthly row. */
export function harmonize(method, rows) {
  const m = rows.map((r) => r.modis);
  const v = rows.map((r) => r.viirs);
  let out;
  switch (method) {
    case 'ratio': {
      const k = sum(m) / Math.max(1, sum(v));
      out = v.map((x) => x * k);
      break;
    }
    case 'regression': {
      if (rows.length < 3) {
        out = v.slice();
        break;
      }
      const { a, b } = ols(v, m);
      out = v.map((x) => Math.max(0, a + b * x));
      break;
    }
    case 'quantile':
      out = quantileMap(v, m);
      break;
    default:
      out = v.slice();
  }
  return rows.map((r, i) => ({ ...r, viirsH: out[i] }));
}

/** Agreement statistics between MODIS and (harmonized) VIIRS monthly counts. */
export function metrics(rows) {
  const n = rows.length;
  if (!n) return { n: 0, r: null, rmse: null, bias: null, biasPct: null, ratio: null };
  const m = rows.map((r) => r.modis);
  const v = rows.map((r) => r.viirsH);
  const rmse = Math.sqrt(mean(m.map((x, i) => (v[i] - x) ** 2)));
  const bias = mean(v) - mean(m);
  return {
    n,
    r: pearson(m, v),
    rmse,
    bias,
    biasPct: mean(m) ? bias / mean(m) : null,
    ratio: sum(m) ? sum(v) / sum(m) : null,
  };
}

export function sliceMonthly(dataset, regionId, start, end) {
  const inRange = (r) => r.month >= start && r.month <= end;
  if (regionId !== 'all') return (dataset.monthly[regionId] || []).filter(inRange);

  // "All listed regions": sum counts, weight quality by detections.
  const lists = DATA_REGIONS.map((r) => (dataset.monthly[r.id] || []).filter(inRange));
  const length = lists[0]?.length ?? 0;
  const rows = [];
  for (let i = 0; i < length; i += 1) {
    const parts = lists.map((l) => l[i]);
    const row = { month: parts[0].month, modis: 0, viirs: 0, q: {} };
    ['modis', 'viirs'].forEach((s) => {
      row[s] = sum(parts.map((p) => p[s]));
      const agg = {};
      ['high', 'nominal', 'low', 'coverage'].forEach((k) => {
        const available = parts.filter((p) => p.q[s][k] != null);
        const availableWeight = sum(available.map((p) => p[s]));
        agg[k] = availableWeight
          ? sum(available.map((p) => p.q[s][k] * p[s])) / availableWeight
          : null;
      });
      row.q[s] = agg;
    });
    rows.push(row);
  }
  return rows;
}

export function annual(rows) {
  const byYear = new Map();
  rows.forEach((r) => {
    const y = r.month.slice(0, 4);
    const e = byYear.get(y) || { year: y, modis: 0, viirs: 0, viirsH: 0, months: 0 };
    e.modis += r.modis;
    e.viirs += r.viirs;
    e.viirsH += r.viirsH;
    e.months += 1;
    byYear.set(y, e);
  });
  return [...byYear.values()];
}

export function seasonal(rows) {
  const buckets = Array.from({ length: 12 }, () => ({ modis: [], viirsH: [] }));
  rows.forEach((r) => {
    const i = Number(r.month.slice(5)) - 1;
    buckets[i].modis.push(r.modis);
    buckets[i].viirsH.push(r.viirsH);
  });
  return buckets.map((b) => ({ modis: mean(b.modis), viirsH: mean(b.viirsH) }));
}

/** Detection-weighted quality for one sensor across rows. */
export function qualityOf(rows, sensor) {
  const total = sum(rows.map((r) => r[sensor]));
  if (!total) return null;
  const agg = {};
  ['high', 'nominal', 'low', 'coverage'].forEach((k) => {
    const available = rows.filter((r) => r.q[sensor][k] != null);
    const availableTotal = sum(available.map((r) => r[sensor]));
    agg[k] = availableTotal
      ? sum(available.map((r) => r.q[sensor][k] * r[sensor])) / availableTotal
      : null;
  });
  return agg;
}

/**
 * Plain, inspectable rule used for the reliability badge:
 *  - fewer than 12 months selected -> Limited
 *  - correlation below 0.8 (or undefined) -> Moderate
 *  - otherwise -> Good
 */
export function reliabilityOf(m, months) {
  if (months < 12) return { level: 'limited', label: 'Limited', reason: 'Fewer than 12 months selected.' };
  if (m.r == null || m.r < 0.8) return { level: 'moderate', label: 'Moderate', reason: 'Sensor correlation is below 0.80.' };
  return { level: 'good', label: 'Good', reason: '12+ months selected and correlation is at least 0.80.' };
}

export function filterPoints(points, regionId, start, end, sensors) {
  return points.filter(
    (p) =>
      (regionId === 'all' || p.region === regionId) &&
      p.month >= start &&
      p.month <= end &&
      sensors[p.sensor],
  );
}
