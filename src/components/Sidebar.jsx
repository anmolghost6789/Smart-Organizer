import React from 'react';
import {
  LayoutDashboard,
  Files,
  FolderKanban,
  Copy,
  HardDrive,
  History,
  Settings,
  Sparkles,
  Zap,
  FolderTree
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, tag: 'overview' },
  { id: 'files', label: 'All Files', icon: Files, tag: 'browse' },
  { id: 'categories', label: 'Categories', icon: FolderKanban, tag: '21 folders' },
  { id: 'duplicates', label: 'Duplicate Finder', icon: Copy, badgeKey: 'duplicateFilesDetected' },
  { id: 'storage', label: 'Storage Analysis', icon: HardDrive, tag: 'inspect' },
  { id: 'history', label: 'Audit & Rollback', icon: History, tag: 'undo' },
  { id: 'settings', label: 'Preferences', icon: Settings, tag: 'rules' },
];

export function Sidebar({ currentTab, setTab, stats }) {
  return (
    <aside className="w-64 flex-shrink-0 bg-white/70 dark:bg-surface-dark-card/80 backdrop-blur-xl border-r border-black/[0.05] dark:border-white/[0.06] flex flex-col justify-between select-none z-20">
      <div>
        {/* App Branding Header */}
        <div className="p-5 flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 via-pink-400 to-amber-300 p-0.5 shadow-soft hover:rotate-6 transition-transform duration-300">
              <div className="w-full h-full bg-white dark:bg-surface-dark-card rounded-[14px] flex items-center justify-center text-purple-600 dark:text-purple-400">
                <FolderTree className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white font-display">
                  Smart Organizer
                </h1>
              </div>
              <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <span>offline sanctuary</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="p-3">
          <div className="px-3 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400/80 dark:text-slate-500 font-display">
            Workspace
          </div>

          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              const badgeValue = item.badgeKey && stats ? stats[item.badgeKey] : null;

              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`w-full group flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 btn-bounce ${
                    isActive
                      ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 shadow-soft-sm border border-purple-200/60 dark:border-purple-800/40'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-purple-200/60 dark:bg-purple-800/50 text-purple-700 dark:text-purple-200'
                        : 'bg-slate-100 dark:bg-white/[0.05] text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                    }`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="tracking-tight">{item.label}</span>
                  </div>

                  {badgeValue > 0 ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-400 text-amber-950 shadow-soft-sm animate-bounce">
                      {badgeValue}
                    </span>
                  ) : item.tag && !isActive ? (
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.tag}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Retro-Chic Local Sanctuary Footer */}
      <div className="p-4 border-t border-black/[0.04] dark:border-white/[0.05]">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-50/70 via-pink-50/40 to-amber-50/50 dark:from-purple-950/20 dark:via-pink-950/10 dark:to-amber-950/10 border border-purple-200/50 dark:border-purple-800/30 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-purple-700 dark:text-purple-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>100% Air-Gapped</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-white/80 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-semibold">
              v1.2
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Zero cloud telemetries. All hashes &amp; operations stay safe on this machine.
          </p>
        </div>
      </div>
    </aside>
  );
}
