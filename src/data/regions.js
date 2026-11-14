/**
 * Regions are coarse, hand-drawn bounding boxes: [minLon, minLat, maxLon, maxLat].
 * They are for filtering and display only and are not official administrative boundaries.
 * `peak`, `amp`, `base`, `trend`, `ratio` parameterize the SYNTHETIC sample generator in sample.js.
 */
export const REGIONS = [
  { id: 'all', name: 'All listed regions', bbox: [-180, -60, 180, 75] },
  { id: 'wus', name: 'Western United States', bbox: [-124.5, 32, -104, 48.5], peak: 8, amp: 0.85, base: 2200, trend: 0.025, ratio: 3.1 },
  { id: 'amazon', name: 'Amazon basin', bbox: [-74, -15, -48, 2], peak: 9, amp: 0.8, base: 9000, trend: 0.005, ratio: 3.4 },
  { id: 'cafrica', name: 'Central Africa', bbox: [12, -14, 35, 5], peak: 7, amp: 0.9, base: 14000, trend: -0.01, ratio: 2.7 },
  { id: 'australia', name: 'Southeast Australia', bbox: [140, -39, 154, -26], peak: 12, amp: 0.85, base: 1800, trend: 0, ratio: 3.0 },
  { id: 'siberia', name: 'Siberia', bbox: [90, 52, 140, 68], peak: 7, amp: 0.9, base: 2500, trend: 0.02, ratio: 3.5 },
  { id: 'med', name: 'Mediterranean', bbox: [-10, 35, 30, 45], peak: 8, amp: 0.85, base: 1500, trend: 0.01, ratio: 3.2 },
];

export const REGION_BY_ID = Object.fromEntries(REGIONS.map((r) => [r.id, r]));
export const DATA_REGIONS = REGIONS.filter((r) => r.id !== 'all');
