import React from 'react';
import { Sun, Moon, Play, FolderCheck, RefreshCw, FolderOpen } from 'lucide-react';

export function Header({
  currentTabTitle,
  theme,
  setTheme,
  scanPath,
  setScanPath,
  onStartScan,
  onOpenOrganizeModal,
  scanStatus,
  stats
}) {
  return (
    <header className="h-16 px-6 border-b border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md flex items-center justify-between z-10">
      <div className="flex items-center gap-4">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">{currentTabTitle}</h2>
        {scanStatus === 'scanning' && (
          <span className="flex items-center gap-2 px-2.5 py-1 text-xs font-medium text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 rounded-full border border-sky-200/50 dark:border-sky-500/20 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Scanning in progress...
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Target Folder Input */}
        <div className="relative flex items-center">
          <input
            type="text"
            value={scanPath}
            onChange={(e) => setScanPath(e.target.value)}
            placeholder="Folder path to scan (e.g. D:\Downloads)"
            className="w-72 pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
          />
          <FolderOpen className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
        </div>

        {/* Quick Scan Button */}
        <button
          onClick={onStartScan}
          disabled={scanStatus === 'scanning' || !scanPath}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white shadow-sm shadow-sky-600/20 transition-all active:scale-95"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Quick Scan</span>
        </button>

        {/* Organize Button */}
        <button
          onClick={onOpenOrganizeModal}
          disabled={!stats || stats.totalFilesScanned === 0 || scanStatus === 'scanning'}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 disabled:opacity-40 transition-all active:scale-95"
        >
          <FolderCheck className="w-3.5 h-3.5" />
          <span>Organize Files</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100 dark:bg-slate-800 transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
