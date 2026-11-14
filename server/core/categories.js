/**
 * Category Definitions & Mapping Engine
 * Supports 20+ specialized categories, 180+ file extensions, MIME types, and custom user rules.
 */

export const DEFAULT_CATEGORIES = {
  Photos: {
    folder: 'Photos',
    icon: 'image',
    color: '#3B82F6',
    description: 'Images, photographs, screenshots, and graphic assets',
    extensions: [
      'jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'tif', 'heic', 'heif',
      'svg', 'raw', 'cr2', 'nef', 'arw', 'dng', 'ico', 'avif', 'eps'
    ],
    mimes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff', 'image/heic', 'image/svg+xml', 'image/x-icon']
  },
  Videos: {
    folder: 'Videos',
    icon: 'video',
    color: '#8B5CF6',
    description: 'Movies, recordings, clips, and video captures',
    extensions: [
      'mp4', 'mkv', 'mov', 'avi', 'wmv', 'flv', 'webm', 'm4v', '3gp', 'ts', 'mts', 'vob', 'ogv'
    ],
    mimes: ['video/mp4', 'video/x-matroska', 'video/quicktime', 'video/x-msvideo', 'video/webm']
  },
  PDFs: {
    folder: 'PDFs',
    icon: 'file-text',
    color: '#EF4444',
    description: 'Adobe Portable Document Format files',
    extensions: ['pdf'],
    mimes: ['application/pdf']
  },
  Documents: {
    folder: 'Documents',
    icon: 'file-text',
    color: '#3B82F6',
    description: 'Word processing documents and general text documents',
    extensions: ['doc', 'docx', 'odt', 'rtf', 'tex', 'wpd', 'txt', 'md', 'markdown', 'log', 'pages'],
    mimes: [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown'
    ]
  },
  Spreadsheets: {
    folder: 'Spreadsheets',
    icon: 'sheet',
    color: '#10B981',
    description: 'Excel sheets, CSV data, and financial records',
    extensions: ['xls', 'xlsx', 'csv', 'tsv', 'ods', 'xlsm', 'xlsb', 'numbers'],
    mimes: [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ]
  },
  Presentations: {
    folder: 'Presentations',
    icon: 'presentation',
    color: '#F59E0B',
    description: 'PowerPoint presentations and slide decks',
    extensions: ['ppt', 'pptx', 'odp', 'pps', 'ppsx', 'key', 'keynote'],
    mimes: [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]
  },
  Music: {
    folder: 'Music',
    icon: 'music',
    color: '#EC4899',
    description: 'High-fidelity songs and music tracks',
    extensions: ['mp3', 'flac', 'alac', 'm4a', 'aac', 'ogg', 'opus'],
    mimes: ['audio/mpeg', 'audio/flac', 'audio/mp4', 'audio/ogg', 'audio/aac']
  },
  Audio: {
    folder: 'Audio',
    icon: 'mic',
    color: '#06B6D4',
    description: 'Voice recordings, sound effects, podcasts, and audio samples',
    extensions: ['wav', 'wma', 'aiff', 'mid', 'midi', 'amr', 'pcm'],
    mimes: ['audio/wav', 'audio/x-ms-wma', 'audio/midi']
  },
  APKFiles: {
    folder: 'APK Files',
    icon: 'smartphone',
    color: '#22C55E',
    description: 'Android application packages and bundle files',
    extensions: ['apk', 'xapk', 'apkm', 'aab'],
    mimes: ['application/vnd.android.package-archive']
  },
  Applications: {
    folder: 'Applications',
    icon: 'app-window',
    color: '#6366F1',
    description: 'Portable apps and standalone desktop binaries',
    extensions: ['appimage', 'dmg', 'pkg', 'deb', 'rpm'],
    mimes: ['application/x-apple-diskimage', 'application/x-debian-package', 'application/x-redhat-package-manager']
  },
  Software: {
    folder: 'Software',
    icon: 'binary',
    color: '#4F46E5',
    description: 'Windows installers, executables, and setup packages',
    extensions: ['exe', 'msi', 'bat', 'cmd', 'ps1', 'sh'],
    mimes: ['application/x-msdownload', 'application/x-msi']
  },
  ZIPArchives: {
    folder: 'ZIP & Archives',
    icon: 'archive',
    color: '#D97706',
    description: 'Compressed bundles, zip files, and tarballs',
    extensions: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso', 'tgz', 'cab', 'zst'],
    mimes: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/gzip']
  },
  ProgrammingFiles: {
    folder: 'Programming Files',
    icon: 'code',
    color: '#0EA5E9',
    description: 'Source code files, scripts, and stylesheets',
    extensions: [
      'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'h', 'hpp', 'cs', 'go',
      'rs', 'rb', 'php', 'swift', 'kt', 'dart', 'html', 'css', 'scss', 'vue',
      'json', 'yaml', 'yml', 'xml', 'toml', 'lua', 'r'
    ],
    mimes: ['text/javascript', 'application/json', 'text/html', 'text/css', 'text/x-python']
  },
  CodeProjects: {
    folder: 'Code Projects',
    icon: 'folder-git-2',
    color: '#0284C7',
    description: 'Project configuration, lockfiles, and environment files',
    extensions: ['env', 'gitignore', 'dockerfile', 'makefile', 'lock', 'toml', 'gradle', 'sln', 'csproj'],
    mimes: []
  },
  DatabaseFiles: {
    folder: 'Database Files',
    icon: 'database',
    color: '#14B8A6',
    description: 'Local database stores, SQL dumps, and data stores',
    extensions: ['sqlite', 'sqlite3', 'db', 'db3', 'sql', 'mdb', 'accdb', 'bson', 'arrow', 'parquet'],
    mimes: ['application/vnd.sqlite3', 'application/x-sqlite3']
  },
  DesignFiles: {
    folder: 'Design Files',
    icon: 'pen-tool',
    color: '#F43F5E',
    description: 'Design projects, vector artwork, and layers',
    extensions: ['psd', 'ai', 'xd', 'fig', 'sketch', 'blend', 'fbx', 'obj', 'c4d', 'indd', 'afdesign', 'afphoto'],
    mimes: ['image/vnd.adobe.photoshop', 'application/postscript']
  },
  Fonts: {
    folder: 'Fonts',
    icon: 'type',
    color: '#84CC16',
    description: 'TrueType, OpenType, and web font typefaces',
    extensions: ['ttf', 'otf', 'woff', 'woff2', 'eot', 'fon'],
    mimes: ['font/ttf', 'font/otf', 'font/woff', 'font/woff2']
  },
  Ebooks: {
    folder: 'E-books',
    icon: 'book-open',
    color: '#A855F7',
    description: 'Electronic books, comics, and digital publications',
    extensions: ['epub', 'mobi', 'azw', 'azw3', 'cbr', 'cbz', 'fb2', 'djvu'],
    mimes: ['application/epub+zip', 'application/x-mobipocket-ebook']
  },
  Backups: {
    folder: 'Backups',
    icon: 'history',
    color: '#64748B',
    description: 'System backups, database snapshots, and save files',
    extensions: ['bak', 'backup', 'old', 'orig', 'tmp_bak', 'sav', 'dump'],
    mimes: []
  },
  SystemFiles: {
    folder: 'System Files',
    icon: 'shield-alert',
    color: '#94A3B8',
    description: 'Configuration, cache, DLLs, and OS system descriptors',
    extensions: ['dll', 'sys', 'ini', 'cfg', 'conf', 'dylib', 'so'],
    mimes: []
  },
  OtherFiles: {
    folder: 'Other Files',
    icon: 'folder',
    color: '#6B7280',
    description: 'Uncategorized or unknown file formats',
    extensions: [],
    mimes: []
  }
};

