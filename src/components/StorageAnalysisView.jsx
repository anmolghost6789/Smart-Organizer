import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  FolderOpen,
  Trash2,
  FileWarning,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Zap
} from 'lucide-react';

export function StorageAnalysisView({ onRevealPath }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cleaningEmpty, setCleaningEmpty] = useState(false);
  const [cleanMessage, setCleanMessage] = useState(null);

  useEffect(() => {
    fetchStorageAnalysis();
  }, []);

  async function fetchStorageAnalysis() {
    try {
      setLoading(true);
      const res = await fetch('/api/storage-analysis');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCleanEmptyFolders() {
    try {
      setCleaningEmpty(true);
      const res = await fetch('/api/storage/cleanup-empty', { method: 'POST' });
      const json = await res.json();
      setCleanMessage(`Successfully pruned ${json.deletedCount} empty directories.`);
      fetchStorageAnalysis();
    } catch (err) {
      console.error(err);
    } finally {
      setCleaningEmpty(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-pastel-lavender-50/70 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/30 shadow-soft-sm space-y-1">
          <span className="text-xs font-bold text-purple-800 dark:text-purple-300">Total Analyzed Storage</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
            {data?.formattedTotal || '0 B'}
          </div>
          <span className="text-[10px] font-mono text-purple-600/70">scanned disk space</span>
        </div>

        <div className="p-6 rounded-3xl bg-pastel-peach-50/70 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-800/30 shadow-soft-sm space-y-1">
          <span className="text-xs font-bold text-orange-800 dark:text-orange-300">Large Files (&gt; 50 MB)</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
            {data?.largeFilesCount || 0} files
          </div>
          <span className="text-[10px] font-mono text-orange-600/70">space consumers</span>
        </div>

        <div className="p-6 rounded-3xl bg-pastel-mint-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/30 shadow-soft-sm space-y-1">
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Empty Folders Detected</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-display flex items-center justify-between">
            <span>{data?.emptyFoldersCount || 0}</span>
            {data?.emptyFoldersCount > 0 && (
              <button
                onClick={handleCleanEmptyFolders}
                disabled={cleaningEmpty}
                className="px-3.5 py-1.5 text-xs font-bold rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-soft transition-all btn-bounce disabled:opacity-50"
              >
                Clean Empty
              </button>
            )}
          </div>
          <span className="text-[10px] font-mono text-emerald-600/70">zero content</span>
        </div>
      </div>

      {cleanMessage && (
        <div className="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{cleanMessage}</span>
        </div>
      )}

      {/* Large Files Section */}
      <div className="p-7 rounded-3xl bg-white/80 dark:bg-surface-dark-card/80 backdrop-blur-md border border-black/[0.05] dark:border-white/[0.06] shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
              Large Files Inspector
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Files exceeding 50 MB consuming significant disk space
            </p>
          </div>
        </div>

        {!data?.largeFiles || data.largeFiles.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No files larger than 50 MB identified in this scan
          </div>
        ) : (
          <div className="divide-y divide-black/[0.03] dark:divide-white/[0.04] max-h-96 overflow-y-auto">
            {data.largeFiles.map((f) => (
              <div key={f.id} className="py-3 flex items-center justify-between text-xs hover:bg-purple-50/40 dark:hover:bg-purple-950/20 px-3 rounded-2xl transition-colors">
                <div className="min-w-0 flex-1 pr-4">
                  <div className="font-bold text-slate-900 dark:text-slate-100 truncate">{f.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">{f.path}</div>
                </div>
                <div className="flex items-center gap-3 font-mono">
                  <span className="font-extrabold text-purple-600 dark:text-purple-400">{f.formattedSize}</span>
                  <button
                    onClick={() => onRevealPath(f.path)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors"
                    title="Reveal in Explorer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Empty Folders Section */}
      {data?.emptyFolders && data.emptyFolders.length > 0 && (
        <div className="p-7 rounded-3xl bg-white/80 dark:bg-surface-dark-card/80 backdrop-blur-md border border-black/[0.05] dark:border-white/[0.06] shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">Empty Directories</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Folders containing zero files</p>
            </div>
            <button
              onClick={handleCleanEmptyFolders}
              disabled={cleaningEmpty}
              className="px-4 py-2 text-xs font-bold rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-soft btn-bounce"
            >
              Prune All Empty Folders
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1 font-mono text-[11px] text-slate-500 bg-slate-50 dark:bg-white/[0.03] p-4 rounded-2xl">
            {data.emptyFolders.map((dir, idx) => (
              <div key={idx} className="truncate">{dir}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
