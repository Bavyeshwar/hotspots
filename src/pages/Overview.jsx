import { Map as MapIcon, TrendingUp, Table2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDashboard } from '../context/DashboardContext';
import { METHOD_BY_ID } from '../data/methods';
import { SENSOR_META } from '../lib/theme';
import { fmtInt, fmtNum, fmtPct, monthLabel, monthShort } from '../lib/format';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { Stat } from '../components/ui/Stat';
import { Badge } from '../components/ui/Badge';
import { ToggleChip } from '../components/ui/Fields';
import { DataTable } from '../components/ui/DataTable';
import { FireMap } from '../components/map/FireMap';
import { LineChart } from '../components/charts/LineChart';

export default function Overview() {
  const { filters, regionInfo, rows, metrics, quality, points, sensors, toggleSensor, regionSummary } = useDashboard();
  const method = METHOD_BY_ID[filters.method];

  const totalModis = rows.reduce((s, r) => s + r.modis, 0);
  const totalViirsH = rows.reduce((s, r) => s + r.viirsH, 0);

  const mapBox = regionInfo.bbox;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Overview"
        title="Active fire detections"
        description={`NASA FIRMS detections for ${regionInfo.name}, ${monthLabel(filters.start)} to ${monthLabel(filters.end)}.`}
        actions=""
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="MODIS detections" accent="cyan" value={fmtInt(totalModis)} hint={`${SENSOR_META.modis.resolution} · ${SENSOR_META.modis.platforms}`} />
        <Stat
          label="VIIRS detections"
          accent="ember"
          value={fmtInt(totalViirsH)}
          hint={filters.method === 'none' ? `${SENSOR_META.viirs.resolution} · raw` : `${SENSOR_META.viirs.resolution} · harmonized`}
        />
        <Stat label="Sensor correlation (r)" value={fmtNum(metrics.r, 2)} hint={`Monthly counts, ${metrics.n} months`} />
        <Stat label="High-confidence share" value={`${fmtPct(quality.modis?.high)} / ${fmtPct(quality.viirs?.high)}`} hint="MODIS / VIIRS" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            icon={MapIcon}
            title="Geographic fire activity"
            subtitle={`${fmtInt(points.length)} sample detections plotted. Hover a point for details.`}
            action={
              <div className="flex gap-2">
                <ToggleChip checked={sensors.modis} onChange={() => toggleSensor('modis')} color={SENSOR_META.modis.color}>
                  MODIS
                </ToggleChip>
                <ToggleChip checked={sensors.viirs} onChange={() => toggleSensor('viirs')} color={SENSOR_META.viirs.color}>
                  VIIRS
                </ToggleChip>
              </div>
            }
          />
          <CardBody>
            <FireMap points={points} bbox={mapBox} regionId={regionInfo.id} />
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full border border-cyan-400" aria-hidden /> MODIS (larger footprint)
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-ember-400" aria-hidden /> VIIRS (finer footprint)
              </span>
              <span className="text-faint">Graticule only; no coastline basemap is bundled.</span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader icon={TrendingUp} title="Monthly counts" subtitle="Selected window" />
          <CardBody>
            <LineChart
              ariaLabel="Monthly MODIS and VIIRS counts"
              categories={rows.map((r) => r.month)}
              categoryLabel={monthShort}
              tooltipTitle={monthLabel}
              height={300}
              series={[
                { id: 'modis', label: 'MODIS', color: SENSOR_META.modis.color, values: rows.map((r) => r.modis) },
                { id: 'viirs', label: 'VIIRS', color: SENSOR_META.viirs.color, values: rows.map((r) => r.viirsH) },
              ]}
            />
            <p className="mt-4 text-xs leading-relaxed text-faint">
              Compare sensors in detail on the <Link to="/comparison" className="text-cyan-400 hover:underline">comparison page</Link>.
            </p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader icon={Table2} title="Regional summary" subtitle="Same date window and harmonization as above." />
        <DataTable
          caption="Detections by region"
          rowKey={(r) => r.region.id}
          rows={regionSummary}
          columns={[
            { key: 'name', header: 'Region', render: (r) => r.region.name },
            { key: 'modis', header: 'MODIS', align: 'right', numeric: true, render: (r) => fmtInt(r.modis) },
            { key: 'viirs', header: 'VIIRS', align: 'right', numeric: true, render: (r) => fmtInt(r.viirsH) },
            { key: 'r', header: 'Correlation', align: 'right', numeric: true, render: (r) => fmtNum(r.metrics.r, 2) },
            {
              key: 'share',
              header: 'Share of MODIS total',
              align: 'right',
              render: (r) => <Badge tone="neutral">{fmtPct(r.modis / Math.max(1, regionSummary.reduce((s, x) => s + x.modis, 0)))}</Badge>,
            },
          ]}
        />
      </Card>
    </div>
  );
}
