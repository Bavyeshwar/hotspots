/**
 * Regions are coarse, hand-drawn bounding boxes: [minLon, minLat, maxLon, maxLat].
 * They are for filtering and display only and are not official administrative boundaries.
 * The bounding box is used to frame the supplied U.S. FIRMS detections.
 */
export const REGIONS = [
  { id: 'us', name: 'United States', bbox: [-180, 18, -65, 72] },
];

export const REGION_BY_ID = Object.fromEntries(REGIONS.map((r) => [r.id, r]));
export const DATA_REGIONS = REGIONS.filter((r) => r.id !== 'all');
