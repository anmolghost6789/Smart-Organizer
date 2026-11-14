import React, { useState } from 'react';
import {
  Copy,
  Sparkles,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  Info,
  X,
  Crown
} from 'lucide-react';

export function DuplicateFinderView({ duplicates, onRevealPath, onDeleteDuplicates }) {
  const [activeTab, setActiveTab] = useState('exact'); // 'exact' or 'similar'
  const [selectedPaths, setSelectedPaths] = useState(new Set());
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [moveToTrash, setMoveToTrash] = useState(true);

  const exactList = duplicates?.exactDuplicates || [];
  const similarList = duplicates?.similarImages || [];
  const activeList = activeTab === 'exact' ? exactList : similarList;

  function toggleFileSelection(path) {
    setSelectedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }

  // Smart action: select all redundant copies (leave keepers unchecked)
  function selectAllRedundant() {
    const newSelected = new Set();
    for (const group of activeList) {
      for (const file of group.files) {
        if (!file.isRecommendedKeep) {
          newSelected.add(file.path);
        }
      }
    }
    setSelectedPaths(newSelected);
  }

  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  // Calculate selected recoverable space
  let selectedBytes = 0;
  for (const group of activeList) {
    for (const f of group.files) {
      if (selectedPaths.has(f.path)) {
        selectedBytes += f.size;
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Overview & Action Header */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white/80 dark:bg-surface-dark-card/80 backdrop-blur-md border border-black/[0.05] dark:border-white/[0.06] shadow-soft flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-display">
              Strict Duplicate Detection
            </h3>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-pastel-butter-200/80 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300/60">
              Recoverable: {duplicates?.formattedSavings || '0 B'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Filenames &amp; extensions compared first &bull; Verified via SHA-256 &bull; Zero automatic deletions
          </p>
        </div>

        {/* Tab Switcher & Batch Actions */}
        <div className="flex items-center gap-2">
          <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-white/[0.05] text-xs font-bold">
            <button
              onClick={() => setActiveTab('exact')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                activeTab === 'exact'
                  ? 'bg-white dark:bg-surface-dark-card text-purple-700 dark:text-purple-300 shadow-soft-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Exact Sets ({exactList.length})
            </button>
            <button
              onClick={() => setActiveTab('similar')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                activeTab === 'similar'
                  ? 'bg-white dark:bg-surface-dark-card text-purple-700 dark:text-purple-300 shadow-soft-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Similar Photos ({similarList.length})
            </button>
          </div>

          <button
            onClick={selectAllRedundant}
            className="px-4 py-2 text-xs font-bold rounded-2xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-200 transition-all btn-bounce"
          >
            Select Redundant
          </button>

          {selectedPaths.size > 0 && (
            <button
              onClick={() => setConfirmModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-2xl bg-rose-500 hover:bg-rose-600 text-white shadow-soft transition-all btn-bounce animate-pulse"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedPaths.size})</span>
            </button>
          )}
        </div>
      </div>

      {/* Duplicate Groups List */}
      {activeList.length === 0 ? (
        <div className="py-24 text-center rounded-3xl bg-white/70 dark:bg-surface-dark-card/70 border border-black/[0.05] dark:border-white/[0.06] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">
            No {activeTab === 'exact' ? 'exact' : 'similar'} duplicates found
          </h4>
          <p className="text-xs text-slate-400">All filenames and SHA-256 hashes in this folder are unique</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeList.map((group, groupIdx) => (
            <div
              key={group.id}
              className="rounded-3xl bg-white/80 dark:bg-surface-dark-card/80 border border-black/[0.05] dark:border-white/[0.06] shadow-soft overflow-hidden"
            >
              {/* Group Header */}
              <div className="px-6 py-3.5 bg-slate-50/70 dark:bg-white/[0.02] border-b border-black/[0.04] dark:border-white/[0.05] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-slate-900 dark:text-white font-display">
                    Set #{groupIdx + 1}
                  </span>
                  <span className="text-slate-400">&bull;</span>
                  <span className="font-mono text-purple-600 dark:text-purple-400 font-semibold">
                    {group.canonicalName || 'duplicate group'}
                  </span>
                  <span className="text-slate-400">&bull;</span>
                  <span className="font-mono text-slate-500">{group.files.length} copies</span>
                  {group.potentialSaving && (
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      (Saves {formatBytes(group.potentialSaving)})
                    </span>
                  )}
                </div>

                {group.sha256 && (
                  <span className="font-mono text-[10px] text-slate-400 truncate max-w-xs" title={group.sha256}>
                    SHA: {group.sha256.substring(0, 16)}...
                  </span>
                )}
              </div>

              {/* Group Files */}
              <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04] p-3 space-y-1">
                {group.files.map((file) => {
                  const isChecked = selectedPaths.has(file.path);

                  return (
                    <div
                      key={file.id || file.path}
                      className={`p-3.5 rounded-2xl flex items-center justify-between gap-4 transition-all ${
                        file.isRecommendedKeep
                          ? 'bg-pastel-mint-50/60 dark:bg-emerald-950/20 border border-emerald-500/20'
                          : isChecked
                          ? 'bg-pastel-peach-50/70 dark:bg-rose-950/20 border border-rose-500/20'
                          : 'hover:bg-slate-50 dark:hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        {/* Custom Checkbox */}
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleFileSelection(file.path)}
                          className="w-4 h-4 rounded-lg text-purple-600 focus:ring-purple-400/40 cursor-pointer"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {file.name}
                            </span>

                            {file.isRecommendedKeep ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1 border border-emerald-300/50">
                                <Crown className="w-3 h-3 text-amber-500 fill-amber-400" />
                                Recommended Keeper
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-white/[0.05] text-slate-500">
                                Redundant Copy
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                            {file.path}
                          </div>

                          {file.keepReason && (
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                              Reason: {file.keepReason}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono">
                        <span className="text-slate-500 font-semibold">{formatBytes(file.size)}</span>
                        <button
                          onClick={() => onRevealPath(file.path)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors"
                          title="Reveal in Explorer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Strict Confirmation Deletion Modal with Gen-Z Aesthetic */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-surface-dark-card rounded-4xl p-7 shadow-soft-xl border border-black/[0.08] dark:border-white/[0.1] space-y-5 animate-fade-in">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  Confirm Duplicate Removal
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  You are about to delete <span className="font-bold text-slate-900 dark:text-white">{selectedPaths.size}</span> verified redundant files. This will safely reclaim <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatBytes(selectedBytes)}</span>.
                </p>
              </div>
            </div>

            {/* Safe Trash Option */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06]">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={moveToTrash}
                  onChange={(e) => setMoveToTrash(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-purple-600"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Move to Local Recovery Quarantine (.desktopor_trash)
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Recommended for safety. Files can be recovered anytime from the quarantine folder.
                  </p>
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="pt-2 flex justify-end gap-2.5 text-xs font-bold">
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 transition-colors btn-bounce"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteDuplicates(Array.from(selectedPaths), moveToTrash);
                  setConfirmModalOpen(false);
                  setSelectedPaths(new Set());
                }}
                className="px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white shadow-soft transition-all btn-bounce"
              >
                Confirm &amp; Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
