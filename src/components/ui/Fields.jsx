import { useId } from 'react';
import { ChevronDown } from 'lucide-react';

export function Field({ label, htmlFor, className = '', children }) {
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="eyebrow">
        {label}
      </label>
      {children}
    </div>
  );
}

export function SelectField({ label, value, onChange, options, className = '' }) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id} className={className}>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="control w-full appearance-none pr-9"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-faint"
          aria-hidden
        />
      </div>
    </Field>
  );
}

export function MonthField({ label, value, onChange, min, max, className = '' }) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id} className={className}>
      <input
        id={id}
        type="month"
        value={value}
        min={min}
        max={max}
        onChange={(e) => e.target.value && onChange(e.target.value)}
        className="control w-full"
      />
    </Field>
  );
}

/** Pill-style toggle group. `value` is the selected id. */
export function Segmented({ label, options, value, onChange }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-md border border-line-strong bg-raised p-0.5">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`h-7 rounded px-3 text-xs font-medium transition-colors ${
              active ? 'bg-surface text-ink shadow-card' : 'text-muted hover:text-ink'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Checkbox-style chip for toggling a sensor layer on/off. */
export function ToggleChip({ checked, onChange, color, children }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`inline-flex h-8 items-center gap-2 rounded-md border px-3 text-xs font-medium transition-colors ${
        checked ? 'border-line-strong bg-raised text-ink' : 'border-line text-faint hover:text-muted'
      }`}
    >
      <span
        className="h-2 w-2 rounded-full transition-opacity"
        style={{ background: color, opacity: checked ? 1 : 0.3 }}
        aria-hidden
      />
      {children}
    </button>
  );
}
