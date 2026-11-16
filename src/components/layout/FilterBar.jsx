import { RotateCcw } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { Button } from '../ui/Button';
import { MonthField } from '../ui/Fields';

export function FilterBar() {
  const { filters, setFilter, resetFilters, isDefault, dataset } = useDashboard();
  const min = dataset.months[0];
  const max = dataset.months[dataset.months.length - 1];
  // Disable reset only when filters equal defaults; keep native month inputs inside the data range.

  return (
    <div className="border-b border-line bg-surface/95 backdrop-blur-sm" role="search" aria-label="Filters">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-3 px-4 py-3 sm:grid-cols-2 sm:px-6 xl:grid-cols-5 lg:px-8">
        <div className="flex min-w-0 flex-col gap-1.5">
          <p className="eyebrow">Region</p>
          <div className="control flex w-full items-center" aria-label="Region">
            United States
          </div>
        </div>
        <MonthField label="From" value={filters.start} min={min} max={max} onChange={(v) => setFilter('start', v)} />
        <MonthField label="To" value={filters.end} min={min} max={max} onChange={(v) => setFilter('end', v)} />
        <div className="flex min-w-0 flex-col gap-1.5">
          <p className="eyebrow">Model</p>
          <div className="control flex w-full items-center truncate" aria-label="Model">
            Random Forest Regression
          </div>
        </div>
        <div className="flex min-w-0 items-end sm:col-span-2 xl:col-span-1">
          <Button variant="ghost" icon={RotateCcw} onClick={resetFilters} disabled={isDefault} className="w-full">
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
