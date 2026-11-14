import React, { useState, useEffect } from 'react';
import {
  Settings,
  Plus,
  Trash2,
  ShieldCheck,
  FolderTree,
  Database,
  Sliders,
  CheckCircle2
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

  useEffect(() => {
    fetchRules();
  }, []);

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
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Application Settings &amp; Rules</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure organization behavior, custom category overrides, and local storage policies
        </p>
      </div>

      {/* Organization Defaults */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Sliders className="w-4 h-4 text-sky-600" />
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Organization Defaults</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
              Root Organizer Folder Name
            </label>
            <input
              type="text"
              value={organizeConfig.folderName}
              onChange={(e) => setOrganizeConfig({ ...organizeConfig, folderName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
              Operation Mode
            </label>
            <select
              value={organizeConfig.mode}
              onChange={(e) => setOrganizeConfig({ ...organizeConfig, mode: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="move">Move files (Clean original folder)</option>
              <option value="copy">Copy files (Keep originals intact)</option>
            </select>
          </div>

          <div>
            <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
              Naming Collision Resolution
            </label>
            <select
              value={organizeConfig.conflictResolution}
              onChange={(e) => setOrganizeConfig({ ...organizeConfig, conflictResolution: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="smart-rename">Smart Rename (e.g. photo (1).jpg)</option>
              <option value="skip">Skip file if name exists</option>
              <option value="overwrite">Overwrite existing target</option>
            </select>
          </div>

          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={organizeConfig.groupByDate}
                onChange={(e) => setOrganizeConfig({ ...organizeConfig, groupByDate: e.target.checked })}
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500/30"
              />
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Group Photos into Date Subfolders (YYYY/MM)
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Custom Rules Section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <FolderTree className="w-4 h-4 text-indigo-600" />
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Custom Organization Rules</h4>
        </div>

        {ruleMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{ruleMessage}</span>
          </div>
        )}

        <form onSubmit={handleAddRule} className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Rule Condition</label>
            <select
              value={newRuleType}
              onChange={(e) => setNewRuleType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <option value="extension">File Extension</option>
              <option value="nameContains">Filename Contains</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Match Pattern</label>
            <input
              type="text"
              placeholder={newRuleType === 'extension' ? 'e.g. log or torrent' : 'e.g. invoice or bank'}
              value={newRulePattern}
              onChange={(e) => setNewRulePattern(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Target Category</label>
            <select
              value={newRuleCategory}
              onChange={(e) => setNewRuleCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              {categories.map((c) => (
                <option key={c.key} value={c.key}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2 font-semibold rounded-xl bg-sky-600 hover:bg-sky-700 text-white"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Rule</span>
            </button>
          </div>
        </form>

        {rules.length > 0 && (
          <div className="pt-2 divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {rules.map((rule) => (
              <div key={rule.id} className="py-2.5 flex items-center justify-between font-mono">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    If {rule.type} matches "{rule.pattern}"
                  </span>
                  <span className="text-slate-400"> &rarr; route to </span>
                  <span className="text-sky-600 dark:text-sky-400 font-semibold">{rule.target_category}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Privacy & System Architecture Verification */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Local-First Architecture &amp; Privacy</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <span className="font-semibold text-slate-900 dark:text-slate-200 block">Database</span>
            <span>Embedded SQLite WAL Engine (Zero network dependencies)</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <span className="font-semibold text-slate-900 dark:text-slate-200 block">Signatures</span>
            <span>Local 512-byte binary header magic byte inspection</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <span className="font-semibold text-slate-900 dark:text-slate-200 block">Telemetry</span>
            <span>0% Cloud Traffic. Air-gapped and fully functional offline.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
