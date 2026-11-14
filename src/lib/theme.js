/** Hex values for SVG charts. Keep in sync with tailwind.config.js. */
export const COLORS = {
  modis: '#3dd0e0',
  viirs: '#ff9640',
  grid: '#1f2d46',
  axis: '#62738f',
  text: '#93a3bf',
  surface: '#0f1829',
  raised: '#152036',
  ok: '#5ccf9b',
  warn: '#f2c14e',
  danger: '#ef6b5b',
  low: '#3a4a68',
  nominal: '#6f86ad',
  high: '#cfe0ff',
};

export const SENSOR_META = {
  modis: {
    id: 'modis',
    name: 'MODIS',
    platforms: 'Terra, Aqua',
    resolution: '1 km at nadir',
    product: 'MOD14 / MYD14 active fire',
    color: COLORS.modis,
    text: 'text-cyan-400',
  },
  viirs: {
    id: 'viirs',
    name: 'VIIRS',
    platforms: 'Suomi NPP, NOAA-20, NOAA-21',
    resolution: '375 m (I-band)',
    product: 'VNP14IMG / VJ114IMG active fire',
    color: COLORS.viirs,
    text: 'text-ember-400',
  },
};
