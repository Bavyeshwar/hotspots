const VARIANTS = {
  primary: 'bg-cyan-500 text-bg hover:bg-cyan-400 border border-transparent',
  secondary: 'bg-raised text-ink border border-line-strong hover:border-faint',
  ghost: 'bg-transparent text-muted border border-transparent hover:bg-raised hover:text-ink',
};

const SIZES = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
};

export function Button({ variant = 'secondary', size = 'md', icon: Icon, className = '', children, ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={14} strokeWidth={1.75} aria-hidden />}
      {children}
    </button>
  );
}