/**
 * Builds reverse lookup map from extension -> category
 */
const EXT_TO_CATEGORY = new Map();
for (const [catName, data] of Object.entries(DEFAULT_CATEGORIES)) {
  for (const ext of data.extensions) {
    EXT_TO_CATEGORY.set(ext.toLowerCase(), catName);
  }
}

/**
 * Determine category given file info, magic byte detection result, and optional custom rules.
 * @param {Object} fileInfo - { extension, mime, name, path }
 * @param {Object|null} magicInfo - Result from identifyByMagicBytes
 * @param {Array} customRules - Array of custom user rules [{ ruleType, pattern, targetCategory }]
 */
export function determineCategory(fileInfo, magicInfo = null, customRules = []) {
  const ext = (fileInfo.extension || '').toLowerCase().replace(/^\./, '');
  const fileName = (fileInfo.name || '').toLowerCase();

  // 1. Evaluate custom user rules first (Highest priority)
  if (Array.isArray(customRules) && customRules.length > 0) {
    for (const rule of customRules) {
      if (rule.enabled === false) continue;
      if (rule.type === 'extension' && rule.pattern.toLowerCase() === ext) {
        return rule.targetCategory;
      }
      if (rule.type === 'nameContains' && fileName.includes(rule.pattern.toLowerCase())) {
        return rule.targetCategory;
      }
      if (rule.type === 'regex') {
        try {
          const reg = new RegExp(rule.pattern, 'i');
          if (reg.test(fileInfo.name)) return rule.targetCategory;
        } catch {}
      }
    }
  }

  // 2. Specific safety: APK files should go to APK Files even if they are zip signatures
  if (ext === 'apk' || ext === 'xapk' || ext === 'apkm') {
    return 'APKFiles';
  }

  // 3. Document formats that might look like ZIPs or binaries
  if (['docx', 'odt', 'pages', 'rtf'].includes(ext)) {
    return 'Documents';
  }
  if (['xlsx', 'xls', 'csv', 'ods', 'numbers'].includes(ext)) {
    return 'Spreadsheets';
  }
  if (['pptx', 'ppt', 'odp', 'key'].includes(ext)) {
    return 'Presentations';
  }
  if (['epub', 'mobi', 'azw3'].includes(ext)) {
    return 'Ebooks';
  }

  // 4. Magic bytes detection if available
  if (magicInfo && magicInfo.category) {
    // Map category name to DEFAULT_CATEGORIES keys
    const catKey = magicInfo.category.replace(/[^a-zA-Z]/g, '');
    if (DEFAULT_CATEGORIES[catKey]) {
      return catKey;
    }
    // Check direct matching folder name
    for (const [key, val] of Object.entries(DEFAULT_CATEGORIES)) {
      if (val.folder === magicInfo.category) {
        return key;
      }
    }
  }

  // 5. Direct extension lookup
  if (EXT_TO_CATEGORY.has(ext)) {
    return EXT_TO_CATEGORY.get(ext);
  }

  // 6. MIME type heuristics
  if (fileInfo.mime) {
    const mime = fileInfo.mime.toLowerCase();
    if (mime.startsWith('image/')) return 'Photos';
    if (mime.startsWith('video/')) return 'Videos';
    if (mime.startsWith('audio/')) return 'Audio';
    if (mime === 'application/pdf') return 'PDFs';
    if (mime.startsWith('text/')) return 'Documents';
  }

  return 'OtherFiles';
}

/**
 * Returns formatted target directory name based on category key.
 */
export function getCategoryFolder(categoryKey) {
  return DEFAULT_CATEGORIES[categoryKey]?.folder || 'Other Files';
}
