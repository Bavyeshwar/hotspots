const TONES = {
  neutral: 'border-line-strong bg-raised text-muted',
  cyan: 'border-cyan-600/50 bg-cyan-400/10 text-cyan-300',
  ember: 'border-ember-600/50 bg-ember-400/10 text-ember-300',
  ok: 'border-ok/30 bg-ok/10 text-ok',
  warn: 'border-warn/30 bg-warn/10 text-warn',
  danger: 'border-danger/30 bg-danger/10 text-danger',
};

export function Badge({ tone = 'neutral', icon: Icon, className = '', children, ...props }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded border px-2 py-0.5 text-xs font-medium ${TONES[tone]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={12} strokeWidth={2} aria-hidden />}
      {children}
    </span>
  );
}

/** Small colored dot + label used wherever a sensor is named. */
export function SensorKey({ sensor, className = '' }) {
  const dot = sensor === 'modis' ? 'bg-cyan-400' : 'bg-ember-400';
  const label = sensor === 'modis' ? 'MODIS' : 'VIIRS';
  return (
    <span className={`inline-flex items-center gap-2 text-xs text-muted ${className}`}>
      <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden />
      {label}
    </span>
  );
}
