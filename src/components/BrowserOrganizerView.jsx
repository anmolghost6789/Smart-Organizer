import React, { useState } from 'react';
import {
  FolderOpen,
  ShieldCheck,
  Play,
  Download,
  Copy,
  Files,
  HardDrive,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FolderTree,
  ExternalLink,
  Search,
  ArrowRight,
  Layers,
  X,
  FileText,
  Crown
} from 'lucide-react';
import {
  BROWSER_CATEGORIES,
  identifyMagicBytesInBrowser,
  determineBrowserCategory,
  computeBrowserSha256,
  detectDuplicatesInBrowser,
  createOrganizedZipInBrowser,
  formatBytes
} from '../core/browserProcessor';

export function BrowserOrganizerView({ onBackToLanding, onOpenDesktopApp }) {
  const [files, setFiles] = useState([]);
  const [folderName, setFolderName] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'files', 'categories', 'duplicates'
  const [duplicates, setDuplicates] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }

  // 1. Native File System Access API (Chrome/Edge/Android Chrome)
  async function handlePickDirectoryNative() {
    try {
      if (!window.showDirectoryPicker) {
        throw new Error('Native File System Access API is not supported in this browser. Please use the Directory Input button.');
      }

      const dirHandle = await window.showDirectoryPicker({ mode: 'read' });
      setFolderName(dirHandle.name);
      setPermissionGranted(true);
      await processDirectoryHandle(dirHandle);
    } catch (err) {
      if (err.name !== 'AbortError') {
        alert(err.message);
      }
    }
  }

  async function processDirectoryHandle(dirHandle) {
    setIsScanning(true);
    setScanProgress(0);

    const directFiles = [];

    // STRICT NON-RECURSIVE RULE: Only inspect direct files inside selected folder!
    for await (const [name, handle] of dirHandle.entries()) {
      if (handle.kind === 'file') {
        const file = await handle.getFile();
        directFiles.push(file);
      }
      // If handle.kind === 'directory': SKIP! Never enter nested folders!
    }

    await analyzeCollectedFiles(directFiles);
  }

  // 2. Standard Browser Fallback (<input webkitdirectory />)
  async function handlePickDirectoryFallback(e) {
    const rawList = Array.from(e.target.files || []);
    if (rawList.length === 0) return;

    setPermissionGranted(true);
    setIsScanning(true);
    setScanProgress(0);

    // Filter strictly direct files only (path depth === 1)
    const directFiles = rawList.filter(f => {
      const relPath = f.webkitRelativePath || f.name;
      const parts = relPath.split('/');
      return parts.length <= 2; // rootFolder/file.ext
    });

    if (rawList[0]?.webkitRelativePath) {
      setFolderName(rawList[0].webkitRelativePath.split('/')[0]);
    } else {
      setFolderName('Selected Folder');
    }

    await analyzeCollectedFiles(directFiles);
  }

  async function analyzeCollectedFiles(rawFiles) {
    const analyzed = [];
    const total = rawFiles.length;

    for (let i = 0; i < total; i++) {
      const rawFile = rawFiles[i];
      const magic = await identifyMagicBytesInBrowser(rawFile);
      const category = determineBrowserCategory(rawFile.name, magic);

      analyzed.push({
        id: Math.random().toString(36).substring(2),
        name: rawFile.name,
        size: rawFile.size,
        category,
        magicDetected: !!magic,
        mime: magic?.mime || rawFile.type || 'application/octet-stream',
        extension: rawFile.name.split('.').pop().toLowerCase(),
        lastModified: rawFile.lastModified,
        rawFile
      });

      if ((i + 1) % 10 === 0 || i === total - 1) {
        setScanProgress(Math.round(((i + 1) / total) * 100));
      }
    }

    setFiles(analyzed);
    setIsScanning(false);

    // Compute duplicates with strict rules
    const dupResult = await detectDuplicatesInBrowser(analyzed);
    setDuplicates(dupResult);

    showToast(`Successfully analyzed ${analyzed.length} local files entirely in your browser!`);
  }

  // 3. Export as Organized ZIP
  async function handleExportZip() {
    if (files.length === 0) return;
    try {
      setIsExporting(true);
      setExportProgress(0);

      const blob = await createOrganizedZipInBrowser(files, { folderName: 'Smart Organizer' }, (prog) => {
        setExportProgress(prog.percent || 0);
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${folderName || 'files'}_organized.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsExporting(false);
      showToast('Organized ZIP archive downloaded successfully!');
    } catch (err) {
      setIsExporting(false);
      alert('Export failed: ' + err.message);
    }
  }

  // Filter files
  const filteredFiles = files.filter(f => {
    if (selectedCategory !== 'All' && f.category !== selectedCategory) return false;
    if (searchTerm && !f.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const totalBytes = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#0D0F17] text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Floating Header */}
      <header className="h-18 px-6 border-b border-black/[0.04] dark:border-white/[0.05] bg-[#F8F7F4]/80 dark:bg-[#0D0F17]/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 via-pink-400 to-amber-300 p-0.5 shadow-soft">
            <div className="w-full h-full bg-white dark:bg-surface-dark-card rounded-[14px] flex items-center justify-center text-purple-600 dark:text-purple-300">
              <FolderTree className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-slate-950 dark:text-white font-display flex items-center gap-2">
              <span>Smart Organizer</span>
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Web Edition
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onBackToLanding}
            className="px-4 py-2 text-xs font-bold rounded-2xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors btn-bounce"
          >
            Product Website
          </button>
          <button
            onClick={onOpenDesktopApp}
            className="px-4 py-2 text-xs font-bold rounded-2xl bg-slate-950 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 shadow-soft transition-all btn-bounce"
          >
            Switch to Desktop Engine
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-6">
        {/* Privacy & Permission Guarantee Banner */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-pastel-mint-50/80 via-pastel-lavender-50/40 to-pastel-mint-50/80 dark:from-emerald-950/20 dark:via-purple-950/10 dark:to-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/40 shadow-soft-sm flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-900 dark:text-emerald-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-emerald-200/60 dark:bg-emerald-800/50 text-emerald-800 dark:text-emerald-200">
              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
            </div>
            <div>
              <span className="font-extrabold font-display block text-sm">100% In-Browser Privacy Protection</span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                All file hashing, magic-byte inspection, and duplicate detection execute in client memory via Web Crypto. Zero bytes leave your device.
              </span>
            </div>
          </div>
        </div>

        {/* Folder Selection Controls */}
        <div className="p-8 sm:p-9 rounded-4xl bg-white dark:bg-surface-dark-card border border-black/[0.05] dark:border-white/[0.06] shadow-soft space-y-5">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight font-display text-slate-950 dark:text-white">
              Select a Local Folder to Organize
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Only direct files in the chosen folder are inspected. Nested subfolders are strictly isolated and never entered.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* Native Directory Picker */}
            <button
              onClick={handlePickDirectoryNative}
              disabled={isScanning}
              className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-soft transition-all btn-bounce disabled:opacity-50"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Choose Folder (File System Access)</span>
            </button>

            {/* Standard Directory Input Fallback */}
            <label className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.08] text-slate-800 dark:text-slate-200 text-xs font-bold cursor-pointer transition-all btn-bounce">
              <FolderTree className="w-4 h-4 text-slate-400" />
              <span>Browse Folder (Standard Input)</span>
              <input
                type="file"
                webkitdirectory="true"
                directory="true"
                multiple
                onChange={handlePickDirectoryFallback}
                className="hidden"
              />
            </label>

            {files.length > 0 && (
              <button
                onClick={handleExportZip}
                disabled={isExporting}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-soft transition-all btn-bounce ml-auto"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? `Zipping (${exportProgress}%)...` : 'Download Organized ZIP'}</span>
              </button>
            )}
          </div>

          {/* Scanning Progress Bar */}
          {isScanning && (
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs text-slate-500 font-mono font-semibold">
                <span>Analyzing binary signatures &amp; computing SHA-256 in browser...</span>
                <span>{scanProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-white/[0.06] rounded-full h-2.5 overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-purple-500 via-pink-400 to-amber-300 h-full rounded-full transition-all duration-200"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Dashboard KPIs Bento */}
        {files.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-pastel-sky-50/70 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-800/30 shadow-soft-sm">
              <span className="text-[11px] font-bold text-sky-800 dark:text-sky-300">Files Processed</span>
              <div className="text-2xl font-extrabold text-sky-950 dark:text-white font-display mt-1">
                {files.length.toLocaleString()}
              </div>
            </div>
            <div className="p-5 rounded-3xl bg-pastel-lavender-50/70 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-800/30 shadow-soft-sm">
              <span className="text-[11px] font-bold text-purple-800 dark:text-purple-300">Total Storage</span>
              <div className="text-2xl font-extrabold text-purple-950 dark:text-white font-display mt-1">
                {formatBytes(totalBytes)}
              </div>
            </div>
            <div className="p-5 rounded-3xl bg-pastel-peach-50/70 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-800/30 shadow-soft-sm">
              <span className="text-[11px] font-bold text-orange-800 dark:text-orange-300">Confirmed Duplicates</span>
              <div className="text-2xl font-extrabold text-orange-950 dark:text-white font-display mt-1">
                {duplicates?.totalExactGroups || 0} Sets ({duplicates?.totalRedundantFiles || 0} copies)
              </div>
            </div>
            <div className="p-5 rounded-3xl bg-pastel-mint-50/70 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/30 shadow-soft-sm">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">Recoverable Storage</span>
              <div className="text-2xl font-extrabold text-emerald-950 dark:text-white font-display mt-1">
                {duplicates?.formattedSavings || '0 B'}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        {files.length > 0 && (
          <div className="flex border-b border-black/[0.04] dark:border-white/[0.05] text-xs font-bold space-x-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`pb-3 transition-colors ${activeTab === 'dashboard' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'}`}
            >
              All Files ({files.length})
            </button>
            <button
              onClick={() => setActiveTab('duplicates')}
              className={`pb-3 transition-colors ${activeTab === 'duplicates' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'}`}
            >
              Duplicate Finder ({duplicates?.totalExactGroups || 0})
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`pb-3 transition-colors ${activeTab === 'categories' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'}`}
            >
              Categories
            </button>
          </div>
        )}

        {/* Tab 1: All Files */}
        {files.length > 0 && activeTab === 'dashboard' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Filter by filename..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-2xl bg-white dark:bg-surface-dark-card border border-black/[0.05] dark:border-white/[0.06] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400/40"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3.5 py-2 text-xs rounded-2xl bg-white dark:bg-surface-dark-card border border-black/[0.05] dark:border-white/[0.06] font-semibold"
              >
                <option value="All">All Categories</option>
                {Object.keys(BROWSER_CATEGORIES).map(k => (
                  <option key={k} value={k}>{BROWSER_CATEGORIES[k].folder}</option>
                ))}
              </select>
            </div>

            <div className="rounded-3xl bg-white dark:bg-surface-dark-card border border-black/[0.05] dark:border-white/[0.06] overflow-hidden shadow-soft">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-black/[0.04] dark:border-white/[0.05] bg-slate-50/60 dark:bg-white/[0.02] text-slate-500 font-bold">
                    <th className="py-3 px-5">Filename</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-5">Signature</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.04] font-mono text-[11px]">
                  {filteredFiles.slice(0, 100).map(file => (
                    <tr key={file.id} className="hover:bg-purple-50/40 dark:hover:bg-purple-950/20">
                      <td className="py-2.5 px-5 font-sans font-bold text-slate-800 dark:text-slate-200 truncate max-w-sm">
                        {file.name}
                      </td>
                      <td className="py-2.5 px-4 font-sans">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300">
                          {BROWSER_CATEGORIES[file.category]?.folder || 'Other'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 font-semibold">{formatBytes(file.size)}</td>
                      <td className="py-2.5 px-5">
                        {file.magicDetected ? (
                          <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-300/40 flex items-center gap-1 w-max">
                            <Sparkles className="w-2.5 h-2.5" />
                            Verified Byte
                          </span>
                        ) : (
                          <span className="text-slate-400">.{file.extension}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Duplicates */}
        {files.length > 0 && activeTab === 'duplicates' && (
          <div className="space-y-4">
            {(!duplicates?.exactDuplicates || duplicates.exactDuplicates.length === 0) ? (
              <div className="py-20 text-center rounded-3xl bg-white dark:bg-surface-dark-card border border-black/[0.05] dark:border-white/[0.06] space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto stroke-1" />
                <h4 className="text-sm font-bold font-display">No Duplicates Found</h4>
                <p className="text-xs text-slate-400">All filenames and SHA-256 hashes in this folder are unique</p>
              </div>
            ) : (
              duplicates.exactDuplicates.map((group, idx) => (
                <div key={group.id} className="p-6 rounded-3xl bg-white dark:bg-surface-dark-card border border-black/[0.05] dark:border-white/[0.06] shadow-soft space-y-3">
                  <div className="flex items-center justify-between text-xs border-b border-black/[0.04] dark:border-white/[0.05] pb-2.5">
                    <span className="font-bold text-slate-900 dark:text-slate-100 font-display">
                      Set #{idx + 1}: <span className="font-mono text-purple-600 dark:text-purple-400">{group.canonicalName}</span>
                    </span>
                    <span className="font-bold text-amber-500">{formatBytes(group.potentialSaving)} recoverable</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {group.files.map(f => (
                      <div key={f.id} className={`p-3.5 rounded-2xl flex items-center justify-between ${f.isRecommendedKeep ? 'bg-pastel-mint-50/60 dark:bg-emerald-950/20 border border-emerald-500/20' : 'bg-slate-50 dark:bg-white/[0.03]'}`}>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{f.name}</span>
                            {f.isRecommendedKeep && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                <Crown className="w-3 h-3 text-amber-500 fill-amber-400" />
                                Keeper
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{f.keepReason}</div>
                        </div>
                        <div className="font-mono text-slate-500 font-semibold">{formatBytes(f.size)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Categories (Pinterest Bento Grid) */}
        {files.length > 0 && activeTab === 'categories' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Object.entries(BROWSER_CATEGORIES).map(([key, cat]) => {
              const count = files.filter(f => f.category === key).length;
              const size = files.filter(f => f.category === key).reduce((sum, f) => sum + f.size, 0);

              return (
                <div key={key} className="p-5 rounded-3xl bg-white dark:bg-surface-dark-card border border-black/[0.05] dark:border-white/[0.06] shadow-soft card-hover">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate font-display">
                    📁 {cat.folder}
                  </div>
                  <div className="flex items-baseline justify-between mt-3">
                    <span className="text-sm font-extrabold font-display">{count} {count === 1 ? 'file' : 'files'}</span>
                    <span className="text-[10px] font-mono text-slate-400">{formatBytes(size)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-bold shadow-soft-xl flex items-center gap-2 animate-bounce">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
