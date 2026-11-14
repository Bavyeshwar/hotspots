import { Check, GitCompare, SlidersHorizontal } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { METHODS } from '../data/methods';
import { SENSOR_META } from '../lib/theme';
import { fmtInt, fmtNum, fmtSignedPct, monthLabel, monthShort } from '../lib/format';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { Badge } from '../components/ui/Badge';
import { DataTable } from '../components/ui/DataTable';
import { LineChart } from '../components/charts/LineChart';

export default function Methods() {
  const { filters, setFilter, regionInfo, byMethod, rows } = useDashboard();
  const selected = METHODS.find((m) => m.id === filters.method);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Harmonization"
        title="Choose how VIIRS is aligned to MODIS"
        description="VIIRS and MODIS observe fires at different resolutions, so raw counts differ. These are simple statistical adjustments for exploration. They are not official NASA products."
      />

      <div role="radiogroup" aria-label="Harmonization method" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {METHODS.map((m) => {
          const active = m.id === filters.method;
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setFilter('method', m.id)}
              className={`rounded-lg border p-5 text-left transition-colors ${
                active ? 'border-cyan-500 bg-raised' : 'border-line bg-surface hover:border-line-strong'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink">{m.name}</span>
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                    active ? 'border-cyan-400 bg-cyan-400 text-bg' : 'border-line-strong text-transparent'
                  }`}
                >
                  <Check size={12} strokeWidth={3} aria-hidden />
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted">{m.summary}</p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardHeader icon={SlidersHorizontal} title={selected.name} subtitle="How it works" />
          <CardBody className="space-y-4 text-sm leading-relaxed">
            <div>
              <p className="eyebrow mb-1">Method</p>
              <p className="text-muted">{selected.how}</p>
            </div>
            <div>
              <p className="eyebrow mb-1">Assumes</p>
              <p className="text-muted">{selected.assumptions}</p>
            </div>
            <div>
              <p className="eyebrow mb-1">Limitations</p>
              <p className="text-muted">{selected.limits}</p>
            </div>
          </CardBody>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader
            icon={GitCompare}
            title="Before and after"
            subtitle={`${regionInfo.name}, ${monthLabel(filters.start)} to ${monthLabel(filters.end)}`}
          />
          <CardBody>
            <LineChart
              ariaLabel="Raw and harmonized VIIRS compared with MODIS"
              categories={rows.map((r) => r.month)}
              categoryLabel={monthShort}
              tooltipTitle={monthLabel}
              height={280}
              series={[
                { id: 'modis', label: 'MODIS', color: SENSOR_META.modis.color, values: rows.map((r) => r.modis) },
                { id: 'raw', label: 'VIIRS (raw)', color: '#62738f', dashed: true, values: rows.map((r) => r.viirs) },
                { id: 'adj', label: `VIIRS (${selected.short.toLowerCase()})`, color: SENSOR_META.viirs.color, values: rows.map((r) => r.viirsH) },
              ]}
            />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Method comparison" subtitle="Agreement with MODIS for the current region and date window." />
        <DataTable
          caption="Harmonization method comparison"
          rowKey={(r) => r.method.id}
          rows={byMethod}
          columns={[
            {
              key: 'name',
              header: 'Method',
              render: (r) => (
                <span className="flex items-center gap-2">
                  {r.method.name}
                  {r.method.id === filters.method && <Badge tone="cyan">Selected</Badge>}
                </span>
              ),
            },
            { key: 'r', header: 'Correlation', align: 'right', numeric: true, render: (r) => fmtNum(r.metrics.r, 2) },
            { key: 'rmse', header: 'RMSE', align: 'right', numeric: true, render: (r) => fmtInt(r.metrics.rmse) },
            { key: 'bias', header: 'Mean bias', align: 'right', numeric: true, render: (r) => fmtInt(r.metrics.bias) },
            { key: 'biasPct', header: 'Relative bias', align: 'right', numeric: true, render: (r) => fmtSignedPct(r.metrics.biasPct) },
          ]}
        />
        <p className="border-t border-line px-5 py-4 text-xs leading-relaxed text-faint">
          Lower RMSE and bias mean closer agreement, not a more correct measurement. Each method is fitted to the same data it is
          scored on, so these figures are optimistic; evaluate on held-out periods before relying on any of them.
        </p>
      </Card>
    </div>
  );
}
