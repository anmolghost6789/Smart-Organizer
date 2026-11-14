import React from 'react';
import {
  Sun,
  Moon,
  Play,
  FolderCheck,
  RefreshCw,
  FolderOpen,
  Globe,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

export function Header({
  currentTabTitle,
  theme,
  setTheme,
  scanPath,
  setScanPath,
  onStartScan,
  onOpenOrganizeModal,
  onOpenLanding,
  scanStatus,
  stats,
  updateAvailable
}) {
  return (
    <header className="h-16 px-6 border-b border-black/[0.05] dark:border-white/[0.06] bg-white/60 dark:bg-surface-dark-card/60 backdrop-blur-xl flex items-center justify-between z-10 select-none">
      <div className="flex items-center gap-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white font-display tracking-tight flex items-center gap-2">
          <span>{currentTabTitle}</span>
        </h2>

        {scanStatus === 'scanning' && (
          <span className="flex items-center gap-2 px-3 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 rounded-full border border-purple-200/80 dark:border-purple-800/40 shadow-soft-sm">
            <RefreshCw className="w-3 h-3 animate-spin text-purple-600 dark:text-purple-400" />
            <span>Scanning vault...</span>
          </span>
        )}

        {updateAvailable && (
          <button
            onClick={onOpenLanding}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-100/90 dark:bg-amber-950/40 rounded-full border border-amber-300/80 dark:border-amber-700/50 hover:scale-105 transition-transform"
          >
            <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
            <span>Update v1.2.0 Available</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        {/* Switch to Public Portal & Downloads */}
        <button
          onClick={onOpenLanding}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-300 bg-slate-100/80 dark:bg-white/[0.05] hover:bg-purple-50 dark:hover:bg-purple-950/30 rounded-2xl border border-black/[0.04] dark:border-white/[0.06] transition-all btn-bounce"
        >
          <Globe className="w-3.5 h-3.5 text-purple-500" />
          <span>Product Website</span>
          <ArrowUpRight className="w-3 h-3 text-slate-400" />
        </button>

        {/* Target Folder Pill Input */}
        <div className="relative flex items-center">
          <input
            type="text"
            value={scanPath}
            onChange={(e) => setScanPath(e.target.value)}
            placeholder="Folder to tidy (e.g. D:\Downloads)"
            className="w-64 pl-8 pr-3 py-1.5 text-xs rounded-2xl bg-slate-100/80 dark:bg-white/[0.05] border border-black/[0.05] dark:border-white/[0.08] text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40 dark:focus:ring-purple-500/40 transition-all font-mono"
          />
          <FolderOpen className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
        </div>

        {/* Quick Scan Action Button */}
        <button
          onClick={onStartScan}
          disabled={scanStatus === 'scanning' || !scanPath}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-2xl bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white shadow-soft hover:shadow-soft-lg transition-all btn-bounce"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Quick Scan</span>
        </button>

        {/* Organize Button */}
        <button
          onClick={onOpenOrganizeModal}
          disabled={!stats || stats.totalFilesScanned === 0 || scanStatus === 'scanning'}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 disabled:opacity-40 shadow-soft transition-all btn-bounce"
        >
          <FolderCheck className="w-3.5 h-3.5" />
          <span>Organize</span>
        </button>

        {/* Theme Toggle Pill */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-2xl text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-300 bg-slate-100/80 dark:bg-white/[0.05] border border-black/[0.04] dark:border-white/[0.06] transition-all btn-bounce"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-600" />}
        </button>
      </div>
    </header>
  );
}
