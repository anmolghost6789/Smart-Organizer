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
  ExternalLink
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
      case 'Photos': return <Image className="w-4 h-4 text-blue-500" />;
      case 'Videos': return <Video className="w-4 h-4 text-purple-500" />;
      case 'Music':
      case 'Audio': return <Music className="w-4 h-4 text-pink-500" />;
      case 'ZIPArchives': return <Archive className="w-4 h-4 text-amber-500" />;
      case 'ProgrammingFiles': return <Code className="w-4 h-4 text-sky-500" />;
      default: return <FileText className="w-4 h-4 text-slate-500" />;
    }
  }

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by file name or directory..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c.key} value={c.key}>{c.name} ({c.fileCount})</option>
            ))}
          </select>

          {/* Size Filter */}
          <select
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
          >
            <option value="all">Any Size</option>
            <option value="small">&lt; 1 MB</option>
            <option value="medium">1 MB – 50 MB</option>
            <option value="large">&gt; 50 MB</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Showing {filteredFiles.length.toLocaleString()} of {files.length.toLocaleString()} files
        </div>
      </div>

      {/* Files Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredFiles.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No files found matching criteria</p>
            <p className="text-xs text-slate-400">Try running a scan or adjusting search filters above</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Format / Magic</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredFiles.slice(0, 150).map((file) => (
                  <tr
                    key={file.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                          {getFileIcon(file.category)}
                        </div>
                        <div className="truncate max-w-sm" title={file.path}>
                          <div className="truncate font-semibold">{file.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono truncate">{file.path}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {file.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {formatBytes(file.size)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="uppercase text-[10px] font-mono font-bold text-slate-500">
                          .{file.extension || 'bin'}
                        </span>
                        {file.magicDetected && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Verified Byte
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => setActivePreviewFile(file)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Preview Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onRevealPath(file.path)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Reveal in System Explorer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">File Intelligence Preview</h3>
              <button
                onClick={() => setActivePreviewFile(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Filename</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 break-all">{activePreviewFile.name}</p>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Full Path</span>
                <p className="font-mono text-slate-600 dark:text-slate-400 break-all bg-slate-50 dark:bg-slate-800 p-2 rounded-xl">
                  {activePreviewFile.path}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                  <span className="text-slate-400">File Size</span>
                  <p className="font-semibold">{formatBytes(activePreviewFile.size)}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                  <span className="text-slate-400">Category</span>
                  <p className="font-semibold">{activePreviewFile.category}</p>
                </div>
              </div>

              {/* Photo Metadata */}
              {activePreviewFile.photoMeta && (
                <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 space-y-2">
                  <span className="font-semibold text-blue-700 dark:text-blue-300">Photo Metadata</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400">Resolution: </span>
                      <span className="font-mono font-medium">{activePreviewFile.photoMeta.width} x {activePreviewFile.photoMeta.height}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Classification: </span>
                      <span className="font-medium">{activePreviewFile.photoMeta.subType}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Document Preview */}
              {activePreviewFile.docMeta?.preview?.canPreview && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Text Preview</span>
                    <span>{activePreviewFile.docMeta.preview.lineCount} lines</span>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] max-h-40 overflow-y-auto whitespace-pre-wrap">
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
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-sky-600 hover:bg-sky-700 text-white"
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
