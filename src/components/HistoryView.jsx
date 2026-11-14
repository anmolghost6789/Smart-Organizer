import React, { useState, useEffect } from 'react';
import {
  History,
  RotateCcw,
  CheckCircle2,
  FolderSync,
  AlertCircle,
  FileCheck
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
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Organization Audit Log &amp; Safe Undo</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Every file movement is journaled in local SQLite. You can roll back any batch with 1-click restore.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20'
              : 'bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-500/20'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {history.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <History className="w-10 h-10 text-slate-400 mx-auto stroke-1" />
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Operations Recorded Yet</h4>
          <p className="text-xs text-slate-400">Run an organization operation to view transactional history</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((op) => (
            <div
              key={op.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4"
            >
              <div className="space-y-1 min-w-[260px] flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                    {op.type}
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {op.files_count.toLocaleString()} files ({formatBytes(op.total_size)})
                  </span>
                  {op.status === 'undone' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-500">
                      Restored / Undone
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      Active
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                  Target: {op.target_dir}
                </div>

                <div className="text-[10px] text-slate-400">
                  Executed on: {op.formattedDate}
                </div>
              </div>

              {op.status !== 'undone' && (
                <button
                  onClick={() => handleUndo(op.id)}
                  disabled={undoingId === op.id}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 shadow-sm transition-all active:scale-95 disabled:opacity-50"
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
