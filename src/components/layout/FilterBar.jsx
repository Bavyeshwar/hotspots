import { RotateCcw } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { REGIONS } from '../../data/regions';
import { METHODS } from '../../data/methods';
import { Button } from '../ui/Button';
import { MonthField, SelectField } from '../ui/Fields';

export function FilterBar() {
  const { filters, setFilter, resetFilters, isDefault, dataset } = useDashboard();
  const min = dataset.months[0];
  const max = dataset.months[dataset.months.length - 1];
  // Disable reset only when filters equal defaults; keep native month inputs inside the data range.

  return (
    <div className="border-b border-line bg-surface/95 backdrop-blur-sm" role="search" aria-label="Filters">
      <div className="mx-auto grid max-w-7xl grid-cols-2 items-end gap-3 px-4 py-3 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr_auto] lg:px-8">
        <SelectField
          className="col-span-2 lg:col-span-1"
          label="Region"
          value={filters.region}
          onChange={(v) => setFilter('region', v)}
          options={REGIONS.map((r) => ({ value: r.id, label: r.name }))}
        />
        <MonthField label="From" value={filters.start} min={min} max={max} onChange={(v) => setFilter('start', v)} />
        <MonthField label="To" value={filters.end} min={min} max={max} onChange={(v) => setFilter('end', v)} />
        <SelectField
          className="col-span-2 lg:col-span-1"
          label="Harmonization"
          value={filters.method}
          onChange={(v) => setFilter('method', v)}
          options={METHODS.map((m) => ({ value: m.id, label: m.name }))}
        />
        <Button variant="ghost" icon={RotateCcw} onClick={resetFilters} disabled={isDefault} className="col-span-2 lg:col-span-1">
          Reset
        </Button>
      </div>
    </div>
  );
}
