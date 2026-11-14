import React, { useState } from 'react';
import {
  Search,
  Filter,
  FolderOpen,
  Eye,
  X,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Code,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export function FilesView({ files, categories, onRevealPath, selectedCategory, setSelectedCategory }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [activePreviewFile, setActivePreviewFile] = useState(null);

  // Filter files
  const filteredFiles = files.filter((file) => {
    // Category match
    if (selectedCategory && selectedCategory !== 'All' && file.category !== selectedCategory) {
      return false;
    }

    // Search term
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      if (!file.name.toLowerCase().includes(q) && !file.path.toLowerCase().includes(q)) {
        return false;
      }
    }

    // Size filter
    if (sizeFilter === 'small' && file.size >= 1024 * 1024) return false;
    if (sizeFilter === 'medium' && (file.size < 1024 * 1024 || file.size > 50 * 1024 * 1024)) return false;
    if (sizeFilter === 'large' && file.size <= 50 * 1024 * 1024) return false;

    return true;
  });

  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  function getFileIcon(category) {
    switch (category) {
      case 'Photos': return <Image className="w-4 h-4 text-purple-500" />;
      case 'Videos': return <Video className="w-4 h-4 text-pink-500" />;
      case 'Music':
      case 'Audio': return <Music className="w-4 h-4 text-rose-500" />;
      case 'ZIPArchives': return <Archive className="w-4 h-4 text-amber-500" />;
      case 'ProgrammingFiles': return <Code className="w-4 h-4 text-sky-500" />;
      default: return <FileText className="w-4 h-4 text-slate-500" />;
    }
  }

  return (
    <div className="space-y-5">
      {/* Search & Filter Pill Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/80 dark:bg-surface-dark-card/80 backdrop-blur-md border border-black/[0.05] dark:border-white/[0.06] shadow-soft flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search files by name or path..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-2xl bg-slate-100/80 dark:bg-white/[0.05] border border-black/[0.04] dark:border-white/[0.06] text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2 text-xs rounded-2xl bg-slate-100/80 dark:bg-white/[0.05] border border-black/[0.04] dark:border-white/[0.06] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400/40 font-semibold"
          >
            <option value="All">All Folders ({files.length})</option>
            {categories.map((c) => (
              <option key={c.key} value={c.key}>{c.name} ({c.fileCount})</option>
            ))}
          </select>

          {/* Size Filter */}
          <select
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value)}
            className="px-3.5 py-2 text-xs rounded-2xl bg-slate-100/80 dark:bg-white/[0.05] border border-black/[0.04] dark:border-white/[0.06] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400/40 font-semibold"
          >
            <option value="all">Any Size</option>
            <option value="small">&lt; 1 MB</option>
            <option value="medium">1 MB – 50 MB</option>
            <option value="large">&gt; 50 MB</option>
          </select>
        </div>

        <div className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
          {filteredFiles.length.toLocaleString()} matching
        </div>
      </div>

      {/* Files Table Card */}
      <div className="rounded-3xl bg-white/80 dark:bg-surface-dark-card/80 backdrop-blur-md border border-black/[0.05] dark:border-white/[0.06] shadow-soft overflow-hidden">
        {filteredFiles.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 font-display">No files match your filters</p>
            <p className="text-xs text-slate-400">Try running a scan or clearing search parameters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-black/[0.04] dark:border-white/[0.05] bg-slate-50/60 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 font-bold">
                  <th className="py-3.5 px-5">File</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Size</th>
                  <th className="py-3.5 px-4">Signature</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.04]">
                {filteredFiles.slice(0, 150).map((file) => (
                  <tr
                    key={file.id}
                    className="hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-colors group"
                  >
                    <td className="py-3 px-5 font-semibold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] group-hover:scale-105 transition-transform">
                          {getFileIcon(file.category)}
                        </div>
                        <div className="truncate max-w-sm" title={file.path}>
                          <div className="truncate font-bold font-sans">{file.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono truncate">{file.path}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300">
                        {file.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-600 dark:text-slate-400">
                      {formatBytes(file.size)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="uppercase text-[10px] font-mono font-bold text-slate-500">
                          .{file.extension || 'bin'}
                        </span>
                        {file.magicDetected && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 border border-emerald-300/40">
                            <Sparkles className="w-2.5 h-2.5" />
                            Verified Byte
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-5 text-right space-x-1.5">
                      <button
                        onClick={() => setActivePreviewFile(file)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors"
                        title="Preview Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onRevealPath(file.path)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors"
                        title="Reveal in System Explorer"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over Preview Modal */}
      {activePreviewFile && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-surface-dark-card rounded-4xl p-7 shadow-soft-xl border border-black/[0.08] dark:border-white/[0.1] space-y-4 max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.05] pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                File Intelligence Preview
              </h3>
              <button
                onClick={() => setActivePreviewFile(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-slate-400 font-semibold">Filename</span>
                <p className="font-bold text-slate-900 dark:text-slate-100 break-all">{activePreviewFile.name}</p>
              </div>

              <div>
                <span className="text-slate-400 font-semibold">Full Path</span>
                <p className="font-mono text-slate-600 dark:text-slate-400 break-all bg-slate-50 dark:bg-white/[0.03] p-2.5 rounded-2xl text-[11px]">
                  {activePreviewFile.path}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-white/[0.03] p-3 rounded-2xl">
                  <span className="text-slate-400">File Size</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{formatBytes(activePreviewFile.size)}</p>
                </div>
                <div className="bg-slate-50 dark:bg-white/[0.03] p-3 rounded-2xl">
                  <span className="text-slate-400">Category</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{activePreviewFile.category}</p>
                </div>
              </div>

              {/* Photo Metadata */}
              {activePreviewFile.photoMeta && (
                <div className="p-3.5 rounded-2xl bg-pastel-lavender-50/70 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/30 space-y-2">
                  <span className="font-bold text-purple-700 dark:text-purple-300">Photo Metadata</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400">Resolution: </span>
                      <span className="font-mono font-bold">{activePreviewFile.photoMeta.width} x {activePreviewFile.photoMeta.height}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Type: </span>
                      <span className="font-bold">{activePreviewFile.photoMeta.subType}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Document Preview */}
              {activePreviewFile.docMeta?.preview?.canPreview && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="font-semibold">Text Preview</span>
                    <span className="font-mono">{activePreviewFile.docMeta.preview.lineCount} lines</span>
                  </div>
                  <pre className="p-3.5 rounded-2xl bg-slate-950 text-slate-200 font-mono text-[11px] max-h-40 overflow-y-auto whitespace-pre-wrap">
                    {activePreviewFile.docMeta.preview.previewText}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  onRevealPath(activePreviewFile.path);
                  setActivePreviewFile(null);
                }}
                className="px-5 py-2.5 text-xs font-bold rounded-2xl bg-purple-600 hover:bg-purple-500 text-white shadow-soft btn-bounce"
              >
                Reveal in Explorer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
