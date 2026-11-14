import React, { useState, useEffect } from 'react';
import {
  FolderCheck,
  AlertCircle,
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  FolderTree,
  FileText
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <FolderCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Safe Organization Engine Preview
              </h3>
              <p className="text-[11px] text-slate-400">Pre-flight verification &amp; collision detection</p>
            </div>
          </div>

          {step !== 'executing' && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step: Loading */}
        {loadingPreview && (
          <div className="py-16 text-center space-y-2">
            <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Evaluating directory tree &amp; collision mapping...</p>
          </div>
        )}

        {/* Step: Preview Plan */}
        {!loadingPreview && step === 'preview' && plan && (
          <div className="space-y-4 text-xs">
            {/* Key Summary Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 block">Total Files</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {plan.totalFiles.toLocaleString()}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 block">Total Size</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {formatBytes(plan.totalBytes)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 block">Operation Mode</span>
                <span className="text-sm font-bold uppercase text-sky-600 dark:text-sky-400">
                  {plan.mode}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 block">Naming Conflicts</span>
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                  {plan.conflictsCount} auto-resolved
                </span>
              </div>
            </div>

            {/* Target Destination Info */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 font-mono text-[11px] space-y-1">
              <span className="text-slate-400 font-sans font-medium">Target Destination:</span>
              <p className="text-slate-700 dark:text-slate-300 break-all">{plan.targetRootDir}</p>
            </div>

            {/* Category Distribution Grid */}
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200">Category Routing Distribution</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(plan.categoriesSummary).map(([catName, info]) => (
                  <div key={catName} className="p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate">{catName}</span>
                    <span className="font-bold text-sky-600 dark:text-sky-400">{info.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Proposed Files Preview Table */}
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200">Proposed File Movement Sample</h4>
              <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 font-semibold sticky top-0">
                    <tr>
                      <th className="p-2">Source File</th>
                      <th className="p-2">Target Folder</th>
                      <th className="p-2 text-right">Size</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                    {plan.items.slice(0, 20).map((it) => (
                      <tr key={it.id}>
                        <td className="p-2 truncate max-w-xs">{it.fileName}</td>
                        <td className="p-2 truncate text-sky-600 dark:text-sky-400">/{it.categoryFolder}/{it.finalFileName}</td>
                        <td className="p-2 text-right">{formatBytes(it.size)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 font-semibold">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleExecute}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Confirm &amp; Execute Organization</span>
              </button>
            </div>
          </div>
        )}

        {/* Step: Executing */}
        {step === 'executing' && (
          <div className="py-12 text-center space-y-4">
            <div className="w-10 h-10 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Organizing Files Safely...
              </h4>
              <p className="text-xs text-slate-400">
                Writing atomic journal to SQLite and moving files into structured categories
              </p>
            </div>
          </div>
        )}

        {/* Step: Completed */}
        {step === 'done' && (
          <div className="py-8 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Organization Complete!
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Successfully organized {result?.successCount} files. You can undo this entire operation at any time from the Scan History tab.
              </p>
            </div>

            <div className="pt-4 flex justify-center gap-3 text-xs font-semibold">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900"
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
