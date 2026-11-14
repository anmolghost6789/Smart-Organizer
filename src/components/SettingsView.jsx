import React, { useState, useEffect } from 'react';
import {
  Settings,
  Plus,
  Trash2,
  ShieldCheck,
  FolderTree,
  Database,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Download,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export function SettingsView({
  organizeConfig,
  setOrganizeConfig,
  categories
}) {
  const [rules, setRules] = useState([]);
  const [newRuleType, setNewRuleType] = useState('extension');
  const [newRulePattern, setNewRulePattern] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState('Documents');
  const [ruleMessage, setRuleMessage] = useState(null);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [checkingUpdate, setCheckingUpdate] = useState(false);

  useEffect(() => {
    fetchRules();
    checkUpdate();
  }, []);

  async function checkUpdate() {
    try {
      setCheckingUpdate(true);
      const res = await fetch('/api/updates/check?version=1.2.0');
      const json = await res.json();
      setUpdateInfo(json);
    } catch {
    } finally {
      setCheckingUpdate(false);
    }
  }

  async function fetchRules() {
    try {
      const res = await fetch('/api/rules');
      const json = await res.json();
      setRules(json);
    } catch (err) {}
  }

  async function handleAddRule(e) {
    e.preventDefault();
    if (!newRulePattern) return;

    try {
      const res = await fetch('/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newRuleType,
          pattern: newRulePattern,
          targetCategory: newRuleCategory
        })
      });

      if (res.ok) {
        setRuleMessage('Custom categorization rule added successfully!');
        setNewRulePattern('');
        fetchRules();
        setTimeout(() => setRuleMessage(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-display flex items-center gap-2">
          <span>Preferences &amp; Custom Rules</span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
            customization
          </span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure organization behavior, custom category overrides, and local update manifest
        </p>
      </div>

      {/* Organization Defaults Card */}
      <div className="p-7 rounded-3xl bg-white/80 dark:bg-surface-dark-card/80 backdrop-blur-md border border-black/[0.05] dark:border-white/[0.06] shadow-soft space-y-5">
        <div className="flex items-center gap-2.5 border-b border-black/[0.04] dark:border-white/[0.05] pb-3.5">
          <div className="p-1.5 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300">
            <Sliders className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200 font-display">Organization Behavior</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Root Organizer Folder Name
            </label>
            <input
              type="text"
              value={organizeConfig.folderName}
              onChange={(e) => setOrganizeConfig({ ...organizeConfig, folderName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100/80 dark:bg-white/[0.05] border border-black/[0.04] dark:border-white/[0.06] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400/40 font-semibold"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Operation Mode
            </label>
            <select
              value={organizeConfig.mode}
              onChange={(e) => setOrganizeConfig({ ...organizeConfig, mode: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100/80 dark:bg-white/[0.05] border border-black/[0.04] dark:border-white/[0.06] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400/40 font-semibold"
            >
              <option value="move">Move files (Clean original folder)</option>
              <option value="copy">Copy files (Keep originals untouched)</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Naming Collision Resolution
            </label>
            <select
              value={organizeConfig.conflictResolution}
              onChange={(e) => setOrganizeConfig({ ...organizeConfig, conflictResolution: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100/80 dark:bg-white/[0.05] border border-black/[0.04] dark:border-white/[0.06] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400/40 font-semibold"
            >
              <option value="smart-rename">Smart Rename (e.g. photo (1).jpg)</option>
              <option value="skip">Skip file if name exists</option>
              <option value="overwrite">Overwrite existing target</option>
            </select>
          </div>

          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={organizeConfig.groupByDate}
                onChange={(e) => setOrganizeConfig({ ...organizeConfig, groupByDate: e.target.checked })}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-400/30"
              />
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Group Photos into Date Subfolders (YYYY/MM)
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Custom Rules Section */}
      <div className="p-7 rounded-3xl bg-white/80 dark:bg-surface-dark-card/80 backdrop-blur-md border border-black/[0.05] dark:border-white/[0.06] shadow-soft space-y-5">
        <div className="flex items-center gap-2.5 border-b border-black/[0.04] dark:border-white/[0.05] pb-3.5">
          <div className="p-1.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300">
            <FolderTree className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200 font-display">Custom Routing Rules</h4>
        </div>

        {ruleMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{ruleMessage}</span>
          </div>
        )}

        <form onSubmit={handleAddRule} className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-400 mb-1">Condition</label>
            <select
              value={newRuleType}
              onChange={(e) => setNewRuleType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100/80 dark:bg-white/[0.05] border border-black/[0.04] dark:border-white/[0.06] font-semibold"
            >
              <option value="extension">File Extension</option>
              <option value="nameContains">Filename Contains</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-400 mb-1">Pattern</label>
            <input
              type="text"
              placeholder={newRuleType === 'extension' ? 'e.g. log or raw' : 'e.g. invoice or draft'}
              value={newRulePattern}
              onChange={(e) => setNewRulePattern(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100/80 dark:bg-white/[0.05] border border-black/[0.04] dark:border-white/[0.06] font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-400 mb-1">Target Folder</label>
            <select
              value={newRuleCategory}
              onChange={(e) => setNewRuleCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100/80 dark:bg-white/[0.05] border border-black/[0.04] dark:border-white/[0.06] font-semibold"
            >
              {categories.map((c) => (
                <option key={c.key} value={c.key}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 font-bold rounded-2xl bg-purple-600 hover:bg-purple-500 text-white shadow-soft btn-bounce"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Rule</span>
            </button>
          </div>
        </form>

        {rules.length > 0 && (
          <div className="pt-2 divide-y divide-black/[0.03] dark:divide-white/[0.04] text-xs">
            {rules.map((rule) => (
              <div key={rule.id} className="py-2.5 flex items-center justify-between font-mono">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    If {rule.type} matches "{rule.pattern}"
                  </span>
                  <span className="text-slate-400"> &rarr; route to </span>
                  <span className="text-purple-600 dark:text-purple-400 font-bold">{rule.target_category}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Secure Auto-Updates & Version Manifest */}
      <div className="p-7 rounded-3xl bg-white/80 dark:bg-surface-dark-card/80 backdrop-blur-md border border-black/[0.05] dark:border-white/[0.06] shadow-soft space-y-5">
        <div className="flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.05] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-sky-100 dark:bg-sky-950/50 text-sky-600 dark:text-sky-300">
              <RefreshCw className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200 font-display">
              Updates &amp; Release Channel
            </h4>
          </div>
          <button
            onClick={checkUpdate}
            disabled={checkingUpdate}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-200 transition-all btn-bounce"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checkingUpdate ? 'animate-spin' : ''}`} />
            <span>Check for Updates</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-black/[0.03] dark:border-white/[0.04]">
            <span className="text-slate-400 block font-semibold">Installed Version</span>
            <span className="font-extrabold text-slate-900 dark:text-white font-display text-sm">v1.2.0 (Build 1204)</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-black/[0.03] dark:border-white/[0.04]">
            <span className="text-slate-400 block font-semibold">Channel</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Stable (RSA-4096 Signed)</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-black/[0.03] dark:border-white/[0.04]">
            <span className="text-slate-400 block font-semibold">Status</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {updateInfo?.updateAvailable ? 'Update Available!' : 'Up to date'}
            </span>
          </div>
        </div>

        {updateInfo?.releaseNotes && (
          <div className="space-y-2 pt-1">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-display">Release Notes v1.2.0</span>
            <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
              {updateInfo.releaseNotes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Privacy Sanctuary Verification */}
      <div className="p-7 rounded-3xl bg-white/80 dark:bg-surface-dark-card/80 backdrop-blur-md border border-black/[0.05] dark:border-white/[0.06] shadow-soft space-y-4">
        <div className="flex items-center gap-2.5 border-b border-black/[0.04] dark:border-white/[0.05] pb-3.5">
          <div className="p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-300">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200 font-display">Local Privacy Guarantee</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03]">
            <span className="font-bold text-slate-900 dark:text-slate-200 block mb-1">Embedded SQLite</span>
            <span>Zero cloud databases. Transactions journaled to local WAL file.</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03]">
            <span className="font-bold text-slate-900 dark:text-slate-200 block mb-1">Magic Signatures</span>
            <span>Local 512-byte binary header inspection in client memory.</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03]">
            <span className="font-bold text-slate-900 dark:text-slate-200 block mb-1">Air-Gapped Core</span>
            <span>0% Cloud telemetry. Runs completely offline without internet.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
