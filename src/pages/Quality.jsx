import { Gauge, Layers, ListChecks } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { SENSOR_META } from '../lib/theme';
import { fmtNum, fmtPct, monthLabel, monthShort } from '../lib/format';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { Stat } from '../components/ui/Stat';
import { SensorKey } from '../components/ui/Badge';
import { ConfidenceBar } from '../components/ui/ConfidenceBar';
import { ReliabilityBadge } from '../components/ui/ReliabilityBadge';
import { DataTable } from '../components/ui/DataTable';
import { LineChart } from '../components/charts/LineChart';

const CONVENTIONS = [
  {
    sensor: 'modis',
    scheme: 'Numeric detection confidence, 0 to 100%',
    classes: 'Commonly binned: low below 30%, nominal 30 to 80%, high above 80%',
  },
  {
    sensor: 'viirs',
    scheme: 'Categorical detection confidence (375 m product)',
    classes: 'Low, nominal, high',
  },
];

export default function Quality() {
  const { filters, regionInfo, rows, quality, metrics, reliability } = useDashboard();
  const months = rows.length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Data quality"
        title="Confidence and coverage"
        description={`${regionInfo.name}, ${monthLabel(filters.start)} to ${monthLabel(filters.end)}. Figures are weighted by detection count.`}
        actions={<ReliabilityBadge reliability={reliability} />}
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Stat label="Months selected" value={String(months)} hint={months < 12 ? 'Under 12: limited reliability' : 'At least 12'} />
        <Stat label="Sensor correlation" value={fmtNum(metrics.r, 2)} hint="Monthly counts" />
        <Stat label="MODIS coverage" accent="cyan" value={fmtPct(quality.modis?.coverage)} hint="Simulated valid-observation share" />
        <Stat label="VIIRS coverage" accent="ember" value={fmtPct(quality.viirs?.coverage)} hint="Simulated valid-observation share" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {['modis', 'viirs'].map((s) => (
          <Card key={s}>
            <CardHeader
              icon={Layers}
              title={`${SENSOR_META[s].name} detection confidence`}
              subtitle={`${SENSOR_META[s].resolution} · ${SENSOR_META[s].platforms}`}
            />
            <CardBody>
              <ConfidenceBar q={quality[s]} />
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader icon={Gauge} title="Quality over time" subtitle="High-confidence share and observation coverage by month." />
        <CardBody>
          <LineChart
            ariaLabel="High-confidence share and coverage by month"
            categories={rows.map((r) => r.month)}
            categoryLabel={monthShort}
            tooltipTitle={monthLabel}
            valueFormat={(v) => fmtPct(v)}
            tooltipFormat={(v) => fmtPct(v, 1)}
            yMax={1}
            height={280}
            series={[
              { id: 'mh', label: 'MODIS high-confidence', color: SENSOR_META.modis.color, values: rows.map((r) => r.q.modis.high) },
              { id: 'vh', label: 'VIIRS high-confidence', color: SENSOR_META.viirs.color, values: rows.map((r) => r.q.viirs.high) },
              { id: 'mc', label: 'MODIS coverage', color: SENSOR_META.modis.color, dashed: true, values: rows.map((r) => r.q.modis.coverage) },
              { id: 'vc', label: 'VIIRS coverage', color: SENSOR_META.viirs.color, dashed: true, values: rows.map((r) => r.q.viirs.coverage) },
            ]}
          />
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader icon={ListChecks} title="Confidence conventions" subtitle="How each sensor's product expresses confidence." />
          <DataTable
            caption="Confidence conventions"
            rowKey={(r) => r.sensor}
            rows={CONVENTIONS}
            columns={[
              { key: 'sensor', header: 'Sensor', render: (r) => <SensorKey sensor={r.sensor} className="text-ink" /> },
              { key: 'scheme', header: 'Scheme' },
              { key: 'classes', header: 'Classes' },
            ]}
          />
        </Card>
        <Card>
          <CardHeader title="How to read these indicators" />
          <CardBody className="space-y-3 text-sm leading-relaxed text-muted">
            <p>
              <span className="text-ink">Reliability badge.</span> A transparent rule, not a statistical test: Limited with fewer than
              12 months selected, Moderate when sensor correlation is below 0.80, otherwise Good.
            </p>
            <p>
              <span className="text-ink">Confidence</span> describes how certain the algorithm is that a pixel contains fire. It is not a
              measure of how many fires were missed.
            </p>
            <p>
              <span className="text-ink">Coverage</span> here is a simulated stand-in for the share of valid observations (for example,
              not obscured by cloud). With real data, derive it from the product&apos;s own quality information.
            </p>
            <p>
              <span className="text-ink">Detections are not area burned.</span> Counts depend on overpass timing, resolution and cloud
              cover.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
