import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  FolderOpen,
  Trash2,
  FileWarning,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle
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
      setCleanMessage(`Successfully removed ${json.deletedCount} empty directories.`);
      fetchStorageAnalysis();
    } catch (err) {
      console.error(err);
    } finally {
      setCleaningEmpty(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Analyzed Storage</span>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {data?.formattedTotal || '0 B'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Large Files (&gt; 50 MB)</span>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {data?.largeFilesCount || 0} files
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Empty Folders Detected</span>
          <div className="text-xl font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>{data?.emptyFoldersCount || 0}</span>
            {data?.emptyFoldersCount > 0 && (
              <button
                onClick={handleCleanEmptyFolders}
                disabled={cleaningEmpty}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-50"
              >
                Clean Empty
              </button>
            )}
          </div>
        </div>
      </div>

      {cleanMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{cleanMessage}</span>
        </div>
      )}

      {/* Large Files Section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Large Files Inspector</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Files exceeding 50 MB consuming storage space</p>
          </div>
        </div>

        {!data?.largeFiles || data.largeFiles.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No files larger than 50 MB identified in this scan
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-96 overflow-y-auto">
            {data.largeFiles.map((f) => (
              <div key={f.id} className="py-3 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/20 px-2 rounded-xl transition-colors">
                <div className="min-w-0 flex-1 pr-4">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{f.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono truncate">{f.path}</div>
                </div>
                <div className="flex items-center gap-3 font-mono">
                  <span className="font-bold text-slate-900 dark:text-white">{f.formattedSize}</span>
                  <button
                    onClick={() => onRevealPath(f.path)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800"
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
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Empty Directories</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Folders containing zero files</p>
            </div>
            <button
              onClick={handleCleanEmptyFolders}
              disabled={cleaningEmpty}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900"
            >
              Prune All Empty Folders
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1 font-mono text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
            {data.emptyFolders.map((dir, idx) => (
              <div key={idx} className="truncate">{dir}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
