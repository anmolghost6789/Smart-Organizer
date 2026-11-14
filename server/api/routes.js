import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { DirectoryScanner } from '../core/scanner.js';
import { detectDuplicates, formatBytes } from '../core/duplicateDetector.js';
import { generateOrganizationPlan, executeOrganizationPlan } from '../core/organizer.js';
import { getOperationHistory, undoOperation } from '../core/recovery.js';
import { DEFAULT_CATEGORIES } from '../core/categories.js';
import { getDatabase } from '../core/database.js';
import { isProtectedSystemPath } from '../core/installerManager.js';

export function createApiRouter(wsBroadcast) {
  const router = express.Router();
  let activeScanner = null;
  let currentScanData = {
    files: [],
    emptyFolders: [],
    duplicates: null,
    status: 'idle',
    rootPath: '',
    stats: {
      totalFiles: 0,
      totalBytes: 0,
      scannedAt: null
    }
  };

  // 1. Start Scan
  router.post('/scan', async (req, res) => {
    const { folderPath, computeDuplicates = true, computePerceptual = true } = req.body;

    if (!folderPath || !fs.existsSync(folderPath)) {
      return res.status(400).json({ error: 'Valid folderPath is required.' });
    }

    if (activeScanner && !activeScanner.isCancelled) {
      return res.status(409).json({ error: 'A scan is already in progress.' });
    }

    try {
      activeScanner = new DirectoryScanner({
        computeDuplicates,
        computePerceptual
      });

      currentScanData.status = 'scanning';
      currentScanData.rootPath = folderPath;

      activeScanner.on('progress', data => {
        wsBroadcast({ type: 'SCAN_PROGRESS', payload: data });
      });

      activeScanner.on('complete', data => {
        wsBroadcast({ type: 'SCAN_COMPLETE', payload: data });
      });

      // Run scan in background
      activeScanner.scan(folderPath).then(async result => {
        if (!result.cancelled) {
          currentScanData.files = result.files;
          currentScanData.emptyFolders = result.emptyFolders;
          currentScanData.status = 'analyzing_duplicates';

          wsBroadcast({ type: 'SCAN_STATUS', payload: { status: 'analyzing_duplicates' } });

          // Run duplicate detection
          const dupResult = await detectDuplicates(result.files, { includePerceptual: computePerceptual });
          currentScanData.duplicates = dupResult;
          currentScanData.status = 'completed';
          currentScanData.stats = {
            totalFiles: result.totalFiles,
            totalBytes: result.totalBytes,
            scannedAt: new Date().toISOString(),
            rootPath: folderPath
          };

          // Save scan info to DB
          try {
            const db = getDatabase();
            const scanId = Date.now().toString();
            db.prepare(`
              INSERT INTO scans (id, folder_path, started_at, completed_at, total_files, total_size, status)
              VALUES (?, ?, ?, ?, ?, ?, 'completed')
            `).run(scanId, folderPath, new Date(activeScanner.startTime).toISOString(), new Date().toISOString(), result.totalFiles, result.totalBytes);
          } catch {}

          wsBroadcast({
            type: 'ANALYSIS_COMPLETE',
            payload: {
              stats: currentScanData.stats,
              duplicatesSummary: {
                totalExactGroups: dupResult.totalExactGroups,
                totalSimilarGroups: dupResult.totalSimilarGroups,
                totalRedundantFiles: dupResult.totalRedundantFiles,
                potentialSavingsBytes: dupResult.potentialSavingsBytes,
                formattedSavings: dupResult.formattedSavings
              }
            }
          });
        } else {
          currentScanData.status = 'cancelled';
        }
        activeScanner = null;
      }).catch(err => {
        currentScanData.status = 'error';
        wsBroadcast({ type: 'SCAN_ERROR', payload: { error: err.message } });
        activeScanner = null;
      });

      res.json({ message: 'Scan initiated', rootPath: folderPath });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 2. Scan controls
  router.post('/scan/cancel', (req, res) => {
    if (activeScanner) {
      activeScanner.cancel();
      currentScanData.status = 'cancelled';
      return res.json({ message: 'Scan cancelled.' });
    }
    res.json({ message: 'No active scan.' });
  });

  router.post('/scan/pause', (req, res) => {
    if (activeScanner) {
      activeScanner.pause();
      return res.json({ message: 'Scan paused.' });
    }
    res.json({ message: 'No active scan.' });
  });

  router.post('/scan/resume', (req, res) => {
    if (activeScanner) {
      activeScanner.resume();
      return res.json({ message: 'Scan resumed.' });
    }
    res.json({ message: 'No active scan.' });
  });

  // 3. Overall Dashboard Statistics
  router.get('/stats', (req, res) => {
    const db = getDatabase();
    let totalOrganizedFiles = 0;
    try {
      const row = db.prepare(`SELECT SUM(files_count) as total FROM operations WHERE status != 'undone'`).get();
      totalOrganizedFiles = row?.total || 0;
    } catch {}

    const totalFiles = currentScanData.files.length;
    const totalBytes = currentScanData.files.reduce((sum, f) => sum + f.size, 0);
    const duplicateCount = currentScanData.duplicates?.totalRedundantFiles || 0;
    const potentialSavingsBytes = currentScanData.duplicates?.potentialSavingsBytes || 0;

    res.json({
      status: currentScanData.status,
      rootPath: currentScanData.rootPath,
      totalFilesScanned: totalFiles,
      totalStorageBytes: totalBytes,
      formattedStorage: formatBytes(totalBytes),
      totalOrganizedFiles,
      duplicateFilesDetected: duplicateCount,
      potentialSavingsBytes,
      formattedSavings: formatBytes(potentialSavingsBytes),
      lastScanTime: currentScanData.stats.scannedAt
    });
  });

  // 4. File Listing & Filtering
  router.get('/files', (req, res) => {
    const { category, search, minSize, maxSize, limit = 500, offset = 0 } = req.query;
    let list = currentScanData.files;

    if (category && category !== 'All') {
      list = list.filter(f => f.category === category);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(f => f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q));
    }

    if (minSize) {
      list = list.filter(f => f.size >= parseInt(minSize, 10));
    }

    if (maxSize) {
      list = list.filter(f => f.size <= parseInt(maxSize, 10));
    }

    const total = list.length;
    const paginated = list.slice(Number(offset), Number(offset) + Number(limit));

    res.json({
      total,
      limit: Number(limit),
      offset: Number(offset),
      files: paginated
    });
  });

  // 5. Duplicates Data
  router.get('/duplicates', (req, res) => {
    if (!currentScanData.duplicates) {
      return res.json({
        exactDuplicates: [],
        similarImages: [],
        totalExactGroups: 0,
        totalSimilarGroups: 0,
        potentialSavingsBytes: 0,
        formattedSavings: '0 B'
      });
    }
    res.json(currentScanData.duplicates);
  });

  // 6. Safe Duplicate Deletion/Consolidation
  router.post('/duplicates/delete', (req, res) => {
    const { filePaths, moveToTrash = true } = req.body;

    if (!Array.isArray(filePaths) || filePaths.length === 0) {
      return res.status(400).json({ error: 'Array of filePaths is required.' });
    }

    const deleted = [];
    const errors = [];
    let recoveredBytes = 0;

    const trashDir = path.join(process.cwd(), '.desktopor_trash');
    if (moveToTrash && !fs.existsSync(trashDir)) {
      fs.mkdirSync(trashDir, { recursive: true });
    }

    for (const fPath of filePaths) {
      try {
        if (fs.existsSync(fPath)) {
          if (isProtectedSystemPath(fPath)) {
            continue; // Prohibit deleting protected system files
          }

          const stats = fs.statSync(fPath);
          if (stats.isDirectory()) {
            continue; // Prohibit deleting directories
          }

          const size = stats.size;

          if (moveToTrash) {
            const destTrash = path.join(trashDir, `${Date.now()}_${path.basename(fPath)}`);
            fs.renameSync(fPath, destTrash);
          } else {
            fs.unlinkSync(fPath);
          }

          recoveredBytes += size;
          deleted.push(fPath);

          // Remove from currentScanData in memory
          currentScanData.files = currentScanData.files.filter(f => f.path !== fPath);
        }
      } catch (err) {
        errors.push({ path: fPath, error: err.message });
      }
    }

    // Refresh duplicates
    if (currentScanData.duplicates) {
      for (const group of currentScanData.duplicates.exactDuplicates) {
        group.files = group.files.filter(f => !deleted.includes(f.path));
        group.fileCount = group.files.length;
      }
      currentScanData.duplicates.exactDuplicates = currentScanData.duplicates.exactDuplicates.filter(g => g.fileCount > 1);
      currentScanData.duplicates.potentialSavingsBytes = Math.max(0, currentScanData.duplicates.potentialSavingsBytes - recoveredBytes);
      currentScanData.duplicates.formattedSavings = formatBytes(currentScanData.duplicates.potentialSavingsBytes);
    }

    res.json({
      message: 'Duplicates handled successfully',
      deletedCount: deleted.length,
      recoveredBytes,
      formattedRecovered: formatBytes(recoveredBytes),
      errors
    });
  });

  // 7. Organization Plan Preview
  router.post('/organize/preview', (req, res) => {
    const { targetRootDir, mode = 'move', conflictResolution = 'smart-rename', groupByDate = false, selectedCategory = 'All' } = req.body;

    if (!targetRootDir) {
      return res.status(400).json({ error: 'targetRootDir is required.' });
    }

    let filesToOrganize = currentScanData.files;
    if (selectedCategory && selectedCategory !== 'All') {
      filesToOrganize = filesToOrganize.filter(f => f.category === selectedCategory);
    }

    if (filesToOrganize.length === 0) {
      return res.status(400).json({ error: 'No files available to organize. Please scan first.' });
    }

    try {
      const plan = generateOrganizationPlan(filesToOrganize, targetRootDir, {
        mode,
        conflictResolution,
        groupByDate
      });
      res.json(plan);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 8. Execute Organization Plan
  router.post('/organize/execute', async (req, res) => {
    const { plan } = req.body;

    if (!plan || !Array.isArray(plan.items) || plan.items.length === 0) {
      return res.status(400).json({ error: 'Valid plan is required.' });
    }

    try {
      const result = await executeOrganizationPlan(plan, progress => {
        wsBroadcast({ type: 'ORGANIZE_PROGRESS', payload: progress });
      });

      // Update currentScanData file paths if moved
      if (plan.mode === 'move') {
        const pathMap = new Map();
        for (const it of plan.items) {
          pathMap.set(it.sourcePath, it.destPath);
        }
        for (const file of currentScanData.files) {
          if (pathMap.has(file.path)) {
            file.path = pathMap.get(file.path);
            file.name = path.basename(file.path);
          }
        }
      }

      wsBroadcast({ type: 'ORGANIZE_COMPLETE', payload: result });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 9. Operation History & Undo
  router.get('/history', (req, res) => {
    try {
      const history = getOperationHistory();
      res.json(history);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/history/undo', async (req, res) => {
    const { operationId } = req.body;
    if (!operationId) {
      return res.status(400).json({ error: 'operationId is required.' });
    }

    try {
      const result = await undoOperation(operationId);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 10. Categories Breakdown
  router.get('/categories', (req, res) => {
    const counts = {};
    const sizes = {};

    for (const key of Object.keys(DEFAULT_CATEGORIES)) {
      counts[key] = 0;
      sizes[key] = 0;
    }

    for (const file of currentScanData.files) {
      const cat = file.category || 'OtherFiles';
      counts[cat] = (counts[cat] || 0) + 1;
      sizes[cat] = (sizes[cat] || 0) + file.size;
    }

    const categoriesList = Object.entries(DEFAULT_CATEGORIES).map(([key, def]) => ({
      key,
      name: def.folder,
      icon: def.icon,
      color: def.color,
      description: def.description,
      fileCount: counts[key] || 0,
      totalBytes: sizes[key] || 0,
      formattedSize: formatBytes(sizes[key] || 0),
      extensions: def.extensions
    }));

    res.json(categoriesList);
  });

  // 11. Storage Analysis & Clutter Inspection
  router.get('/storage-analysis', (req, res) => {
    const files = currentScanData.files;
    const totalBytes = files.reduce((acc, f) => acc + f.size, 0);

    // Large files: > 50MB, sorted descending
    const largeFiles = files
      .filter(f => f.size > 50 * 1024 * 1024)
      .sort((a, b) => b.size - a.size)
      .slice(0, 50)
      .map(f => ({ ...f, formattedSize: formatBytes(f.size) }));

    // Temporary / cache files
    const tempExtensions = new Set(['tmp', 'temp', 'log', 'bak', 'old', 'cache', 'dmp', 'crash']);
    const tempFiles = files.filter(f => {
      const ext = (f.extension || '').toLowerCase();
      const lower = f.name.toLowerCase();
      return tempExtensions.has(ext) || lower.startsWith('~') || lower === 'thumbs.db' || lower === '.ds_store';
    });

    const tempTotalBytes = tempFiles.reduce((acc, f) => acc + f.size, 0);

    res.json({
      totalBytes,
      formattedTotal: formatBytes(totalBytes),
      largeFiles,
      largeFilesCount: largeFiles.length,
      emptyFolders: currentScanData.emptyFolders,
      emptyFoldersCount: currentScanData.emptyFolders.length,
      tempFilesCount: tempFiles.length,
      tempTotalBytes,
      formattedTempSize: formatBytes(tempTotalBytes)
    });
  });

  // 12. Cleanup Empty Folders
  router.post('/storage/cleanup-empty', (req, res) => {
    const deleted = [];
    const errors = [];

    for (const folder of currentScanData.emptyFolders) {
      try {
        if (fs.existsSync(folder)) {
          fs.rmdirSync(folder);
          deleted.push(folder);
        }
      } catch (err) {
        errors.push({ folder, error: err.message });
      }
    }

    currentScanData.emptyFolders = currentScanData.emptyFolders.filter(f => !deleted.includes(f));
    res.json({ deletedCount: deleted.length, deleted, errors });
  });

  // 13. System Reveal / Open File in OS Explorer
  router.post('/open-path', (req, res) => {
    const { targetPath } = req.body;
    if (!targetPath || !fs.existsSync(targetPath)) {
      return res.status(400).json({ error: 'Path does not exist.' });
    }

    try {
      const isWin = process.platform === 'win32';
      const isMac = process.platform === 'darwin';

      if (isWin) {
        // Windows Explorer reveal
        spawn('explorer.exe', ['/select,', path.normalize(targetPath)], { detached: true });
      } else if (isMac) {
        spawn('open', ['-R', targetPath], { detached: true });
      } else {
        spawn('xdg-open', [path.dirname(targetPath)], { detached: true });
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 14. Custom Rules
  router.get('/rules', (req, res) => {
    try {
      const db = getDatabase();
      const rules = db.prepare(`SELECT * FROM custom_rules ORDER BY created_at DESC`).all();
      res.json(rules);
    } catch {
      res.json([]);
    }
  });

  router.post('/rules', (req, res) => {
    const { type, pattern, targetCategory } = req.body;
    if (!type || !pattern || !targetCategory) {
      return res.status(400).json({ error: 'type, pattern and targetCategory are required.' });
    }

    try {
      const db = getDatabase();
      const id = Date.now().toString();
      db.prepare(`
        INSERT INTO custom_rules (id, type, pattern, target_category, enabled, created_at)
        VALUES (?, ?, ?, ?, 1, ?)
      `).run(id, type, pattern, targetCategory, new Date().toISOString());

      res.json({ id, type, pattern, targetCategory, enabled: 1 });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
