import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import EventEmitter from 'node:events';
import { identifyByMagicBytes } from './signatures.js';
import { determineCategory } from './categories.js';
import { computePartialHash, computeFullSha256, computePerceptualHash } from './hasher.js';
import { extractImageMetadata, classifyPhoto } from './photoManager.js';
import { getDocumentPreview, classifyDocument } from './documentManager.js';
import { classifyInstaller, isProtectedSystemPath } from './installerManager.js';

// Ignore directories and system caches
const IGNORED_DIRECTORY_NAMES = new Set([
  '$recycle.bin',
  'system volume information',
  '.git',
  '.svn',
  '.hg',
  'node_modules',
  '.gemini',
  '.vscode',
  '.idea',
  '__pycache__',
  'appdata\\local\\temp'
]);

export class DirectoryScanner extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = {
      computeDuplicates: true,
      computePerceptual: true,
      customRules: [],
      ...options
    };
    this.isCancelled = false;
    this.isPaused = false;
    this.totalFilesFound = 0;
    this.totalBytesFound = 0;
    this.processedFiles = 0;
    this.processedBytes = 0;
    this.startTime = 0;
  }

  cancel() {
    this.isCancelled = true;
    this.emit('cancelled');
  }

  pause() {
    this.isPaused = true;
    this.emit('paused');
  }

  resume() {
    this.isPaused = false;
    this.emit('resumed');
  }

  /**
   * Scans target folder(s).
   * Strict Safety Rule: Never recursively scan inside subfolders!
   * Only inspects files directly inside the folder(s) selected by the user.
   */
  async scan(targetInput) {
    this.startTime = Date.now();
    this.isCancelled = false;
    this.isPaused = false;
    this.totalFilesFound = 0;
    this.totalBytesFound = 0;
    this.processedFiles = 0;
    this.processedBytes = 0;

    const targets = Array.isArray(targetInput) ? targetInput : [targetInput];
    const normalizedRoots = [];

    for (const root of targets) {
      if (!root) continue;
      const normalized = path.resolve(root);
      if (!fs.existsSync(normalized)) {
        throw new Error(`Directory does not exist: ${root}`);
      }
      if (isProtectedSystemPath(normalized)) {
        throw new Error(`Scanning protected operating system root is prohibited for safety: ${root}`);
      }
      normalizedRoots.push(normalized);
    }

    if (normalizedRoots.length === 0) {
      throw new Error(`No valid target directories provided.`);
    }

    this.emit('start', { roots: normalizedRoots, time: this.startTime });

    const collectedFiles = [];
    const emptyFolders = [];

    // Phase 1: Inspect ONLY direct files inside the selected folder(s)
    for (const rootDir of normalizedRoots) {
      if (this.isCancelled) return { cancelled: true, files: [] };
      await this._inspectDirectFolder(rootDir, collectedFiles, emptyFolders);
    }

    if (this.isCancelled) return { cancelled: true, files: [] };

    this.totalFilesFound = collectedFiles.length;
    this.totalBytesFound = collectedFiles.reduce((sum, f) => sum + f.size, 0);

    this.emit('indexed', {
      totalFiles: this.totalFilesFound,
      totalBytes: this.totalBytesFound
    });

    // Phase 2: Detailed batch analysis (magic bytes, categories, signatures, hashes)
    const analyzedFiles = [];
    const batchSize = 32;

    for (let i = 0; i < collectedFiles.length; i += batchSize) {
      if (this.isCancelled) return { cancelled: true, files: [] };

      while (this.isPaused) {
        await new Promise(r => setTimeout(r, 200));
        if (this.isCancelled) return { cancelled: true, files: [] };
      }

      const chunk = collectedFiles.slice(i, i + batchSize);
      const analyzedChunk = await Promise.all(chunk.map(fileInfo => this._analyzeFile(fileInfo)));

      for (const item of analyzedChunk) {
        if (item) {
          analyzedFiles.push(item);
          this.processedFiles++;
          this.processedBytes += item.size;
        }
      }

      this.emit('progress', {
        processedFiles: this.processedFiles,
        totalFiles: this.totalFilesFound,
        processedBytes: this.processedBytes,
        totalBytes: this.totalBytesFound,
        percent: this.totalFilesFound > 0 ? Math.round((this.processedFiles / this.totalFilesFound) * 100) : 100,
        currentFile: chunk[chunk.length - 1]?.path
      });

      // Yield event loop
      await new Promise(r => setImmediate(r));
    }

    const durationMs = Date.now() - this.startTime;
    this.emit('complete', {
      totalFiles: analyzedFiles.length,
      totalBytes: this.processedBytes,
      emptyFolders,
      durationMs
    });

    return {
      cancelled: false,
      files: analyzedFiles,
      emptyFolders,
      totalFiles: analyzedFiles.length,
      totalBytes: this.processedBytes,
      durationMs
    };
  }

  /**
   * Strictly inspects files directly inside dirPath.
   * NEVER enters subdirectories or nested folders.
   */
  async _inspectDirectFolder(dirPath, collectedFiles, emptyFolders) {
    if (this.isCancelled) return;

    let entries = [];
    try {
      entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    } catch (err) {
      return;
    }

    let directFileCount = 0;

    for (const entry of entries) {
      if (this.isCancelled) return;

      const lowerName = entry.name.toLowerCase();
      if (IGNORED_DIRECTORY_NAMES.has(lowerName)) {
        continue;
      }

      // STRICT SAFETY RULE: Do NOT enter subfolders!
      // Subdirectories inside the user's selected folder are NOT traversed.
      if (entry.isDirectory()) {
        continue;
      }

      // Collect ONLY direct files
      if (entry.isFile() || entry.isSymbolicLink()) {
        const fullPath = path.join(dirPath, entry.name);
        try {
          const stats = await fs.promises.stat(fullPath);
          directFileCount++;
          collectedFiles.push({
            id: crypto.randomUUID(),
            path: fullPath,
            name: entry.name,
            size: stats.size,
            birthtime: stats.birthtime,
            mtime: stats.mtime,
            extension: path.extname(entry.name).toLowerCase().replace(/^\./, '')
          });
        } catch (err) {
          // File deleted or inaccessible
        }
      }
    }

    if (directFileCount === 0 && entries.length === 0) {
      emptyFolders.push(dirPath);
    }
  }

  async _analyzeFile(fileInfo) {
    try {
      // 1. Magic bytes identification
      const magic = identifyByMagicBytes(fileInfo.path);

      // 2. MIME type
      const mime = magic?.mime || null;

      // 3. Category assignment (with custom rules)
      const category = determineCategory(fileInfo, magic, this.options.customRules);

      // 4. Per-category deep analysis
      let photoMeta = null;
      let docMeta = null;
      let installerMeta = null;
      let phash = null;

      if (category === 'Photos') {
        const dimensions = extractImageMetadata(fileInfo.path, fileInfo.extension);
        const classification = classifyPhoto(fileInfo.name, dimensions, { mtime: fileInfo.mtime });
        photoMeta = { ...dimensions, ...classification };

        if (this.options.computePerceptual && fileInfo.size < 50 * 1024 * 1024) {
          phash = await computePerceptualHash(fileInfo.path, fileInfo.size);
        }
      } else if (['Documents', 'PDFs', 'Spreadsheets', 'Presentations', 'ProgrammingFiles'].includes(category)) {
        docMeta = {
          subtype: classifyDocument(fileInfo.extension),
          preview: getDocumentPreview(fileInfo.path, fileInfo.extension)
        };
      } else if (['Software', 'Applications', 'APKFiles'].includes(category)) {
        installerMeta = classifyInstaller(fileInfo.name, fileInfo.extension);
      }

      // 5. Fast partial hash for preliminary duplicate index
      let partialHash = null;
      if (this.options.computeDuplicates && fileInfo.size > 0) {
        try {
          partialHash = await computePartialHash(fileInfo.path, fileInfo.size);
        } catch {}
      }

      return {
        ...fileInfo,
        category,
        mime,
        magicDetected: !!magic,
        partialHash,
        phash,
        photoMeta,
        docMeta,
        installerMeta
      };
    } catch (err) {
      return {
        ...fileInfo,
        category: 'OtherFiles',
        mime: null,
        error: err.message
      };
    }
  }
}
