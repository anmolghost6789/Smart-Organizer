import React, { useState, useEffect } from 'react';
import {
  FolderCheck,
  AlertCircle,
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  FolderTree,
  FileText,
  Sparkles
} from 'lucide-react';

export function OrganizeModal({
  isOpen,
  onClose,
  targetDir,
  organizeConfig,
  onSuccess
}) {
  const [step, setStep] = useState('preview'); // 'preview', 'executing', 'done'
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (isOpen && targetDir) {
      loadPlanPreview();
    }
  }, [isOpen, targetDir]);

  async function loadPlanPreview() {
    try {
      setLoadingPreview(true);
      setError(null);
      setStep('preview');

      const res = await fetch('/api/organize/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRootDir: targetDir,
          mode: organizeConfig.mode,
          conflictResolution: organizeConfig.conflictResolution,
          groupByDate: organizeConfig.groupByDate
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to generate plan');
      }

      setPlan(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingPreview(false);
    }
  }

  async function handleExecute() {
    if (!plan) return;
    try {
      setStep('executing');
      setError(null);

      const res = await fetch('/api/organize/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Execution failed');
      }

      setResult(json);
      setStep('done');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
      setStep('preview');
    }
  }

  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-surface-dark-card rounded-4xl p-7 shadow-soft-xl border border-black/[0.08] dark:border-white/[0.1] space-y-5 max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.05] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <FolderCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                Safe Organization Engine Preview
              </h3>
              <p className="text-[11px] text-slate-400">Pre-flight verification &amp; collision detection</p>
            </div>
          </div>

          {step !== 'executing' && (
            <button
              onClick={onClose}
              className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-3xl bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Step: Loading */}
        {loadingPreview && (
          <div className="py-16 text-center space-y-3">
            <div className="w-9 h-9 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300 font-display">
              Mapping directory tree &amp; collision rules...
            </p>
          </div>
        )}

        {/* Step: Preview Plan */}
        {!loadingPreview && step === 'preview' && plan && (
          <div className="space-y-4 text-xs">
            {/* Key Summary Badges Bento */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-pastel-sky-50/70 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-800/30">
                <span className="text-[11px] font-bold text-sky-800 dark:text-sky-300 block">Total Files</span>
                <span className="text-sm font-extrabold text-sky-950 dark:text-white font-display">
                  {plan.totalFiles.toLocaleString()}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-pastel-lavender-50/70 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-800/30">
                <span className="text-[11px] font-bold text-purple-800 dark:text-purple-300 block">Total Size</span>
                <span className="text-sm font-extrabold text-purple-950 dark:text-white font-display">
                  {formatBytes(plan.totalBytes)}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-pastel-mint-50/70 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/30">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block">Mode</span>
                <span className="text-sm font-extrabold uppercase text-emerald-700 dark:text-emerald-300 font-display">
                  {plan.mode}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-pastel-peach-50/70 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-800/30">
                <span className="text-[11px] font-bold text-orange-800 dark:text-orange-300 block">Conflicts</span>
                <span className="text-sm font-extrabold text-orange-700 dark:text-orange-300 font-display">
                  {plan.conflictsCount} renamed
                </span>
              </div>
            </div>

            {/* Target Destination Info */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05] font-mono text-[11px] space-y-1">
              <span className="text-slate-400 font-sans font-semibold">Target Destination:</span>
              <p className="text-slate-700 dark:text-slate-300 break-all">{plan.targetRootDir}</p>
            </div>

            {/* Category Routing Grid */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white font-display">Category Routing</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(plan.categoriesSummary).map(([catName, info]) => (
                  <div key={catName} className="p-2.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.05] flex items-center justify-between">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{catName}</span>
                    <span className="font-bold font-mono text-purple-600 dark:text-purple-400">{info.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Proposed Files Preview Table */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white font-display">Proposed Movements Sample</h4>
              <div className="border border-black/[0.05] dark:border-white/[0.06] rounded-2xl overflow-hidden max-h-44 overflow-y-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead className="bg-slate-50 dark:bg-white/[0.03] text-slate-400 font-bold sticky top-0">
                    <tr>
                      <th className="p-2.5">Source File</th>
                      <th className="p-2.5">Target Destination</th>
                      <th className="p-2.5 text-right">Size</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.04] font-mono">
                    {plan.items.slice(0, 15).map((it) => (
                      <tr key={it.id}>
                        <td className="p-2.5 truncate max-w-xs">{it.fileName}</td>
                        <td className="p-2.5 truncate text-purple-600 dark:text-purple-400">/{it.categoryFolder}/{it.finalFileName}</td>
                        <td className="p-2.5 text-right">{formatBytes(it.size)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.05] flex justify-end gap-2.5 font-bold">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 transition-colors btn-bounce"
              >
                Cancel
              </button>
              <button
                onClick={handleExecute}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-soft transition-all btn-bounce"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Confirm &amp; Execute Organization</span>
              </button>
            </div>
          </div>
        )}

        {/* Step: Executing */}
        {step === 'executing' && (
          <div className="py-14 text-center space-y-4">
            <div className="w-11 h-11 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                Organizing Vault Safely...
              </h4>
              <p className="text-xs text-slate-400">
                Writing atomic journal to SQLite and moving files into structured categories
              </p>
            </div>
          </div>
        )}

        {/* Step: Completed */}
        {step === 'done' && (
          <div className="py-10 text-center space-y-4">
            <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-white flex items-center justify-center mx-auto shadow-soft">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                Organization Complete!
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Successfully organized {result?.successCount} files. You can undo this entire operation at any time with 1-Click Rollback in the Audit tab.
              </p>
            </div>

            <div className="pt-4 flex justify-center gap-3 text-xs font-bold">
              <button
                onClick={onClose}
                className="px-7 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 shadow-soft btn-bounce"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
