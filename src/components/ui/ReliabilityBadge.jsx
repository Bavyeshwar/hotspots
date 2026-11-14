import { CircleCheck, CircleAlert, TriangleAlert } from 'lucide-react';
import { Badge } from './Badge';

const MAP = {
  good: { tone: 'ok', icon: CircleCheck },
  moderate: { tone: 'warn', icon: CircleAlert },
  limited: { tone: 'danger', icon: TriangleAlert },
};

export function ReliabilityBadge({ reliability }) {
  const { tone, icon } = MAP[reliability.level];
  return (
    <Badge tone={tone} icon={icon} title={reliability.reason}>
      Reliability: {reliability.label}
    </Badge>
  );
}
