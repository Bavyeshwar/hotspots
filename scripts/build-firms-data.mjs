import { createReadStream } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { createInterface } from 'node:readline';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const files = [
  { path: 'src/NASA_FIRMS/MODIS_1/archive.csv', sensor: 'modis' },
  { path: 'src/NASA_FIRMS/VIIRS_1/archive.csv', sensor: 'viirs' },
  { path: 'src/NASA_FIRMS/VIIRS_2/archive.csv', sensor: 'viirs' },
];
const pointLimitPerMonth = 40;
const monthly = new Map();
const samples = new Map();
const sourceRows = new Map(files.map(({ path }) => [path, 0]));

function randomFor(seed) {
  let state = 2166136261;
  for (const char of seed) state = Math.imul(state ^ char.charCodeAt(0), 16777619);
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function confidenceClass(sensor, value) {
  if (sensor === 'modis') {
    const confidence = Number(value);
    if (!Number.isFinite(confidence)) throw new Error(`Invalid MODIS confidence: ${value}`);
    return confidence < 30 ? 'low' : confidence > 80 ? 'high' : 'nominal';
  }
  const confidence = value.toLowerCase();
  if (confidence === 'l') return 'low';
  if (confidence === 'n') return 'nominal';
  if (confidence === 'h') return 'high';
  throw new Error(`Invalid VIIRS confidence: ${value}`);
}

function ensureMonth(month) {
  if (!monthly.has(month)) monthly.set(month, { modis: newCounts(), viirs: newCounts() });
  return monthly.get(month);
}

function newCounts() {
  return { count: 0, high: 0, nominal: 0, low: 0 };
}

for (const { path, sensor } of files) {
  const filePath = resolve(root, path);
  const handle = createInterface({ input: createReadStream(filePath), crlfDelay: Infinity });
  let columns;

  for await (const line of handle) {
    if (!columns) {
      columns = line.split(',');
      const required = ['latitude', 'longitude', 'acq_date', 'confidence', 'frp', 'daynight'];
      const missing = required.filter((column) => !columns.includes(column));
      if (missing.length) throw new Error(`${path} is missing columns: ${missing.join(', ')}`);
      continue;
    }
    if (!line) continue;

    sourceRows.set(path, sourceRows.get(path) + 1);
    const values = line.split(',');
    const record = Object.fromEntries(columns.map((column, index) => [column, values[index]]));
    const month = record.acq_date.slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(month)) throw new Error(`Invalid acquisition date in ${path}: ${record.acq_date}`);

    const confidence = confidenceClass(sensor, record.confidence);
    const counts = ensureMonth(month)[sensor];
    counts.count += 1;
    counts[confidence] += 1;

    const latitude = Number(record.latitude);
    const longitude = Number(record.longitude);
    const frp = Number(record.frp);
    if (![latitude, longitude, frp].every(Number.isFinite)) {
      throw new Error(`Invalid detection coordinates or FRP in ${path}: ${line}`);
    }

    const key = `${sensor}:${month}`;
    if (!samples.has(key)) samples.set(key, { points: [], seen: 0, random: randomFor(key) });
    const sample = samples.get(key);
    sample.seen += 1;
    const point = {
      sensor,
      region: 'us',
      lat: latitude,
      lon: longitude,
      month,
      frp,
      conf: confidence,
      dn: record.daynight,
    };
    if (sample.points.length < pointLimitPerMonth) {
      sample.points.push(point);
    } else {
      const index = Math.floor(sample.random() * sample.seen);
      if (index < pointLimitPerMonth) sample.points[index] = point;
    }
  }
}

const months = [...monthly.keys()].sort();
if (!months.length) throw new Error('No FIRMS detections were found.');

const monthlyRows = months.map((month) => {
  const sensors = monthly.get(month);
  const quality = (counts) => ({
    high: counts.count ? counts.high / counts.count : null,
    nominal: counts.count ? counts.nominal / counts.count : null,
    low: counts.count ? counts.low / counts.count : null,
    coverage: null,
  });
  return {
    month,
    modis: sensors.modis.count,
    viirs: sensors.viirs.count,
    q: { modis: quality(sensors.modis), viirs: quality(sensors.viirs) },
  };
});

const points = [];
for (const month of months) {
  for (const sensor of ['modis', 'viirs']) {
    const sample = samples.get(`${sensor}:${month}`);
    if (!sample) continue;
    sample.points.forEach((point, index) => points.push({ id: `${sensor}-${month}-${index}`, ...point }));
  }
}

const output = {
  synthetic: false,
  label: 'NASA FIRMS MODIS / VIIRS 375 m detections',
  months,
  monthly: { us: monthlyRows },
  points,
};
const outputPath = resolve(root, 'src/NASA_FIRMS/dashboard-data.json');
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output)}\n`);

console.log(`Wrote ${outputPath}`);
console.log(`Months: ${months[0]} to ${months[months.length - 1]}`);
console.log(`Detections: ${monthlyRows.reduce((total, row) => total + row.modis + row.viirs, 0).toLocaleString()}`);
console.log(`Map sample: ${points.length.toLocaleString()} detections`);
console.log(`Input records: ${[...sourceRows].map(([path, rows]) => `${path}: ${rows.toLocaleString()}`).join('; ')}`);
