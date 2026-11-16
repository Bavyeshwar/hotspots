import { createContext, useContext, useMemo, useState } from 'react';
import { loadDataset } from '../data/source';
import { DATA_REGIONS, REGION_BY_ID } from '../data/regions';
import { METHODS } from '../data/methods';
import {
  annual,
  filterPoints,
  harmonize,
  metrics,
  qualityOf,
  reliabilityOf,
  seasonal,
  sliceMonthly,
} from '../lib/analysis';

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const dataset = useMemo(() => loadDataset(), []);
  const defaults = useMemo(
    () => ({ region: 'us', start: dataset.months[0], end: dataset.months[dataset.months.length - 1], method: 'ratio' }),
    [dataset],
  );
  const [filters, setFilters] = useState(defaults);
  const [sensors, setSensors] = useState({ modis: true, viirs: true });

  const value = useMemo(() => {
    const { region, start, end, method } = filters;
    const lo = start <= end ? start : end;
    const hi = start <= end ? end : start;

    const rows = harmonize(method, sliceMonthly(dataset, region, lo, hi));
    const m = metrics(rows);

    const byMethod = METHODS.map((meth) => {
      const r = harmonize(meth.id, sliceMonthly(dataset, region, lo, hi));
      return { method: meth, rows: r, metrics: metrics(r) };
    });

    const regionSummary = DATA_REGIONS.map((reg) => {
      const r = harmonize(method, sliceMonthly(dataset, reg.id, lo, hi));
      return { region: reg, modis: r.reduce((s, x) => s + x.modis, 0), viirsH: r.reduce((s, x) => s + x.viirsH, 0), metrics: metrics(r) };
    });

    // Full-record rows for the History page (ignores the date filter, respects region + method).
    const history = harmonize(method, sliceMonthly(dataset, region, dataset.months[0], dataset.months[dataset.months.length - 1]));

    return {
      dataset,
      filters: { ...filters, start: lo, end: hi },
      regionInfo: REGION_BY_ID[region],
      sensors,
      rows,
      metrics: m,
      byMethod,
      regionSummary,
      history,
      yearly: annual(history),
      seasonalMeans: seasonal(rows),
      quality: { modis: qualityOf(rows, 'modis'), viirs: qualityOf(rows, 'viirs') },
      reliability: reliabilityOf(m, rows.length),
      points: filterPoints(dataset.points, region, lo, hi, sensors),
      setFilter: (key, val) => setFilters((f) => ({ ...f, [key]: val })),
      resetFilters: () => setFilters(defaults),
      toggleSensor: (id) => setSensors((s) => ({ ...s, [id]: !s[id] })),
      isDefault: JSON.stringify(filters) === JSON.stringify(defaults),
    };
  }, [dataset, filters, sensors, defaults]);

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used inside <DashboardProvider>');
  return ctx;
}
