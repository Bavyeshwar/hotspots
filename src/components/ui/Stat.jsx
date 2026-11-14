import { Card } from './Card';

const ACCENT = {
  none: '',
  cyan: 'before:bg-cyan-400',
  ember: 'before:bg-ember-400',
};

export function Stat({ label, value, hint, accent = 'none', children }) {
  return (
    <Card
      className={`relative overflow-hidden p-5 ${
        accent !== 'none' ? `before:absolute before:left-0 before:top-0 before:h-full before:w-0.5 ${ACCENT[accent]}` : ''
      }`}
    >
      <p className="eyebrow">{label}</p>
      <p className="num mt-2 text-2xl font-medium text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {children}
    </Card>
  );
}
