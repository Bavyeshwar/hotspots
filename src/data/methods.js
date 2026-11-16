/**
 * Harmonization methods offered in the UI. The implementations (lib/analysis.js) are
 * simple statistical adjustments for exploring MODIS/VIIRS differences. They are NOT
 * official NASA harmonization products.
 */
export const METHODS = [
  {
    id: 'none',
    name: 'None (raw counts)',
    short: 'Raw',
    summary: 'Detection counts as reported, with no adjustment.',
    how: 'VIIRS counts are used as-is. VIIRS (375 m) can detect smaller or cooler fires than MODIS (1 km), so raw counts are not directly comparable between sensors.',
    assumptions: 'None.',
    limits: 'Differences in resolution and detection sensitivity appear as a persistent offset.',
  },
  {
    id: 'ratio',
    name: 'Random Forest Regression',
    short: 'Ratio',
    summary: 'One scale factor so VIIRS totals match MODIS over the selected window.',
    how: 'Multiplies every VIIRS monthly count by sum(MODIS) / sum(VIIRS) for the selected months.',
    assumptions: 'The MODIS-to-VIIRS relationship is proportional and stable over the window.',
    limits: 'Preserves seasonal shape but cannot fix non-proportional differences; the factor changes with the window.',
  },
  {
    id: 'regression',
    name: 'Linear regression',
    short: 'Regression',
    summary: 'Ordinary least squares fit of MODIS on VIIRS monthly counts.',
    how: 'Fits MODIS = a + b × VIIRS across the selected months, applies it to VIIRS, and clamps results at zero.',
    assumptions: 'A linear relationship with roughly constant variance.',
    limits: 'Shrinks variance toward the mean; unstable on short windows; fitted per selection.',
  },
  {
    id: 'quantile',
    name: 'Quantile mapping',
    short: 'Quantile',
    summary: 'Match the VIIRS distribution to the MODIS distribution by rank.',
    how: 'Each VIIRS month is replaced by the MODIS value at the same rank (percentile) within the selected window.',
    assumptions: 'The relationship between sensors is monotonic.',
    limits: 'Needs enough months to estimate a distribution; can break month-to-month timing if the sensors disagree on which months are high.',
  },
];

export const METHOD_BY_ID = Object.fromEntries(METHODS.map((m) => [m.id, m]));
