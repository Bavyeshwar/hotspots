import { Badge } from './Badge';

const TONE_BY_LEVEL = {
  good: 'ok',
  moderate: 'warn',
  limited: 'neutral',
};

export function ReliabilityBadge({ reliability }) {
  return (
    <Badge
      tone={TONE_BY_LEVEL[reliability.level] ?? 'neutral'}
      title={reliability.reason}
      aria-label={`Reliability: ${reliability.label}. ${reliability.reason}`}
    >
      {reliability.label} reliability
    </Badge>
  );
}
