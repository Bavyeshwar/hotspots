import { Activity } from 'lucide-react';
import modelResults from '../NASA_FIRMS/model_results.json';
import { fmtInt, fmtNum, fmtPct } from '../lib/format';
import { Card, CardHeader } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { Stat } from '../components/ui/Stat';
import { Badge } from '../components/ui/Badge';
import { DataTable } from '../components/ui/DataTable';

export default function Methods() {
  const { metrics, dataset_size: datasetSize, feature_importance: featureImportance } = modelResults;
  const totalRows = datasetSize.training_rows + datasetSize.testing_rows;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Model results"
        title="Random Forest Regression"
        description={`Evaluation metrics and feature importance for ${modelResults.dataset}.`}
        actions={<Badge tone="cyan">{modelResults.model}</Badge>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Mean absolute error" value={fmtNum(metrics.mae, 2)} hint="Lower is better" />
        <Stat label="Root mean squared error" value={fmtNum(metrics.rmse, 2)} hint="Lower is better" />
        <Stat label="R² score" value={fmtNum(metrics.r2, 3)} hint="Test-set fit; 1.0 is a perfect fit" />
        <Stat
          label="Dataset rows"
          value={fmtInt(totalRows)}
          hint={`${fmtInt(datasetSize.training_rows)} training · ${fmtInt(datasetSize.testing_rows)} testing`}
        />
      </div>

      <Card>
        <CardHeader
          icon={Activity}
          title="Feature importance"
          subtitle={`${featureImportance.length} features, ranked by importance`}
        />
        <DataTable
          caption="Random Forest Regression feature importance"
          rowKey={(row) => row.feature}
          rows={featureImportance}
          columns={[
            { key: 'feature', header: 'Feature' },
            {
              key: 'importance',
              header: 'Importance',
              align: 'right',
              numeric: true,
              render: (row) => fmtPct(row.importance, 3),
            },
          ]}
        />
        <p className="border-t border-line px-5 py-4 text-xs leading-relaxed text-faint">
          Feature importance describes the model&apos;s relative use of each feature; it does not establish cause and effect.
          Error metrics are reported in the target brightness units.
        </p>
      </Card>
    </div>
  );
}
