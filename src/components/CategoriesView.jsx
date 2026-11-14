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
  ShieldAlert,
  Sparkles
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
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-display flex items-center gap-2">
            <span>21 Organization Folders</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
              zero collision
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pinterest-style visual folder architecture for every file format across your device
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const IconComponent = ICON_MAP[cat.icon] || Folder;

          return (
            <div
              key={cat.key}
              className="p-5 rounded-3xl bg-white/80 dark:bg-surface-dark-card/80 backdrop-blur-md border border-black/[0.05] dark:border-white/[0.06] shadow-soft card-hover flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-soft transition-transform group-hover:scale-105 duration-200"
                    style={{ backgroundColor: cat.color }}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.05] px-2 py-0.5 rounded-lg">
                    {cat.formattedSize}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display flex items-center gap-1.5">
                  📁 {cat.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>

                {/* Common Extension Badges */}
                {cat.extensions && cat.extensions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {cat.extensions.slice(0, 4).map((ext) => (
                      <span
                        key={ext}
                        className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 border border-black/[0.03] dark:border-white/[0.04]"
                      >
                        .{ext}
                      </span>
                    ))}
                    {cat.extensions.length > 4 && (
                      <span className="text-[10px] text-slate-400 self-center font-mono">
                        +{cat.extensions.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-black/[0.04] dark:border-white/[0.05] flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 font-display">
                  {cat.fileCount.toLocaleString()} {cat.fileCount === 1 ? 'file' : 'files'}
                </span>

                <button
                  onClick={() => onSelectCategory(cat.key)}
                  className="font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
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
