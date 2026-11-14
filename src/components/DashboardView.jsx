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
  Zap,
  ShieldCheck,
  Heart
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
      title: 'Files Scanned',
      value: stats?.totalFilesScanned?.toLocaleString() || '0',
      icon: Files,
      cardBg: 'bg-pastel-sky-50/80 dark:bg-sky-950/20 border-pastel-sky-200/60 dark:border-sky-800/30',
      badgeBg: 'bg-sky-200/60 dark:bg-sky-800/50 text-sky-800 dark:text-sky-200',
      tag: 'total vault'
    },
    {
      title: 'Storage Analyzed',
      value: stats?.formattedStorage || '0 B',
      icon: HardDrive,
      cardBg: 'bg-pastel-lavender-50/80 dark:bg-purple-950/20 border-pastel-lavender-200/60 dark:border-purple-800/30',
      badgeBg: 'bg-purple-200/60 dark:bg-purple-800/50 text-purple-800 dark:text-purple-200',
      tag: 'disk space'
    },
    {
      title: 'Organized Clean',
      value: stats?.totalOrganizedFiles?.toLocaleString() || '0',
      icon: FolderCheck,
      cardBg: 'bg-pastel-mint-50/80 dark:bg-emerald-950/20 border-pastel-mint-200/60 dark:border-emerald-800/30',
      badgeBg: 'bg-emerald-200/60 dark:bg-emerald-800/50 text-emerald-800 dark:text-emerald-200',
      tag: 'tidy & safe'
    },
    {
      title: 'Confirmed Duplicates',
      value: stats?.duplicateFilesDetected?.toLocaleString() || '0',
      icon: Copy,
      cardBg: 'bg-pastel-peach-50/80 dark:bg-orange-950/20 border-pastel-peach-200/60 dark:border-orange-800/30',
      badgeBg: 'bg-orange-200/60 dark:bg-orange-800/50 text-orange-800 dark:text-orange-200',
      tag: 'redundant'
    },
    {
      title: 'Potential Reclaim',
      value: stats?.formattedSavings || '0 B',
      icon: Sparkles,
      cardBg: 'bg-pastel-butter-50/80 dark:bg-amber-950/20 border-pastel-butter-200/60 dark:border-amber-800/30',
      badgeBg: 'bg-amber-200/60 dark:bg-amber-800/50 text-amber-800 dark:text-amber-200',
      tag: 'free space'
    },
    {
      title: 'Last Tidy',
      value: stats?.lastScanTime ? new Date(stats.lastScanTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never',
      icon: Clock,
      cardBg: 'bg-pastel-bubblegum-50/80 dark:bg-pink-950/20 border-pastel-bubblegum-200/60 dark:border-pink-800/30',
      badgeBg: 'bg-pink-200/60 dark:bg-pink-800/50 text-pink-800 dark:text-pink-200',
      tag: 'timestamp'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Live Scan Progress Floating Banner */}
      {scanStatus === 'scanning' && scanProgress && (
        <div className="p-5 rounded-3xl bg-white/80 dark:bg-surface-dark-card/90 backdrop-blur-xl border border-purple-200 dark:border-purple-800/50 shadow-soft-xl animate-fade-in space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-soft">
                <Play className="w-4 h-4 fill-current animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white font-display">
                  Scanning Vault (Strict Direct Inspection)
                </h4>
                <p className="text-[11px] text-slate-500 font-mono truncate max-w-md">
                  {scanProgress.currentFile || 'Indexing binary headers...'}
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              {scanProgress.percent || 0}%
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-white/[0.08] rounded-full h-2.5 overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-purple-500 via-pink-400 to-amber-300 h-full rounded-full transition-all duration-300"
              style={{ width: `${scanProgress.percent || 0}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
            <span>{scanProgress.processedFiles?.toLocaleString()} direct files indexed</span>
            <span>{Math.round((scanProgress.processedBytes || 0) / 1024 / 1024)} MB processed in RAM</span>
          </div>
        </div>
      )}

      {/* Hero Welcome & Quick Scanner with Gen-Z Aesthetic */}
      <div className="p-8 sm:p-10 rounded-4xl bg-gradient-to-br from-purple-900 via-slate-900 to-slate-950 text-white shadow-soft-xl relative overflow-hidden border border-white/10">
        {/* Soft Pastel Ambient Glows */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>Aesthetic Local File Sanctuary &bull; v1.2.0</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display leading-tight">
            Tidy your digital clutter with <br />
            <span className="bg-gradient-to-r from-purple-300 via-pink-200 to-amber-200 bg-clip-text text-transparent">
              delightful simplicity &amp; zero cloud fear.
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed font-sans max-w-xl">
            Strict filename &amp; SHA-256 verification, magic-byte header decoding, and automatic 21-category organization. Everything executes right on your device.
          </p>

          {/* Quick Target Input & Buttons */}
          <div className="pt-3 flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[280px] relative">
              <input
                type="text"
                value={scanPath}
                onChange={(e) => setScanPath(e.target.value)}
                placeholder="Choose folder (e.g. D:\Downloads or C:\Users\you\Pictures)"
                className="w-full pl-9 pr-4 py-3 text-xs rounded-2xl bg-white/10 border border-white/15 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 backdrop-blur-md font-mono"
              />
              <FolderOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
            </div>

            <button
              onClick={onStartScan}
              disabled={scanStatus === 'scanning' || !scanPath}
              className="flex items-center gap-2 px-6 py-3 text-xs font-bold rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 hover:opacity-95 text-slate-950 shadow-soft transition-all btn-bounce disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Scan</span>
            </button>

            <button
              onClick={onOpenOrganizeModal}
              disabled={!stats || stats.totalFilesScanned === 0}
              className="flex items-center gap-2 px-6 py-3 text-xs font-bold rounded-2xl bg-white hover:bg-slate-100 text-slate-900 shadow-soft transition-all btn-bounce disabled:opacity-40"
            >
              <FolderCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Organize Vault</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bento Grid: 6 Metric Stat Cards with Soft Pastel Tones */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`p-4 rounded-3xl border shadow-soft-sm card-hover flex flex-col justify-between ${card.cardBg}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold tracking-tight opacity-75">{card.title}</span>
                <div className={`p-1.5 rounded-xl ${card.badgeBg}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <div className="text-xl font-extrabold tracking-tight font-display truncate">
                  {card.value}
                </div>
                <div className="text-[10px] font-mono opacity-60 mt-0.5 truncate">
                  {card.tag}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Storage Savings & Duplicates Highlight Callout */}
      {stats?.potentialSavingsBytes > 0 && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-pastel-peach-50 via-pastel-butter-50 to-pastel-peach-50 dark:from-orange-950/20 dark:via-amber-950/20 dark:to-orange-950/20 border border-orange-200/80 dark:border-orange-800/40 shadow-soft-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-400 text-slate-950 flex items-center justify-center font-bold shadow-soft">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                Storage Optimization Opportunity: {stats.formattedSavings} Reclaimable
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Found {stats.duplicateFilesDetected} redundant copies matching strict filenames and SHA-256 hashes.
              </p>
            </div>
          </div>

          <button
            onClick={() => setTab('duplicates')}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-soft hover:shadow-soft-lg transition-all btn-bounce"
          >
            <span>Review Duplicates</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Category Breakdown Preview (Pinterest Bento Grid) */}
      <div className="p-6 rounded-3xl bg-white/70 dark:bg-surface-dark-card/70 backdrop-blur-md border border-black/[0.05] dark:border-white/[0.06] shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
              Detected Folder Ecosystem
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Clean categorization across 21 standardized directories
            </p>
          </div>
          <button
            onClick={() => setTab('categories')}
            className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
          >
            <span>View All Folders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {categories.slice(0, 14).map((cat) => (
            <div
              key={cat.key}
              onClick={() => setTab('files')}
              className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05] hover:border-purple-300 dark:hover:border-purple-600/50 cursor-pointer card-hover"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {cat.name}
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-sm font-extrabold font-display">{cat.fileCount}</span>
                <span className="text-[10px] font-mono text-slate-400">{cat.formattedSize}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
