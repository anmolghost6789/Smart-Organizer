import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { FilesView } from './components/FilesView';
import { CategoriesView } from './components/CategoriesView';
import { DuplicateFinderView } from './components/DuplicateFinderView';
import { StorageAnalysisView } from './components/StorageAnalysisView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { OrganizeModal } from './components/OrganizeModal';

export default function App() {
  const [currentTab, setTab] = useState('dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [scanPath, setScanPath] = useState('');
  const [stats, setStats] = useState(null);
  const [files, setFiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [duplicates, setDuplicates] = useState(null);
  const [scanStatus, setScanStatus] = useState('idle');
  const [scanProgress, setScanProgress] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isOrganizeModalOpen, setOrganizeModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [organizeConfig, setOrganizeConfig] = useState({
    folderName: 'Smart Organizer',
    mode: 'move',
    conflictResolution: 'smart-rename',
    groupByDate: false
  });

  // Apply theme class
  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Initial load
  useEffect(() => {
    fetchStats();
    fetchCategories();
    fetchFiles();
    fetchDuplicates();

    // Default scanPath: try getting cwd or sample
    if (!scanPath) {
      setScanPath(window.location.hostname === 'localhost' ? 'd:\\coding\\desktopor\\test-vault' : '');
    }

    // Connect WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:${window.location.port || 3001}`;
    let ws;

    try {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'SCAN_PROGRESS') {
            setScanProgress(msg.payload);
            setScanStatus('scanning');
          } else if (msg.type === 'SCAN_COMPLETE') {
            setScanProgress(null);
          } else if (msg.type === 'ANALYSIS_COMPLETE') {
            setScanStatus('completed');
            fetchStats();
            fetchCategories();
            fetchFiles();
            fetchDuplicates();
            showToast('Scan and duplicate analysis complete!');
          }
        } catch {}
      };
    } catch {}

    return () => {
      if (ws) ws.close();
    };
  }, []);

  function showToast(text) {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 4000);
  }

  async function fetchStats() {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
      if (data.rootPath && !scanPath) {
        setScanPath(data.rootPath);
      }
    } catch (err) {}
  }

  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {}
  }

  async function fetchFiles() {
    try {
      const res = await fetch('/api/files?limit=1000');
      const data = await res.json();
      setFiles(data.files || []);
    } catch (err) {}
  }

  async function fetchDuplicates() {
    try {
      const res = await fetch('/api/duplicates');
      const data = await res.json();
      setDuplicates(data);
    } catch (err) {}
  }

  async function handleStartScan() {
    if (!scanPath) return;
    try {
      setScanStatus('scanning');
      setScanProgress({ percent: 0, processedFiles: 0, processedBytes: 0, currentFile: 'Initializing...' });
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folderPath: scanPath,
          computeDuplicates: true,
          computePerceptual: true
        })
      });
      if (!res.ok) {
        const err = await res.json();
        setScanStatus('idle');
        alert(err.error || 'Failed to start scan');
      }
    } catch (err) {
      setScanStatus('idle');
      alert(err.message);
    }
  }

  async function handleRevealPath(targetPath) {
    try {
      await fetch('/api/open-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetPath })
      });
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteDuplicates(filePaths, moveToTrash) {
    try {
      const res = await fetch('/api/duplicates/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePaths, moveToTrash })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Successfully deleted ${data.deletedCount} files (Reclaimed ${data.formattedRecovered})`);
        fetchStats();
        fetchDuplicates();
        fetchFiles();
        fetchCategories();
      }
    } catch (err) {
      alert(err.message);
    }
  }

  function handleSelectCategory(catKey) {
    setSelectedCategory(catKey);
    setTab('files');
  }

  const titles = {
    dashboard: 'Dashboard',
    files: 'All Files',
    categories: 'Categories',
    duplicates: 'Duplicate Finder',
    storage: 'Storage Analysis',
    history: 'Scan History & Undo',
    settings: 'Settings'
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans">
      {/* Sidebar */}
      <Sidebar currentTab={currentTab} setTab={setTab} stats={stats} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          currentTabTitle={titles[currentTab] || 'Smart Organizer'}
          theme={theme}
          setTheme={setTheme}
          scanPath={scanPath}
          setScanPath={setScanPath}
          onStartScan={handleStartScan}
          onOpenOrganizeModal={() => setOrganizeModalOpen(true)}
          scanStatus={scanStatus}
          stats={stats}
        />

        {/* Dynamic View Container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <DashboardView
                stats={stats}
                categories={categories}
                onStartScan={handleStartScan}
                onOpenOrganizeModal={() => setOrganizeModalOpen(true)}
                setTab={setTab}
                scanPath={scanPath}
                setScanPath={setScanPath}
                scanStatus={scanStatus}
                scanProgress={scanProgress}
              />
            )}

            {currentTab === 'files' && (
              <FilesView
                files={files}
                categories={categories}
                onRevealPath={handleRevealPath}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            )}

            {currentTab === 'categories' && (
              <CategoriesView
                categories={categories}
                onSelectCategory={handleSelectCategory}
                onOrganizeCategory={(catKey) => {
                  setSelectedCategory(catKey);
                  setOrganizeModalOpen(true);
                }}
              />
            )}

            {currentTab === 'duplicates' && (
              <DuplicateFinderView
                duplicates={duplicates}
                onRevealPath={handleRevealPath}
                onDeleteDuplicates={handleDeleteDuplicates}
              />
            )}

            {currentTab === 'storage' && (
              <StorageAnalysisView onRevealPath={handleRevealPath} />
            )}

            {currentTab === 'history' && (
              <HistoryView />
            )}

            {currentTab === 'settings' && (
              <SettingsView
                organizeConfig={organizeConfig}
                setOrganizeConfig={setOrganizeConfig}
                categories={categories}
              />
            )}
          </div>
        </main>
      </div>

      {/* Organization Modal */}
      <OrganizeModal
        isOpen={isOrganizeModalOpen}
        onClose={() => setOrganizeModalOpen(false)}
        targetDir={scanPath}
        organizeConfig={organizeConfig}
        onSuccess={() => {
          fetchStats();
          fetchFiles();
          fetchCategories();
          showToast('Organization executed successfully!');
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-2xl animate-fade-in flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
