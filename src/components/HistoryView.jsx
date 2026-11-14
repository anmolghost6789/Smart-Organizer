import React, { useState, useEffect } from 'react';
import {
  History,
  RotateCcw,
  CheckCircle2,
  FolderSync,
  AlertCircle,
  FileCheck,
  Sparkles
} from 'lucide-react';

export function HistoryView() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [undoingId, setUndoingId] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      setLoading(true);
      const res = await fetch('/api/history');
      const json = await res.json();
      setHistory(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUndo(operationId) {
    try {
      setUndoingId(operationId);
      const res = await fetch('/api/history/undo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationId })
      });
      const json = await res.json();

      if (res.ok) {
        setMessage({
          type: 'success',
          text: `Successfully restored ${json.restoredCount} files back to their exact original locations!`
        });
        fetchHistory();
      } else {
        setMessage({ type: 'error', text: json.error });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setUndoingId(null);
    }
  }

  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-display flex items-center gap-2">
            <span>Organization Audit Log &amp; 1-Click Rollback</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              zero risk
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Every movement is atomically logged into local SQLite WAL journal for instant reverse restoration
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-3xl text-xs font-bold flex items-center gap-2.5 animate-fade-in ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
              : 'bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          <span>{message.text}</span>
        </div>
      )}

      {history.length === 0 ? (
        <div className="py-24 text-center rounded-3xl bg-white/70 dark:bg-surface-dark-card/70 border border-black/[0.05] dark:border-white/[0.06] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center mx-auto">
            <History className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">No Operations Recorded Yet</h4>
          <p className="text-xs text-slate-400">Run an organization operation to view transactional audit history</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((op) => (
            <div
              key={op.id}
              className="p-6 rounded-3xl bg-white/80 dark:bg-surface-dark-card/80 backdrop-blur-md border border-black/[0.05] dark:border-white/[0.06] shadow-soft flex flex-wrap items-center justify-between gap-4 card-hover"
            >
              <div className="space-y-1.5 min-w-[260px] flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 font-mono">
                    {op.type}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white font-display">
                    {op.files_count.toLocaleString()} files ({formatBytes(op.total_size)})
                  </span>
                  {op.status === 'undone' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-white/[0.08] text-slate-500">
                      Restored / Undone
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40">
                      Active
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                  Target: {op.target_dir}
                </div>

                <div className="text-[10px] font-mono text-slate-400">
                  Timestamp: {op.formattedDate}
                </div>
              </div>

              {op.status !== 'undone' && (
                <button
                  onClick={() => handleUndo(op.id)}
                  disabled={undoingId === op.id}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-2xl bg-slate-950 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 shadow-soft transition-all btn-bounce disabled:opacity-50"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${undoingId === op.id ? 'animate-spin' : ''}`} />
                  <span>Undo &amp; Restore</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
