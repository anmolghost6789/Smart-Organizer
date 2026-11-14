import JSZip from 'jszip';

/**
 * 21 Standardized Categories with color codes, icons, and extensions.
 */
export const BROWSER_CATEGORIES = {
  Photos: {
    folder: 'Photos',
    icon: 'image',
    color: '#3B82F6',
    description: 'Images, photographs, screenshots, and visual assets',
    extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'svg', 'heic', 'raw', 'ico']
  },
  Videos: {
    folder: 'Videos',
    icon: 'video',
    color: '#8B5CF6',
    description: 'Video recordings, movies, and clips',
    extensions: ['mp4', 'mkv', 'mov', 'avi', 'wmv', 'flv', 'webm', 'm4v']
  },
  PDFs: {
    folder: 'PDFs',
    icon: 'file-text',
    color: '#EF4444',
    description: 'Adobe Portable Document Format files',
    extensions: ['pdf']
  },
  Documents: {
    folder: 'Documents',
    icon: 'file-text',
    color: '#3B82F6',
    description: 'Word processing documents and text files',
    extensions: ['doc', 'docx', 'odt', 'rtf', 'txt', 'md', 'markdown', 'pages']
  },
  Spreadsheets: {
    folder: 'Spreadsheets',
    icon: 'sheet',
    color: '#10B981',
    description: 'Excel workbooks, CSV tables, and numbers',
    extensions: ['xls', 'xlsx', 'csv', 'tsv', 'ods', 'numbers']
  },
  Presentations: {
    folder: 'Presentations',
    icon: 'presentation',
    color: '#F59E0B',
    description: 'PowerPoint decks and slide presentations',
    extensions: ['ppt', 'pptx', 'odp', 'key', 'keynote']
  },
  Music: {
    folder: 'Music',
    icon: 'music',
    color: '#EC4899',
    description: 'Songs and music tracks',
    extensions: ['mp3', 'flac', 'm4a', 'aac', 'ogg', 'wav']
  },
  Audio: {
    folder: 'Audio',
    icon: 'mic',
    color: '#06B6D4',
    description: 'Voice recordings and audio clips',
    extensions: ['wma', 'aiff', 'mid', 'amr', 'opus']
  },
  APKFiles: {
    folder: 'APK Files',
    icon: 'smartphone',
    color: '#22C55E',
    description: 'Android application packages',
    extensions: ['apk', 'xapk', 'apkm', 'aab']
  },
  Applications: {
    folder: 'Applications',
    icon: 'app-window',
    color: '#6366F1',
    description: 'Standalone binaries and packages',
    extensions: ['appimage', 'dmg', 'pkg', 'deb', 'rpm']
  },
  Software: {
    folder: 'Software',
    icon: 'binary',
    color: '#4F46E5',
    description: 'Windows installers and scripts',
    extensions: ['exe', 'msi', 'bat', 'cmd', 'ps1', 'sh']
  },
  ZIPArchives: {
    folder: 'ZIP & Archives',
    icon: 'archive',
    color: '#D97706',
    description: 'Compressed bundles and tarballs',
    extensions: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz']
  },
  ProgrammingFiles: {
    folder: 'Programming Files',
    icon: 'code',
    color: '#0EA5E9',
    description: 'Source code and configuration files',
    extensions: ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'cs', 'go', 'rs', 'html', 'css', 'json', 'yaml', 'yml', 'xml', 'sql']
  },
  CodeProjects: {
    folder: 'Code Projects',
    icon: 'folder-git-2',
    color: '#0284C7',
    description: 'Environment and lock files',
    extensions: ['env', 'gitignore', 'dockerfile', 'lock', 'toml']
  },
  DatabaseFiles: {
    folder: 'Database Files',
    icon: 'database',
    color: '#14B8A6',
    description: 'Database storage and exports',
    extensions: ['sqlite', 'sqlite3', 'db', 'db3', 'sql', 'mdb', 'accdb']
  },
  DesignFiles: {
    folder: 'Design Files',
    icon: 'pen-tool',
    color: '#F43F5E',
    description: 'Vector and graphic design layers',
    extensions: ['psd', 'ai', 'xd', 'fig', 'sketch', 'blend']
  },
  Fonts: {
    folder: 'Fonts',
    icon: 'type',
    color: '#84CC16',
    description: 'Typography and web font files',
    extensions: ['ttf', 'otf', 'woff', 'woff2']
  },
  Ebooks: {
    folder: 'E-books',
    icon: 'book-open',
    color: '#A855F7',
    description: 'Digital publications and electronic books',
    extensions: ['epub', 'mobi', 'azw3', 'cbr', 'cbz']
  },
  Backups: {
    folder: 'Backups',
    icon: 'history',
    color: '#64748B',
    description: 'Backup snapshots and saved states',
    extensions: ['bak', 'backup', 'old', 'sav']
  },
  SystemFiles: {
    folder: 'System Files',
    icon: 'shield-alert',
    color: '#94A3B8',
    description: 'System configurations and descriptor files',
    extensions: ['dll', 'sys', 'ini', 'cfg', 'conf']
  },
  OtherFiles: {
    folder: 'Other Files',
    icon: 'folder',
    color: '#6B7280',
    description: 'Uncategorized or unknown formats',
    extensions: []
  }
};

