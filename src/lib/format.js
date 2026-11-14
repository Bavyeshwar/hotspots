const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const MONTH_NAMES = MONTHS;

export function fmtInt(n) {
  if (n == null || Number.isNaN(n)) return '—';
  return Math.round(n).toLocaleString('en-US');
}

export function fmtCompact(n) {
  if (n == null || Number.isNaN(n)) return '—';
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

export function fmtPct(frac, digits = 0) {
  if (frac == null || Number.isNaN(frac)) return '—';
  return `${(frac * 100).toFixed(digits)}%`;
}

export function fmtSignedPct(frac, digits = 1) {
  if (frac == null || Number.isNaN(frac)) return '—';
  const v = (frac * 100).toFixed(digits);
  return `${frac > 0 ? '+' : ''}${v}%`;
}

export function fmtNum(n, digits = 2) {
  if (n == null || Number.isNaN(n)) return '—';
  return n.toFixed(digits);
}

/** '2019-08' -> 'Aug 2019' */
export function monthLabel(ym) {
  const [y, m] = ym.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

/** '2019-08' -> "Aug '19" */
export function monthShort(ym) {
  const [y, m] = ym.split('-').map(Number);
  return `${MONTHS[m - 1]} '${String(y).slice(2)}`;
}
