import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Flame, Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { FilterBar } from './FilterBar';
import { DataNotice } from './DataNotice';

export function AppShell() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // Close the mobile drawer on navigation and scroll to top.
  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="min-h-screen lg:pl-64">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line lg:block">
        <Sidebar />
      </aside>

      {/* Mobile top bar + drawer */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-surface px-4 lg:hidden">
        <div className="flex items-center gap-2.5">
          <Flame size={16} className="text-ember-400" aria-hidden />
          <span className="text-sm font-semibold">Fire Observations</span>
        </div>
        <button type="button" onClick={() => setOpen(true)} aria-label="Open navigation" className="rounded-md p-2 text-muted hover:bg-raised hover:text-ink">
          <Menu size={18} />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" aria-label="Close navigation" className="absolute inset-0 bg-bg/70" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 border-r border-line shadow-pop">
            <Sidebar mobile onClose={() => setOpen(false)} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="z-20 lg:sticky lg:top-0">
        <FilterBar />
      </div>
      <DataNotice />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <footer className="mx-auto max-w-7xl border-t border-line px-4 py-6 text-xs text-faint sm:px-6 lg:px-8">
        MODIS and VIIRS active-fire detections are distributed by NASA FIRMS. This interface is an independent prototype and is
        not affiliated with or endorsed by NASA.
      </footer>
    </div>
  );
}
