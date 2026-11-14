import React from 'react';
import {
  LayoutDashboard,
  Files,
  FolderKanban,
  Copy,
  HardDrive,
  History,
  Settings,
  ShieldCheck,
  FolderTree
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'files', label: 'All Files', icon: Files },
  { id: 'categories', label: 'Categories', icon: FolderKanban },
  { id: 'duplicates', label: 'Duplicate Finder', icon: Copy, badgeKey: 'duplicateFilesDetected' },
  { id: 'storage', label: 'Storage Analysis', icon: HardDrive },
  { id: 'history', label: 'Scan History', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ currentTab, setTab, stats }) {
  return (
    <aside className="w-64 flex-shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between select-none">
      <div>
        {/* App Branding */}
        <div className="p-5 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">Smart Organizer</h1>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Desktop & Mobile Engine</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            const badgeValue = item.badgeKey && stats ? stats[item.badgeKey] : null;

            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 shadow-sm border border-sky-100 dark:border-sky-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {badgeValue > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    {badgeValue}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Local & Privacy Badge */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/80">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Local & Private</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Zero cloud uploads. All cryptographic hashes and metadata stay on this device.
          </p>
        </div>
      </div>
    </aside>
  );
}
