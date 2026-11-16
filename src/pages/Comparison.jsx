import { Activity, CalendarDays, Crosshair } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { METHOD_BY_ID } from '../data/methods';
import { SENSOR_META } from '../lib/theme';
import { fmtInt, fmtNum, fmtSignedPct, MONTH_NAMES, monthLabel, monthShort } from '../lib/format';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { Stat } from '../components/ui/Stat';
import { ReliabilityBadge } from '../components/ui/ReliabilityBadge';
import { SensorKey } from '../components/ui/Badge';
import { DataTable } from '../components/ui/DataTable';
import { LineChart } from '../components/charts/LineChart';
import { BarChart } from '../components/charts/BarChart';
import { ScatterChart } from '../components/charts/ScatterChart';

export default function Comparison() {
  const { filters, regionInfo, rows, metrics, seasonalMeans, reliability } = useDashboard();
  const method = METHOD_BY_ID[filters.method];

  const monthly = rows.map((r) => ({ month: r.month, x: r.modis, y: r.viirsH }));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Sensor comparison"
        title="MODIS and VIIRS"
        description={`${regionInfo.name}, ${monthLabel(filters.start)} to ${monthLabel(filters.end)}. VIIRS adjusted with “${method.name}”.`}
        actions={<ReliabilityBadge reliability={reliability} />}
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Stat label="Correlation (r)" value={fmtNum(metrics.r, 2)} hint="Pearson, monthly counts" />
        <Stat label="RMSE" value={fmtInt(metrics.rmse)} hint="Detections per month" />
        <Stat label="Mean bias" value={fmtInt(metrics.bias)} hint="VIIRS minus MODIS, per month" />
        <Stat label="Relative bias" value={fmtSignedPct(metrics.biasPct)} hint="Relative to MODIS mean" />
      </div>

      <Card>
        <CardHeader icon={Activity} title="Monthly time series" subtitle="Hover to read both sensors for a month." />
        <CardBody>
          <LineChart
            ariaLabel="Monthly detections by sensor"
            categories={rows.map((r) => r.month)}
            categoryLabel={monthShort}
            tooltipTitle={monthLabel}
            height={300}
            series={[
              { id: 'modis', label: 'MODIS', color: SENSOR_META.modis.color, values: rows.map((r) => r.modis) },
              { id: 'viirs', label: `VIIRS (model)`, color: SENSOR_META.viirs.color, values: rows.map((r) => r.viirsH) },
              ...(filters.method !== 'none'
                ? [{ id: 'raw', label: 'VIIRS (raw)', color: '#62738f', dashed: true, values: rows.map((r) => r.viirs) }]
                : []),
            ]}
          />
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader icon={Crosshair} title="Agreement" subtitle="One point per month. Points on the dashed line agree exactly." />
          <CardBody>
            <ScatterChart points={monthly} xLabel="MODIS" yLabel="VIIRS" color={SENSOR_META.viirs.color} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader icon={CalendarDays} title="Seasonal cycle" subtitle="Mean detections by calendar month across the window." />
          <CardBody>
            <BarChart
              ariaLabel="Mean detections by calendar month"
              categories={MONTH_NAMES}
              series={[
                { id: 'modis', label: 'MODIS', color: SENSOR_META.modis.color, values: seasonalMeans.map((s) => s.modis ?? 0) },
                { id: 'viirs', label: 'VIIRS', color: SENSOR_META.viirs.color, values: seasonalMeans.map((s) => s.viirsH ?? 0) },
              ]}
            />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Sensor characteristics" subtitle="Why raw counts differ." />
        <DataTable
          caption="MODIS and VIIRS characteristics"
          rowKey={(r) => r.id}
          rows={Object.values(SENSOR_META)}
          columns={[
            { key: 'name', header: 'Sensor', render: (r) => <SensorKey sensor={r.id} className="text-ink" /> },
            { key: 'platforms', header: 'Platforms' },
            { key: 'resolution', header: 'Active-fire resolution' },
            { key: 'product', header: 'Product family' },
          ]}
        />
      </Card>
    </div>
  );
}