/**
 * Normalizes a filename to compare filenames first, including file extensions.
 * Strips copy suffixes like (1), - Copy.
 */
export function getCanonicalFilenameKey(filename) {
  if (!filename) return '';
  const lastDot = filename.lastIndexOf('.');
  const ext = lastDot !== -1 ? filename.substring(lastDot).toLowerCase() : '';
  const base = lastDot !== -1 ? filename.substring(0, lastDot) : filename;

  const cleanBase = base
    .replace(/\s*\(\d+\)$/i, '')
    .replace(/\s*-\s*copy(\s*\(\d+\))?$/i, '')
    .replace(/\s*copy(\s*\d+)?$/i, '')
    .replace(/_copy(\d+)?$/i, '')
    .replace(/\s*duplicate(\s*\d+)?$/i, '')
    .trim()
    .toLowerCase();

  return `${cleanBase}${ext}`;
}

/**
 * Web Crypto API SHA-256 calculation inside the client browser.
 * Zero network transmission.
 */
export async function computeBrowserSha256(file) {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * In-browser magic byte inspection from the first 512 bytes.
 */
export async function identifyMagicBytesInBrowser(file) {
  try {
    const slice = file.slice(0, 512);
    const buffer = new Uint8Array(await slice.arrayBuffer());
    if (buffer.length < 4) return null;

    // PNG
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      return { mime: 'image/png', ext: 'png', category: 'Photos' };
    }
    // JPEG
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
      return { mime: 'image/jpeg', ext: 'jpg', category: 'Photos' };
    }
    // GIF
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
      return { mime: 'image/gif', ext: 'gif', category: 'Photos' };
    }
    // PDF
    if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
      return { mime: 'application/pdf', ext: 'pdf', category: 'PDFs' };
    }
    // ZIP / Office / APK
    if (buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (['docx', 'odt'].includes(ext)) return { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', category: 'Documents' };
      if (['xlsx', 'ods'].includes(ext)) return { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', category: 'Spreadsheets' };
      if (['pptx', 'odp'].includes(ext)) return { mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', category: 'Presentations' };
      if (ext === 'apk') return { mime: 'application/vnd.android.package-archive', category: 'APKFiles' };
      return { mime: 'application/zip', category: 'ZIPArchives' };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Determine category in browser
 */
export function determineBrowserCategory(fileName, magic) {
  if (magic && magic.category && BROWSER_CATEGORIES[magic.category]) {
    return magic.category;
  }
  const ext = fileName.split('.').pop().toLowerCase();

  for (const [catKey, catDef] of Object.entries(BROWSER_CATEGORIES)) {
    if (catDef.extensions.includes(ext)) {
      return catKey;
    }
  }
  return 'OtherFiles';
}

/**
 * In-Browser Strict Duplicate Detection
 * 1. Filename comparison first (including extension).
 * 2. Only matching filenames are candidates.
 * 3. Full Web Crypto SHA-256 verification.
 * 4. Zero auto-deletion.
 */
export async function detectDuplicatesInBrowser(files, onProgress) {
  // Step 1: Group by matching filename first
  const nameMap = new Map();
  for (const f of files) {
    if (f.size <= 0) continue;
    const key = getCanonicalFilenameKey(f.name);
    if (!nameMap.has(key)) nameMap.set(key, []);
    nameMap.get(key).push(f);
  }

  const candidateGroups = [];
  for (const [key, group] of nameMap.entries()) {
    if (group.length > 1) {
      candidateGroups.push({ key, files: group });
    }
  }

  const exactDuplicates = [];
  let potentialSavingsBytes = 0;
  let processedCandidates = 0;

  for (const cand of candidateGroups) {
    const shaMap = new Map();

    for (const file of cand.files) {
      if (!file.sha256) {
        file.sha256 = await computeBrowserSha256(file.rawFile || file);
      }

      if (!shaMap.has(file.sha256)) shaMap.set(file.sha256, []);
      shaMap.get(file.sha256).push(file);
    }

    for (const [sha, exactList] of shaMap.entries()) {
      if (exactList.length > 1) {
        const sorted = exactList.map(f => {
          let score = 100;
          const lower = f.name.toLowerCase();
          if (/\(\d+\)/.test(lower) || lower.includes('copy')) score -= 40;
          return { file: f, score };
        }).sort((a, b) => b.score - a.score);

        const evaluatedFiles = sorted.map((item, index) => ({
          ...item.file,
          isRecommendedKeep: index === 0,
          keepReason: index === 0 ? 'Original primary file' : 'Identified redundant duplicate copy'
        }));

        const recoverable = (exactList.length - 1) * exactList[0].size;
        potentialSavingsBytes += recoverable;

        exactDuplicates.push({
          id: Math.random().toString(36).substring(2),
          type: 'exact',
          canonicalName: cand.key,
          sha256: sha,
          fileCount: exactList.length,
          fileSize: exactList[0].size,
          potentialSaving: recoverable,
          files: evaluatedFiles
        });
      }
    }

    processedCandidates++;
    if (onProgress) {
      onProgress({
        percent: Math.round((processedCandidates / candidateGroups.length) * 100)
      });
    }
  }

  return {
    exactDuplicates,
    similarImages: [],
    totalExactGroups: exactDuplicates.length,
    totalSimilarGroups: 0,
    totalRedundantFiles: exactDuplicates.reduce((sum, g) => sum + (g.fileCount - 1), 0),
    potentialSavingsBytes,
    formattedSavings: formatBytes(potentialSavingsBytes)
  };
}

/**
 * Organizes files in browser and downloads a clean ZIP archive.
 */
export async function createOrganizedZipInBrowser(files, options = {}, onProgress) {
  const { folderName = 'Smart Organizer' } = options;
  const zip = new JSZip();
  const rootFolder = zip.folder(folderName);

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const cat = f.category || 'OtherFiles';
    const catFolder = BROWSER_CATEGORIES[cat]?.folder || 'Other Files';
    const categoryDir = rootFolder.folder(catFolder);

    const arrayBuffer = await (f.rawFile || f).arrayBuffer();
    categoryDir.file(f.name, arrayBuffer);

    if (onProgress) {
      onProgress({
        completed: i + 1,
        total: files.length,
        percent: Math.round(((i + 1) / files.length) * 100),
        currentFile: f.name
      });
    }
  }

  const content = await zip.generateAsync({ type: 'blob' }, (metadata) => {
    if (onProgress && metadata.percent) {
      onProgress({
        compressing: true,
        percent: Math.round(metadata.percent)
      });
    }
  });

  return content;
}

export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
