import { NavLink } from 'react-router-dom';
import { Activity, Flame, GitCompare, History, LayoutDashboard, ShieldCheck, X } from 'lucide-react';

export const NAV = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/comparison', label: 'Sensor comparison', icon: GitCompare },
  { to: '/history', label: 'Historical activity', icon: History },
  { to: '/methods', label: 'Model Results', icon: Activity },
  { to: '/quality', label: 'Data quality', icon: ShieldCheck },
];

export function Sidebar({ onNavigate, onClose, mobile = false }) {
  return (
    <nav aria-label="Primary" className="flex h-full flex-col bg-surface z-[500]">
      <div className="flex h-16 items-center justify-between border-b border-line px-5">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-md border border-line-strong bg-raised text-ember-400">
            <Flame size={16} strokeWidth={1.75} aria-hidden />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-ink">Fire Observations</p>
            <p className="text-xs text-faint">MODIS · VIIRS</p>
          </div>
        </div>
        {mobile && (
          <button type="button" onClick={onClose} aria-label="Close navigation" className="rounded-md p-1.5 text-muted hover:bg-raised hover:text-ink">
            <X size={18} />
          </button>
        )}
      </div>

      <ul className="flex-1 space-y-1 p-3">
        {NAV.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/'}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex h-10 items-center gap-3 rounded-md px-3 text-sm transition-colors ${
                  isActive ? 'bg-raised text-ink' : 'text-muted hover:bg-raised/60 hover:text-ink'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} strokeWidth={1.75} className={isActive ? 'text-cyan-400' : 'text-faint'} aria-hidden />
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="border-t border-line p-5">
        <p className="eyebrow mb-2">Reference</p>
        <a
          href="https://firms.modaps.eosdis.nasa.gov/"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-muted underline decoration-line-strong underline-offset-4 hover:text-ink"
        >
          NASA FIRMS (official source)
        </a>
      </div>
    </nav>
  );
}
