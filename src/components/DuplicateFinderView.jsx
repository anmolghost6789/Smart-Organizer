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
  X
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

  function clearSelection() {
    setSelectedPaths(new Set());
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
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Duplicate Detection Engine</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
              Recoverable: {duplicates?.formattedSavings || '0 B'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Multi-stage SHA-256 verification and 64-bit perceptual visual image similarity. Never deletes without explicit approval.
          </p>
        </div>

        {/* Tab Switcher & Batch Action */}
        <div className="flex items-center gap-2">
          <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium">
            <button
              onClick={() => setActiveTab('exact')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'exact'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Exact Duplicates ({exactList.length})
            </button>
            <button
              onClick={() => setActiveTab('similar')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'similar'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Similar Photos ({similarList.length})
            </button>
          </div>

          <button
            onClick={selectAllRedundant}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            Select Redundant
          </button>

          {selectedPaths.size > 0 && (
            <button
              onClick={() => setConfirmModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/20 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedPaths.size})</span>
            </button>
          )}
        </div>
      </div>

      {/* Duplicate Groups List */}
      {activeList.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto stroke-1" />
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No {activeTab === 'exact' ? 'exact' : 'similar'} duplicates found</h4>
          <p className="text-xs text-slate-400">All scanned files in this group are unique</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeList.map((group, groupIdx) => (
            <div
              key={group.id}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden"
            >
              {/* Group Header */}
              <div className="px-5 py-3 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Duplicate Set #{groupIdx + 1}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="font-mono text-slate-500">{group.files.length} copies</span>
                  {group.potentialSaving && (
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
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
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
                {group.files.map((file) => {
                  const isChecked = selectedPaths.has(file.path);

                  return (
                    <div
                      key={file.id || file.path}
                      className={`p-3 rounded-xl flex items-center justify-between gap-4 transition-colors ${
                        file.isRecommendedKeep
                          ? 'bg-emerald-50/40 dark:bg-emerald-500/5 border border-emerald-500/20'
                          : isChecked
                          ? 'bg-rose-50/40 dark:bg-rose-500/5'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Selection Checkbox */}
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleFileSelection(file.path)}
                          className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500/30 cursor-pointer"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                              {file.name}
                            </span>

                            {file.isRecommendedKeep ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Recommended to Keep
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500">
                                Duplicate Copy
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
                        <span className="text-slate-500">{formatBytes(file.size)}</span>
                        <button
                          onClick={() => onRevealPath(file.path)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800"
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

      {/* Strict Confirmation Deletion Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Confirm Duplicate Deletion
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  You are about to delete <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedPaths.size}</span> duplicate files. This will immediately reclaim <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatBytes(selectedBytes)}</span> of disk space.
                </p>
              </div>
            </div>

            {/* Safe Trash Option */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={moveToTrash}
                  onChange={(e) => setMoveToTrash(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-sky-600"
                />
                <div className="text-xs">
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    Move to Local Recovery Trash (.desktopor_trash)
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Recommended for safety. Files are moved to a quarantine folder instead of permanent unlinking.
                  </p>
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="pt-2 flex justify-end gap-2 text-xs font-semibold">
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteDuplicates(Array.from(selectedPaths), moveToTrash);
                  setConfirmModalOpen(false);
                  setSelectedPaths(new Set());
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
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
