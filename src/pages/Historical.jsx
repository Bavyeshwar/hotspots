import { BarChart3, CalendarRange, Table2 } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { METHOD_BY_ID } from '../data/methods';
import { SENSOR_META } from '../lib/theme';
import { fmtInt, fmtSignedPct, monthLabel } from '../lib/format';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { Badge } from '../components/ui/Badge';
import { DataTable } from '../components/ui/DataTable';
import { BarChart } from '../components/charts/BarChart';
import { LineChart } from '../components/charts/LineChart';

export default function Historical() {
  const { filters, regionInfo, yearly, history } = useDashboard();
  const method = METHOD_BY_ID[filters.method];
  const partial = yearly.filter((y) => y.months < 12).map((y) => y.year);

  const tableRows = yearly.map((y, i) => {
    const prev = yearly[i - 1];
    return { ...y, change: prev && prev.months === 12 && y.months === 12 ? y.modis / prev.modis - 1 : null };
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Historical activity"
        title="Full-record fire activity"
        description={`${regionInfo.name}, ${monthLabel(history[0]?.month ?? filters.start)} to ${monthLabel(history[history.length - 1]?.month ?? filters.end)}. Region and harmonization filters apply; the date filter does not.`}
      />

      <Card>
        <CardHeader icon={BarChart3} title="Annual detections" subtitle={`VIIRS shown with “${method.name}” harmonization.`} />
        <CardBody>
          <BarChart
            ariaLabel="Annual detections by sensor"
            categories={yearly.map((y) => y.year)}
            partial={partial}
            series={[
              { id: 'modis', label: 'MODIS', color: SENSOR_META.modis.color, values: yearly.map((y) => y.modis) },
              { id: 'viirs', label: 'VIIRS', color: SENSOR_META.viirs.color, values: yearly.map((y) => y.viirsH) },
            ]}
            height={300}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader icon={CalendarRange} title="Monthly record" subtitle="Seasonal peaks and year-to-year variability." />
        <CardBody>
          <LineChart
            ariaLabel="Full monthly record"
            categories={history.map((r) => r.month)}
            categoryLabel={(m) => m.slice(0, 4)}
            tooltipTitle={monthLabel}
            height={280}
            series={[
              { id: 'modis', label: 'MODIS', color: SENSOR_META.modis.color, values: history.map((r) => r.modis) },
              { id: 'viirs', label: 'VIIRS', color: SENSOR_META.viirs.color, values: history.map((r) => r.viirsH) },
            ]}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader icon={Table2} title="Annual totals" subtitle="Year-over-year change is shown only between complete years." />
        <DataTable
          caption="Annual totals"
          rowKey={(r) => r.year}
          rows={tableRows}
          columns={[
            { key: 'year', header: 'Year', numeric: true },
            { key: 'modis', header: 'MODIS', align: 'right', numeric: true, render: (r) => fmtInt(r.modis) },
            { key: 'viirsH', header: 'VIIRS', align: 'right', numeric: true, render: (r) => fmtInt(r.viirsH) },
            {
              key: 'change',
              header: 'MODIS change',
              align: 'right',
              numeric: true,
              render: (r) => (r.change == null ? <span className="text-faint">—</span> : fmtSignedPct(r.change)),
            },
            {
              key: 'months',
              header: 'Coverage',
              align: 'right',
              render: (r) => <Badge tone={r.months === 12 ? 'neutral' : 'warn'}>{r.months} months</Badge>,
            },
          ]}
        />
      </Card>
    </div>
  );
}
