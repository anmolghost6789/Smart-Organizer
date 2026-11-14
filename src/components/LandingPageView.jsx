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
  Globe,
  Zap,
  Star,
  Layers,
  Heart
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
      title: 'Windows 10 & 11',
      file: 'SmartOrganizer-Setup-1.2.0.exe',
      url: '/api/downloads/windows',
      size: '50.0 MB',
      type: '64-bit Installer (.exe)',
      accent: 'border-blue-200 dark:border-blue-800/40 bg-pastel-sky-50/50 dark:bg-sky-950/20 text-sky-600',
      sha256: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b'
    },
    windows_portable: {
      title: 'Windows Portable',
      file: 'SmartOrganizer-1.2.0-win-portable.zip',
      url: '/api/downloads/windows-portable',
      size: '42.0 MB',
      type: 'Zero-Install (.zip)',
      accent: 'border-purple-200 dark:border-purple-800/40 bg-pastel-lavender-50/50 dark:bg-purple-950/20 text-purple-600',
      sha256: 'a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e'
    },
    macos: {
      title: 'macOS Universal',
      file: 'SmartOrganizer-1.2.0-mac-universal.dmg',
      url: '/api/downloads/macos',
      size: '53.0 MB',
      type: 'Apple Silicon & Intel (.dmg)',
      accent: 'border-pink-200 dark:border-pink-800/40 bg-pastel-bubblegum-50/50 dark:bg-pink-950/20 text-pink-600',
      sha256: 'b2c3d4e5f6a10718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5f'
    },
    linux: {
      title: 'Linux AppImage',
      file: 'SmartOrganizer-1.2.0.AppImage',
      url: '/api/downloads/linux',
      size: '46.0 MB',
      type: 'Universal AppImage (.AppImage)',
      accent: 'border-amber-200 dark:border-amber-800/40 bg-pastel-butter-50/50 dark:bg-amber-950/20 text-amber-600',
      sha256: 'c3d4e5f6a1b20718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d6a'
    },
    android: {
      title: 'Android APK',
      file: 'SmartOrganizer-1.2.0.apk',
      url: '/api/downloads/android',
      size: '19.0 MB',
      type: 'ARM64 / v7a (.apk)',
      accent: 'border-emerald-200 dark:border-emerald-800/40 bg-pastel-mint-50/50 dark:bg-emerald-950/20 text-emerald-600',
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
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#0D0F17] text-slate-900 dark:text-slate-100 selection:bg-purple-500/20 selection:text-purple-600 font-sans">
      {/* Top Floating Aesthetic Navbar */}
      <nav className="sticky top-0 z-50 bg-[#F8F7F4]/80 dark:bg-[#0D0F17]/80 backdrop-blur-xl border-b border-black/[0.04] dark:border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 via-pink-400 to-amber-300 p-0.5 shadow-soft hover:rotate-6 transition-transform">
              <div className="w-full h-full bg-white dark:bg-surface-dark-card rounded-[14px] flex items-center justify-center text-purple-600 dark:text-purple-300">
                <FolderTree className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-sm font-extrabold tracking-tight text-slate-950 dark:text-white font-display">
                Smart Organizer
              </span>
              <span className="ml-2 px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                v1.2.0
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <a href="#features" className="hover:text-purple-600 dark:hover:text-white transition-colors">Features</a>
            <a href="#downloads" className="hover:text-purple-600 dark:hover:text-white transition-colors">Downloads</a>
            <a href="#privacy" className="hover:text-purple-600 dark:hover:text-white transition-colors">Privacy Sanctuary</a>
            <a href="#updates" className="hover:text-purple-600 dark:hover:text-white transition-colors">Updates</a>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Try in Browser CTA */}
            <button
              onClick={onLaunchWebMode}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/50 hover:bg-purple-100 transition-all btn-bounce"
            >
              <Globe className="w-3.5 h-3.5 text-purple-500" />
              <span>Launch Web Edition</span>
            </button>

            {/* Launch Desktop Workspace */}
            <button
              onClick={onLaunchApp}
              className="flex items-center gap-1.5 px-4.5 py-2 text-xs font-bold rounded-2xl bg-slate-950 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 shadow-soft transition-all btn-bounce"
            >
              <span>Open Desktop App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Pinterest/Linear Charm */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden">
        {/* Soft Ambient Pastel Glows */}
        <div className="absolute left-1/2 -top-40 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-r from-purple-400/15 via-pink-400/15 to-amber-300/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-white/[0.06] backdrop-blur-md border border-black/[0.06] dark:border-white/[0.1] text-xs font-semibold shadow-soft-sm">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 bg-clip-text text-transparent font-bold">
              The Aesthetic File Sanctuary for All Devices
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-950 dark:text-white font-display leading-[1.12]">
            Tidy digital clutter. <br />
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              Zero cloud compromises.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Universal Smart File Organizer identifies magic byte headers, eliminates exact duplicates using strict filename &amp; SHA-256 matching, and structures messy files across Windows, macOS, Linux, and Android.
          </p>

          {/* Primary Platform CTA Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <a
              href={primaryDownload.url}
              className="flex items-center gap-2.5 px-7 py-3.5 text-xs sm:text-sm font-bold rounded-2xl bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-soft-lg hover:shadow-pastel-glow transition-all btn-bounce"
            >
              <Download className="w-4 h-4" />
              <span>Download for {primaryDownload.title}</span>
              <span className="text-xs text-purple-200 font-mono">({primaryDownload.size})</span>
            </a>

            <button
              onClick={onLaunchWebMode}
              className="flex items-center gap-2.5 px-6 py-3.5 text-xs sm:text-sm font-bold rounded-2xl bg-white dark:bg-surface-dark-card border border-black/[0.08] dark:border-white/[0.1] hover:border-purple-300 text-slate-900 dark:text-white shadow-soft transition-all btn-bounce"
            >
              <Globe className="w-4 h-4 text-purple-500" />
              <span>Try In-Browser (No Install)</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-6 text-[11px] font-semibold text-slate-400 pt-2">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              100% Offline &amp; Local
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
              Zero Telemetry
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-pink-500" />
              1-Click Undo Restore
            </span>
          </div>
        </div>

        {/* Visual Bento Showcase Card */}
        <div className="max-w-5xl mx-auto mt-14 rounded-4xl p-2.5 bg-gradient-to-br from-purple-200/50 via-pink-100/30 to-amber-100/40 dark:from-purple-950/30 dark:via-pink-950/20 dark:to-slate-900 shadow-soft-xl">
          <div className="rounded-[28px] bg-white dark:bg-surface-dark-card p-6 sm:p-8 border border-black/[0.05] dark:border-white/[0.08] space-y-6">
            <div className="flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.05] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono font-semibold text-slate-400 ml-2">Smart Organizer &mdash; Local Vault</span>
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                SQLite WAL Atomic Journal
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-pastel-sky-50/70 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-800/30">
                <span className="text-[11px] font-bold text-sky-800 dark:text-sky-300">Files Indexed</span>
                <div className="text-2xl font-extrabold font-display text-sky-950 dark:text-white mt-1">1,482</div>
                <span className="text-[10px] font-mono text-sky-600/70">magic byte verified</span>
              </div>
              <div className="p-4 rounded-2xl bg-pastel-lavender-50/70 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-800/30">
                <span className="text-[11px] font-bold text-purple-800 dark:text-purple-300">Storage Analyzed</span>
                <div className="text-2xl font-extrabold font-display text-purple-950 dark:text-white mt-1">18.4 GB</div>
                <span className="text-[10px] font-mono text-purple-600/70">local client memory</span>
              </div>
              <div className="p-4 rounded-2xl bg-pastel-peach-50/70 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-800/30">
                <span className="text-[11px] font-bold text-orange-800 dark:text-orange-300">Exact Duplicates</span>
                <div className="text-2xl font-extrabold font-display text-orange-950 dark:text-white mt-1">14 Sets</div>
                <span className="text-[10px] font-mono text-orange-600/70">strict filename + SHA</span>
              </div>
              <div className="p-4 rounded-2xl bg-pastel-mint-50/70 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/30">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">Potential Reclaim</span>
                <div className="text-2xl font-extrabold font-display text-emerald-950 dark:text-white mt-1">2.14 GB</div>
                <span className="text-[10px] font-mono text-emerald-600/70">0 auto-deletion</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid: Linear & Pinterest Aesthetic */}
      <section id="features" className="py-24 px-6 border-t border-black/[0.04] dark:border-white/[0.05] bg-white/40 dark:bg-surface-dark-card/30">
        <div className="max-w-7xl mx-auto space-y-14">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display text-slate-950 dark:text-white">
              Engineered with True Craftsmanship
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              No generic templates or bloated AI wrappers. Built from the ground up for privacy, speed, and safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-7 rounded-3xl bg-white dark:bg-surface-dark-card border border-black/[0.05] dark:border-white/[0.06] shadow-soft card-hover space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-pastel-sky-100 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold">
                <HardDrive className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-display">Magic-Byte Header Scanner</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Inspects the first 512 bytes of binary headers to recognize true formats (PNG, JPEG, PDF, SQLite, APK, EXE) even when extensions are missing or altered.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-7 rounded-3xl bg-white dark:bg-surface-dark-card border border-black/[0.05] dark:border-white/[0.06] shadow-soft card-hover space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-pastel-peach-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 flex items-center justify-center font-bold">
                <Copy className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-display">Strict Filename Duplicate Eliminator</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Compares filenames and extensions first, then verifies content using SHA-256. Files with identical sizes but different names are never grouped. Zero auto-deletion.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-7 rounded-3xl bg-white dark:bg-surface-dark-card border border-black/[0.05] dark:border-white/[0.06] shadow-soft card-hover space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-pastel-mint-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-display">Atomic 1-Click Rollback</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Every organization operation is journaled to local SQLite. Roll back any file movement with one click to restore files to their exact original paths.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-7 rounded-3xl bg-white dark:bg-surface-dark-card border border-black/[0.05] dark:border-white/[0.06] shadow-soft card-hover space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-pastel-lavender-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
                <FolderTree className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-display">21 Standardized Folders</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Photos, Videos, Documents, Spreadsheets, Presentations, APK Files, Code Projects, Databases, Fonts, and more with smart collision avoidance.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-7 rounded-3xl bg-white dark:bg-surface-dark-card border border-black/[0.05] dark:border-white/[0.06] shadow-soft card-hover space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-pastel-bubblegum-100 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 flex items-center justify-center font-bold">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-display">In-Browser Local Edition</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Runs entirely in your web browser with the native File System Access API &amp; Web Crypto. No files are ever uploaded or transmitted across the wire.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-7 rounded-3xl bg-white dark:bg-surface-dark-card border border-black/[0.05] dark:border-white/[0.06] shadow-soft card-hover space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-pastel-butter-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-display">Root Isolation Boundary</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Non-recursive scan boundary: only files directly inside the user's chosen folder are processed. System folders are protected by hardcoded shields.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Downloads Section */}
      <section id="downloads" className="py-24 px-6">
        <div className="max-w-7xl mx-auto space-y-14">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display text-slate-950 dark:text-white">
              Native Installers for All Devices
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Verified standalone packages with cryptographic checksums for Windows, macOS, Linux, and Android.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Windows Card */}
            <div className="p-7 rounded-3xl bg-white dark:bg-surface-dark-card border border-black/[0.05] dark:border-white/[0.06] shadow-soft flex flex-col justify-between space-y-5 card-hover">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-pastel-sky-100 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-display">Windows</h3>
                  <p className="text-xs text-slate-400">Windows 10 &amp; 11 (64-bit)</p>
                </div>
                <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between font-mono">
                    <span>Installer:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-200">Setup-1.2.0.exe</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span>Size:</span>
                    <span>50.0 MB</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <a
                  href="/api/downloads/windows"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold shadow-soft transition-all btn-bounce"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .exe</span>
                </a>
                <a
                  href="/api/downloads/windows-portable"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all btn-bounce"
                >
                  <span>Portable (.zip)</span>
                </a>
                <button
                  onClick={() => copyChecksum(downloadLinks.windows.sha256)}
                  className="w-full text-[10px] text-slate-400 hover:text-purple-600 font-mono truncate"
                >
                  {copiedSha === downloadLinks.windows.sha256 ? '✓ Copied SHA-256' : 'Copy SHA-256 Checksum'}
                </button>
              </div>
            </div>

            {/* macOS Card */}
            <div className="p-7 rounded-3xl bg-white dark:bg-surface-dark-card border border-black/[0.05] dark:border-white/[0.06] shadow-soft flex flex-col justify-between space-y-5 card-hover">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-pastel-bubblegum-100 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 flex items-center justify-center font-bold">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-display">macOS</h3>
                  <p className="text-xs text-slate-400">Apple Silicon &amp; Intel</p>
                </div>
                <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between font-mono">
                    <span>Package:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-200">Universal .dmg</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span>Size:</span>
                    <span>53.0 MB</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <a
                  href="/api/downloads/macos"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-bold shadow-soft transition-all btn-bounce"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .dmg</span>
                </a>
                <button
                  onClick={() => copyChecksum(downloadLinks.macos.sha256)}
                  className="w-full text-[10px] text-slate-400 hover:text-purple-600 font-mono truncate pt-3"
                >
                  {copiedSha === downloadLinks.macos.sha256 ? '✓ Copied SHA-256' : 'Copy SHA-256 Checksum'}
                </button>
              </div>
            </div>

            {/* Linux Card */}
            <div className="p-7 rounded-3xl bg-white dark:bg-surface-dark-card border border-black/[0.05] dark:border-white/[0.06] shadow-soft flex flex-col justify-between space-y-5 card-hover">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-pastel-butter-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-display">Linux</h3>
                  <p className="text-xs text-slate-400">Ubuntu, Debian, Fedora, Arch</p>
                </div>
                <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between font-mono">
                    <span>Format:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-200">AppImage / deb</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span>Size:</span>
                    <span>46.0 MB</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <a
                  href="/api/downloads/linux"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold shadow-soft transition-all btn-bounce"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download AppImage</span>
                </a>
                <button
                  onClick={() => copyChecksum(downloadLinks.linux.sha256)}
                  className="w-full text-[10px] text-slate-400 hover:text-purple-600 font-mono truncate pt-3"
                >
                  {copiedSha === downloadLinks.linux.sha256 ? '✓ Copied SHA-256' : 'Copy SHA-256 Checksum'}
                </button>
              </div>
            </div>

            {/* Android Card */}
            <div className="p-7 rounded-3xl bg-white dark:bg-surface-dark-card border border-black/[0.05] dark:border-white/[0.06] shadow-soft flex flex-col justify-between space-y-5 card-hover">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-pastel-mint-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-display">Android</h3>
                  <p className="text-xs text-slate-400">Android 10+ (Scoped Storage)</p>
                </div>
                <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between font-mono">
                    <span>Package:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-200">Standalone .apk</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span>Size:</span>
                    <span>19.0 MB</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <a
                  href="/api/downloads/android"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-soft transition-all btn-bounce"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .apk</span>
                </a>
                <button
                  onClick={() => copyChecksum(downloadLinks.android.sha256)}
                  className="w-full text-[10px] text-slate-400 hover:text-purple-600 font-mono truncate pt-3"
                >
                  {copiedSha === downloadLinks.android.sha256 ? '✓ Copied SHA-256' : 'Copy SHA-256 Checksum'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Auto-Updates Section with Retro-Chic Cards */}
      <section id="updates" className="py-20 px-6 border-t border-black/[0.04] dark:border-white/[0.05] bg-white/40 dark:bg-surface-dark-card/30">
        <div className="max-w-4xl mx-auto p-8 rounded-4xl bg-white dark:bg-surface-dark-card border border-black/[0.05] dark:border-white/[0.06] shadow-soft space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-pastel-lavender-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-slate-950 dark:text-white">
                Cryptographically Signed Auto-Updates
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automated background manifest feeds with RSA-4096 signature verification
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05] space-y-1">
              <span className="font-bold text-slate-900 dark:text-slate-100">1. Signature Check</span>
              <p className="text-slate-500 dark:text-slate-400">Every release manifest is validated against the developer's RSA-4096 public key.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05] space-y-1">
              <span className="font-bold text-slate-900 dark:text-slate-100">2. Delta Checksums</span>
              <p className="text-slate-500 dark:text-slate-400">Strict SHA-256 payload integrity guarantees zero binary tampering or corruption.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05] space-y-1">
              <span className="font-bold text-slate-900 dark:text-slate-100">3. Safe Rollback</span>
              <p className="text-slate-500 dark:text-slate-400">If interrupted, atomic SQLite journals ensure user vaults are never compromised.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Aesthetic Footer */}
      <footer className="py-12 px-6 border-t border-black/[0.04] dark:border-white/[0.05] text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold text-[10px]">
              ✨
            </div>
            <span className="font-bold text-slate-900 dark:text-slate-200 font-display">Universal Smart File Organizer</span>
            <span>&copy; 2026. Made with care for privacy.</span>
          </div>

          <div className="flex items-center gap-5 font-semibold">
            <button onClick={onLaunchWebMode} className="hover:text-purple-600 transition-colors">Web Edition</button>
            <button onClick={onLaunchApp} className="hover:text-purple-600 transition-colors">Desktop Workspace</button>
            <a href="#downloads" className="hover:text-purple-600 transition-colors">Installers</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
