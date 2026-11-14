export function Card({ as: Tag = 'section', className = '', children }) {
  return <Tag className={`rounded-lg border border-line bg-surface shadow-card ${className}`}>{children}</Tag>;
}

export function CardHeader({ title, subtitle, icon: Icon, action }) {
  return (
    <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
      <div className="flex min-w-0 items-start gap-3">
        {Icon && <Icon size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-faint" aria-hidden />}
        <div className="min-w-0">
          <h2 className="text-sm text-ink">{title}</h2>
          {subtitle && <p className="mt-1 text-xs text-muted">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

export function CardBody({ className = '', children }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}
