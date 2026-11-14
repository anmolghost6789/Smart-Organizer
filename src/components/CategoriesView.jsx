import React from 'react';
import {
  Folder,
  ArrowRight,
  Filter,
  Layers,
  Image,
  Video,
  FileText,
  Sheet,
  Presentation,
  Music,
  Mic,
  Smartphone,
  AppWindow,
  Binary,
  Archive,
  Code,
  FolderGit2,
  Database,
  PenTool,
  Type,
  BookOpen,
  History,
  ShieldAlert
} from 'lucide-react';

const ICON_MAP = {
  image: Image,
  video: Video,
  'file-text': FileText,
  sheet: Sheet,
  presentation: Presentation,
  music: Music,
  mic: Mic,
  smartphone: Smartphone,
  'app-window': AppWindow,
  binary: Binary,
  archive: Archive,
  code: Code,
  'folder-git-2': FolderGit2,
  database: Database,
  'pen-tool': PenTool,
  type: Type,
  'book-open': BookOpen,
  history: History,
  'shield-alert': ShieldAlert,
  folder: Folder
};

export function CategoriesView({ categories, onSelectCategory, onOrganizeCategory }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Organization Folders</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            21 standardized categories tailored to preserve structure, avoid collisions, and isolate formats cleanly
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const IconComponent = ICON_MAP[cat.icon] || Folder;

          return (
            <div
              key={cat.key}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: cat.color }}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                    {cat.formattedSize}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  📁 {cat.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>

                {/* Common Extension Badges */}
                {cat.extensions && cat.extensions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {cat.extensions.slice(0, 5).map((ext) => (
                      <span
                        key={ext}
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-500"
                      >
                        .{ext}
                      </span>
                    ))}
                    {cat.extensions.length > 5 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{cat.extensions.length - 5}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {cat.fileCount.toLocaleString()} {cat.fileCount === 1 ? 'file' : 'files'}
                </span>

                <button
                  onClick={() => onSelectCategory(cat.key)}
                  className="font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                >
                  <span>Browse</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
