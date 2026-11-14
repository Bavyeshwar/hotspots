/**
 * Single seam between the UI and its data.
 *
 * Today this returns the synthetic dataset. To show real observations, return an object
 * with the same shape:
 *
 *   {
 *     synthetic: false,
 *     label: 'NASA FIRMS (MODIS C6.1 / VIIRS 375 m)',
 *     months: ['2012-01', ...],
 *     monthly: { [regionId]: [{ month, modis, viirs, q: { modis: Q, viirs: Q } }] },
 *     points:  [{ id, sensor, region, lat, lon, month, frp, conf, dn }],
 *   }
 *   where Q = { high, nominal, low, coverage } (fractions 0..1)
 *
 * See README.md for notes on NASA FIRMS.
 */
import { getSampleDataset } from './sample';

export function loadDataset() {
  return getSampleDataset();
}
