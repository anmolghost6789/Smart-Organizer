import React from 'react';
import {
  Files,
  HardDrive,
  FolderCheck,
  Copy,
  Sparkles,
  Clock,
  ArrowRight,
  FolderOpen,
  Play,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export function DashboardView({
  stats,
  categories,
  onStartScan,
  onOpenOrganizeModal,
  setTab,
  scanPath,
  setScanPath,
  scanStatus,
  scanProgress
}) {
  const statCards = [
    {
      title: 'Total Files Scanned',
      value: stats?.totalFilesScanned?.toLocaleString() || '0',
      icon: Files,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      title: 'Storage Analyzed',
      value: stats?.formattedStorage || '0 B',
      icon: HardDrive,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10'
    },
    {
      title: 'Organized Files',
      value: stats?.totalOrganizedFiles?.toLocaleString() || '0',
      icon: FolderCheck,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    {
      title: 'Duplicates Detected',
      value: stats?.duplicateFilesDetected?.toLocaleString() || '0',
      icon: Copy,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10'
    },
    {
      title: 'Potential Storage Savings',
      value: stats?.formattedSavings || '0 B',
      icon: Sparkles,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    {
      title: 'Last Scan',
      value: stats?.lastScanTime ? new Date(stats.lastScanTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never',
      icon: Clock,
      color: 'text-slate-500',
      bg: 'bg-slate-500/10'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Active Scan Progress Banner */}
      {scanStatus === 'scanning' && scanProgress && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-500/30 shadow-lg shadow-sky-500/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400">
                <Play className="w-4 h-4 fill-current animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Scanning Folder</h4>
                <p className="text-xs text-slate-500 truncate max-w-lg">{scanProgress.currentFile || 'Indexing directory...'}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400">{scanProgress.percent || 0}%</span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-sky-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${scanProgress.percent || 0}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2 font-mono">
            <span>{scanProgress.processedFiles?.toLocaleString()} files scanned</span>
            <span>{Math.round((scanProgress.processedBytes || 0) / 1024 / 1024)} MB processed</span>
          </div>
        </div>
      )}

      {/* Hero Welcome & Quick Scanner */}
      <div className="p-7 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-sky-500/10 to-transparent pointer-events-none" />

        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-medium backdrop-blur-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
            <span>Universal Smart File Organizer v1.0</span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight">
            Effortless, local-first file intelligence for your device.
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            Automatically scans magic byte signatures, isolates exact and visual duplicates, extracts photo & document metadata, and structures messy downloads into clean, pristine directories.
          </p>

          {/* Quick Target Input & Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[260px] relative">
              <input
                type="text"
                value={scanPath}
                onChange={(e) => setScanPath(e.target.value)}
                placeholder="Enter folder path (e.g. D:\Downloads or C:\Users\YourUser\Pictures)"
                className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl bg-white/10 border border-white/15 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 backdrop-blur-sm font-mono"
              />
              <FolderOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>

            <button
              onClick={onStartScan}
              disabled={scanStatus === 'scanning' || !scanPath}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/25 transition-all active:scale-95 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Scan</span>
            </button>

            <button
              onClick={onOpenOrganizeModal}
              disabled={!stats || stats.totalFilesScanned === 0}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl bg-white hover:bg-slate-100 text-slate-900 transition-all active:scale-95 disabled:opacity-50"
            >
              <FolderCheck className="w-3.5 h-3.5" />
              <span>Organize Files</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{card.title}</span>
                <div className={`w-7 h-7 rounded-lg ${card.bg} flex items-center justify-center ${card.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-lg font-bold tracking-tight text-slate-900 dark:text-white truncate">
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Storage Savings & Duplicates Highlight Banner */}
      {stats?.potentialSavingsBytes > 0 && (
        <div className="p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                Storage Optimization Opportunity: {stats.formattedSavings}
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Found {stats.duplicateFilesDetected} redundant duplicate files. You can safely review and reclaim this space.
              </p>
            </div>
          </div>
          <button
            onClick={() => setTab('duplicates')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-all"
          >
            <span>Review Duplicates</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Category Breakdown Preview */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Detected Category Distribution</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">File counts across 21 standardized organization categories</p>
          </div>
          <button
            onClick={() => setTab('categories')}
            className="text-xs font-medium text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {categories.slice(0, 14).map((cat) => (
            <div
              key={cat.key}
              onClick={() => setTab('files')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/80 hover:border-sky-300 dark:hover:border-sky-500/50 cursor-pointer transition-colors"
            >
              <div className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{cat.name}</div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-sm font-bold text-slate-900 dark:text-white">{cat.fileCount}</span>
                <span className="text-[10px] text-slate-400">{cat.formattedSize}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
