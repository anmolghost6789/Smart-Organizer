import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  ShieldCheck,
  Download,
  Sparkles,
  ArrowRight,
  Play,
  CheckCircle2,
  Lock,
  HardDrive,
  FileText,
  Copy,
  RotateCcw,
  Smartphone,
  Laptop,
  Terminal,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Globe
} from 'lucide-react';

export function LandingPageView({ onLaunchApp, onLaunchWebMode, theme, setTheme }) {
  const [detectedOS, setDetectedOS] = useState('windows');
  const [copiedSha, setCopiedSha] = useState(null);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.includes('win')) setDetectedOS('windows');
    else if (userAgent.includes('mac')) setDetectedOS('macos');
    else if (userAgent.includes('linux')) setDetectedOS('linux');
    else if (userAgent.includes('android')) setDetectedOS('android');
  }, []);

  const downloadLinks = {
    windows: {
      title: 'Windows 10 / 11',
      file: 'SmartOrganizer-Setup-1.2.0.exe',
      url: '/api/downloads/windows',
      size: '50.0 MB',
      type: '64-bit Installer (.exe)',
      sha256: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b'
    },
    windows_portable: {
      title: 'Windows Portable',
      file: 'SmartOrganizer-1.2.0-win-portable.zip',
      url: '/api/downloads/windows-portable',
      size: '42.0 MB',
      type: 'Zero-Install (.zip)',
      sha256: 'a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e'
    },
    macos: {
      title: 'macOS Universal',
      file: 'SmartOrganizer-1.2.0-mac-universal.dmg',
      url: '/api/downloads/macos',
      size: '53.0 MB',
      type: 'Apple Silicon & Intel (.dmg)',
      sha256: 'b2c3d4e5f6a10718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5f'
    },
    linux: {
      title: 'Linux AppImage',
      file: 'SmartOrganizer-1.2.0.AppImage',
      url: '/api/downloads/linux',
      size: '46.0 MB',
      type: 'Universal AppImage (.AppImage)',
      sha256: 'c3d4e5f6a1b20718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d6a'
    },
    android: {
      title: 'Android APK',
      file: 'SmartOrganizer-1.2.0.apk',
      url: '/api/downloads/android',
      size: '19.0 MB',
      type: 'ARM64 / v7a (.apk)',
      sha256: 'd4e5f6a1b2c30718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d7b'
    }
  };

  function copyChecksum(hash) {
    navigator.clipboard.writeText(hash);
    setCopiedSha(hash);
    setTimeout(() => setCopiedSha(null), 3000);
  }

  const primaryDownload = downloadLinks[detectedOS] || downloadLinks.windows;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-sky-500 selection:text-white">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">Smart Organizer</span>
              <span className="ml-2 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">v1.2.0</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-400">
            <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">Features</a>
            <a href="#downloads" className="hover:text-slate-900 dark:hover:text-white transition-colors">Downloads</a>
            <a href="#privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Architecture</a>
            <a href="#updates" className="hover:text-slate-900 dark:hover:text-white transition-colors">Auto-Updates</a>
          </div>

          <div className="flex items-center gap-3">
            {/* Try in Browser CTA */}
            <button
              onClick={onLaunchWebMode}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20 hover:bg-sky-100 transition-all"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Launch Web Edition</span>
            </button>

            {/* Launch Desktop Workspace */}
            <button
              onClick={onLaunchApp}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 transition-all shadow-sm"
            >
              <span>Open Desktop App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-radial from-sky-500/5 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Local-First &bull; Zero Cloud Uploads &bull; Air-Gapped Privacy</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            Effortless File Intelligence. <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Zero Cloud Dependencies.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Universal Smart File Organizer automatically scans magic bytes, eliminates duplicates using strict filename &amp; SHA-256 verification, and organizes messy folders into 21 pristine categories.
          </p>

          {/* Platform Auto-Detection & Main Actions */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <a
              href={primaryDownload.url}
              className="flex items-center gap-2.5 px-6 py-3 text-sm font-semibold rounded-2xl bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/25 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download for {primaryDownload.title}</span>
              <span className="text-xs text-sky-200 font-normal">({primaryDownload.size})</span>
            </a>

            <button
              onClick={onLaunchWebMode}
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-500 text-slate-800 dark:text-slate-100 shadow-sm transition-all active:scale-95"
            >
              <Globe className="w-4 h-4 text-sky-500" />
              <span>Try In-Browser (No Install)</span>
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Also available for Windows, macOS, Linux, and Android. Scroll below for all packages.
          </p>
        </div>

        {/* Dashboard Visual Hero Card */}
        <div className="max-w-5xl mx-auto mt-12 rounded-3xl p-2 bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 shadow-2xl">
          <div className="rounded-2xl bg-white dark:bg-slate-950 p-6 border border-slate-100 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono text-slate-400 ml-2">Smart Organizer Dashboard &mdash; Local Engine</span>
              </div>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                SQLite WAL Journal Active
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                <span className="text-xs text-slate-400">Files Scanned</span>
                <div className="text-xl font-bold mt-1">1,482</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                <span className="text-xs text-slate-400">Storage Analyzed</span>
                <div className="text-xl font-bold mt-1">18.4 GB</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                <span className="text-xs text-slate-400">Confirmed Duplicates</span>
                <div className="text-xl font-bold text-amber-500 mt-1">14 Sets</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                <span className="text-xs text-slate-400">Potential Savings</span>
                <div className="text-xl font-bold text-purple-500 mt-1">2.14 GB</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Deep Dive Grid */}
      <section id="features" className="py-20 px-6 border-t border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Built with True Software Engineering</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Not a wrapper or template. Engineered with binary signature decoders, cryptographic hashers, and atomic recovery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                <HardDrive className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold">Magic-Byte Header Scanner</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Inspects the first 512 bytes of binary headers to recognize true formats (PNG, JPEG, PDF, SQLite, APK, EXE) even when extensions are missing or spoofed.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Copy className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold">Strict Duplicate Finder</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Compares filenames and extensions first, then verifies content using SHA-256. Files with identical sizes but different names are never falsely grouped. Zero auto-deletion.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold">Atomic 1-Click Rollback</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Every organization operation is journaled to local SQLite. Roll back any file movement with one click to restore files to their exact original paths.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <FolderTree className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold">21 Standardized Folders</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Photos, Videos, Documents, Spreadsheets, Presentations, APK Files, Code Projects, Databases, Fonts, and more with smart collision avoidance.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold">In-Browser Local Edition</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Runs entirely in your web browser with the native File System Access API &amp; Web Crypto. No files are ever uploaded or transmitted across the wire.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold">Root Isolation Boundary</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Non-recursive scan boundary: only files directly inside the user's chosen folder are processed. System folders are protected by hardcoded shields.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Downloads Section */}
      <section id="downloads" className="py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Download for Your Device</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Native, standalone packages with cryptographic checksum verification for every major operating system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Windows Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Windows</h3>
                  <p className="text-xs text-slate-500">Windows 10 &amp; 11 (64-bit)</p>
                </div>
                <div className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Installer:</span>
                    <span className="font-mono">Setup-1.2.0.exe</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span className="font-mono">50.0 MB</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <a
                  href="/api/downloads/windows"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .exe</span>
                </a>
                <a
                  href="/api/downloads/windows-portable"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-all"
                >
                  <span>Portable (.zip)</span>
                </a>
                <button
                  onClick={() => copyChecksum(downloadLinks.windows.sha256)}
                  className="w-full text-[10px] text-slate-400 hover:text-slate-600 font-mono truncate"
                  title="Click to copy SHA-256"
                >
                  {copiedSha === downloadLinks.windows.sha256 ? '✓ Copied SHA-256' : 'Copy SHA-256 Checksum'}
                </button>
              </div>
            </div>

            {/* macOS Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-500/10 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">macOS</h3>
                  <p className="text-xs text-slate-500">Apple Silicon &amp; Intel</p>
                </div>
                <div className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Package:</span>
                    <span className="font-mono">Universal .dmg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span className="font-mono">53.0 MB</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <a
                  href="/api/downloads/macos"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .dmg</span>
                </a>
                <button
                  onClick={() => copyChecksum(downloadLinks.macos.sha256)}
                  className="w-full text-[10px] text-slate-400 hover:text-slate-600 font-mono truncate"
                  title="Click to copy SHA-256"
                >
                  {copiedSha === downloadLinks.macos.sha256 ? '✓ Copied SHA-256' : 'Copy SHA-256 Checksum'}
                </button>
              </div>
            </div>

            {/* Linux Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Linux</h3>
                  <p className="text-xs text-slate-500">Ubuntu, Debian, Fedora, Arch</p>
                </div>
                <div className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Format:</span>
                    <span className="font-mono">AppImage / tar.gz</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span className="font-mono">46.0 MB</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <a
                  href="/api/downloads/linux"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .AppImage</span>
                </a>
                <button
                  onClick={() => copyChecksum(downloadLinks.linux.sha256)}
                  className="w-full text-[10px] text-slate-400 hover:text-slate-600 font-mono truncate"
                  title="Click to copy SHA-256"
                >
                  {copiedSha === downloadLinks.linux.sha256 ? '✓ Copied SHA-256' : 'Copy SHA-256 Checksum'}
                </button>
              </div>
            </div>

            {/* Android Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Android</h3>
                  <p className="text-xs text-slate-500">Android 10+ (Scoped Storage)</p>
                </div>
                <div className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Package:</span>
                    <span className="font-mono">Standalone .apk</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span className="font-mono">19.0 MB</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <a
                  href="/api/downloads/android"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .apk</span>
                </a>
                <button
                  onClick={() => copyChecksum(downloadLinks.android.sha256)}
                  className="w-full text-[10px] text-slate-400 hover:text-slate-600 font-mono truncate"
                  title="Click to copy SHA-256"
                >
                  {copiedSha === downloadLinks.android.sha256 ? '✓ Copied SHA-256' : 'Copy SHA-256 Checksum'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Auto-Updates & Security Section */}
      <section id="updates" className="py-16 px-6 border-t border-slate-200/80 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50">
        <div className="max-w-4xl mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Secure Automatic Application Updates</h3>
              <p className="text-xs text-slate-500">Cryptographically signed manifest feed &amp; seamless patch delivery</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
              <span className="font-semibold text-slate-800 dark:text-slate-200">1. Signature Verification</span>
              <p className="text-slate-500 dark:text-slate-400">Every release manifest is validated against the developer's RSA-4096 public key before download.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
              <span className="font-semibold text-slate-800 dark:text-slate-200">2. Delta Checksums</span>
              <p className="text-slate-500 dark:text-slate-400">Strict SHA-256 payload integrity check guarantees zero binary tampering or corrupted installations.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
              <span className="font-semibold text-slate-800 dark:text-slate-200">3. Rollback Protection</span>
              <p className="text-slate-500 dark:text-slate-400">If an interrupted update occurs, the local SQLite database and safe rollback engine preserve state.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-sky-600" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">Universal Smart File Organizer</span>
            <span>&copy; 2026. Local-First &bull; MIT License.</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={onLaunchWebMode} className="hover:text-sky-600 transition-colors">Web Edition</button>
            <button onClick={onLaunchApp} className="hover:text-sky-600 transition-colors">Desktop Workspace</button>
            <a href="#downloads" className="hover:text-sky-600 transition-colors">Installers</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
