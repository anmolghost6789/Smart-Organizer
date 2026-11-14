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
  FileText
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <header className="h-16 px-6 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
            <FolderTree className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Smart Organizer</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Web Edition
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onBackToLanding}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Product Website
          </button>
          <button
            onClick={onOpenDesktopApp}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 shadow-sm transition-all"
          >
            Switch to Desktop Engine
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-6">
        {/* Privacy & Permission Guarantee Banner */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200/80 dark:border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 flex-shrink-0" />
            <div>
              <span className="font-semibold block">100% In-Browser Privacy Protection</span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                All file hashing, magic-byte inspection, and duplicate detection execute in client memory via Web Crypto. Zero bytes leave your device.
              </span>
            </div>
          </div>
        </div>

        {/* Folder Selection Controls */}
        <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
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
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Choose Folder (File System Access)</span>
            </button>

            {/* Standard Directory Input Fallback */}
            <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold cursor-pointer transition-all">
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
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all active:scale-95 ml-auto"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? `Zipping (${exportProgress}%)...` : 'Download Organized ZIP'}</span>
              </button>
            )}
          </div>

          {/* Scanning Progress Bar */}
          {isScanning && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs text-slate-500 font-mono">
                <span>Analyzing binary signatures &amp; computing SHA-256 in browser...</span>
                <span>{scanProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-sky-500 h-2 rounded-full transition-all duration-200"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Dashboard KPIs */}
        {files.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs text-slate-400">Files Processed</span>
              <div className="text-xl font-bold mt-1">{files.length.toLocaleString()}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs text-slate-400">Total Storage</span>
              <div className="text-xl font-bold mt-1">{formatBytes(totalBytes)}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs text-slate-400">Confirmed Duplicates</span>
              <div className="text-xl font-bold text-amber-500 mt-1">
                {duplicates?.totalExactGroups || 0} Sets ({duplicates?.totalRedundantFiles || 0} copies)
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs text-slate-400">Recoverable Storage</span>
              <div className="text-xl font-bold text-purple-500 mt-1">
                {duplicates?.formattedSavings || '0 B'}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        {files.length > 0 && (
          <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold space-x-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`pb-3 transition-colors ${activeTab === 'dashboard' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              All Files ({files.length})
            </button>
            <button
              onClick={() => setActiveTab('duplicates')}
              className={`pb-3 transition-colors ${activeTab === 'duplicates' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              Duplicate Finder ({duplicates?.totalExactGroups || 0})
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`pb-3 transition-colors ${activeTab === 'categories' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
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
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              >
                <option value="All">All Categories</option>
                {Object.keys(BROWSER_CATEGORIES).map(k => (
                  <option key={k} value={k}>{BROWSER_CATEGORIES[k].folder}</option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 font-semibold">
                    <th className="py-3 px-4">Filename</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-4">Signature</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
                  {filteredFiles.slice(0, 100).map(file => (
                    <tr key={file.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 px-4 font-sans font-medium text-slate-800 dark:text-slate-200 truncate max-w-sm">
                        {file.name}
                      </td>
                      <td className="py-2.5 px-4 font-sans">
                        <span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {BROWSER_CATEGORIES[file.category]?.folder || 'Other'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-500">{formatBytes(file.size)}</td>
                      <td className="py-2.5 px-4">
                        {file.magicDetected ? (
                          <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded border border-emerald-500/20">
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
              <div className="py-16 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto stroke-1" />
                <h4 className="text-sm font-semibold">No Duplicates Found</h4>
                <p className="text-xs text-slate-400">All filenames and SHA-256 hashes in this folder are unique</p>
              </div>
            ) : (
              duplicates.exactDuplicates.map((group, idx) => (
                <div key={group.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Duplicate Set #{idx + 1}: <span className="font-mono text-sky-600 dark:text-sky-400">{group.canonicalName}</span>
                    </span>
                    <span className="font-bold text-amber-500">{formatBytes(group.potentialSaving)} recoverable</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {group.files.map(f => (
                      <div key={f.id} className={`p-3 rounded-xl flex items-center justify-between ${f.isRecommendedKeep ? 'bg-emerald-50/50 dark:bg-emerald-500/10 border border-emerald-500/20' : 'bg-slate-50 dark:bg-slate-800/40'}`}>
                        <div>
                          <div className="font-semibold">{f.name}</div>
                          <div className="text-[10px] text-slate-400">{f.keepReason}</div>
                        </div>
                        <div className="font-mono text-slate-500">{formatBytes(f.size)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Categories */}
        {files.length > 0 && activeTab === 'categories' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Object.entries(BROWSER_CATEGORIES).map(([key, cat]) => {
              const count = files.filter(f => f.category === key).length;
              const size = files.filter(f => f.category === key).reduce((sum, f) => sum + f.size, 0);

              return (
                <div key={key} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    📁 {cat.folder}
                  </div>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-sm font-bold">{count} {count === 1 ? 'file' : 'files'}</span>
                    <span className="text-[10px] text-slate-400">{formatBytes(size)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-2xl flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
