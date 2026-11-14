import { FlaskConical } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

/** Persistent, non-dismissible notice whenever the dataset is synthetic. */
export function DataNotice() {
  const { dataset } = useDashboard();
  if (!dataset.synthetic) return null;
  return (
    <div role="note" className="flex items-start gap-3 border-b border-warn/25 bg-warn/5 px-4 py-2.5 text-xs text-warn sm:px-6 lg:px-8">
      <FlaskConical size={14} className="mt-0.5 shrink-0" aria-hidden />
      <p className="max-w-5xl leading-relaxed">
        <span className="font-semibold">Synthetic sample data.</span>{' '}
        <span className="text-warn/80">
          Every count, location and quality figure here was generated locally to demonstrate the interface. These are not NASA
          observations and should not be cited. Use NASA FIRMS for real fire detections.
        </span>
      </p>
    </div>
  );
}
