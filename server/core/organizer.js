import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { getCategoryFolder } from './categories.js';
import { isProtectedSystemPath } from './installerManager.js';
import { getDatabase } from './database.js';

/**
 * Generates an organization plan (dry-run preview) without executing any file changes.
 */
export function generateOrganizationPlan(files, targetRootDir, options = {}) {
  const {
    mode = 'move', // 'move' or 'copy'
    conflictResolution = 'smart-rename', // 'smart-rename', 'skip', 'overwrite'
    groupByDate = false,
    folderName = 'Smart Organizer'
  } = options;

  const resolvedTarget = path.resolve(targetRootDir, folderName);
  const plannedItems = [];
  let conflictsCount = 0;
  const categoriesSummary = {};

  // Track planned destination paths in memory to avoid collisions among moved files
  const plannedDestPaths = new Set();

  for (const file of files) {
    if (isProtectedSystemPath(file.path)) {
      continue; // Never touch protected system files
    }

    const categoryFolder = getCategoryFolder(file.category);
    let subDirectory = categoryFolder;

    // Optional date-wise subfolders for photos or documents
    if (groupByDate && file.photoMeta?.yearMonth) {
      subDirectory = path.join(categoryFolder, file.photoMeta.yearMonth);
    }

    const targetDir = path.join(resolvedTarget, subDirectory);
    let targetFileName = file.name;
    let targetPath = path.join(targetDir, targetFileName);

    let hasConflict = fs.existsSync(targetPath) || plannedDestPaths.has(targetPath.toLowerCase());
    let conflictAction = 'none';

    if (hasConflict) {
      conflictsCount++;
      if (conflictResolution === 'skip') {
        continue;
      } else if (conflictResolution === 'smart-rename') {
        const parsed = path.parse(file.name);
        let counter = 1;
        while (
          fs.existsSync(targetPath) ||
          plannedDestPaths.has(targetPath.toLowerCase())
        ) {
          targetFileName = `${parsed.name} (${counter})${parsed.ext}`;
          targetPath = path.join(targetDir, targetFileName);
          counter++;
        }
        conflictAction = 'renamed';
      } else if (conflictResolution === 'overwrite') {
        conflictAction = 'overwrite';
      }
    }

    plannedDestPaths.add(targetPath.toLowerCase());

    if (!categoriesSummary[categoryFolder]) {
      categoriesSummary[categoryFolder] = { count: 0, totalSize: 0 };
    }
    categoriesSummary[categoryFolder].count++;
    categoriesSummary[categoryFolder].totalSize += file.size;

    plannedItems.push({
      id: crypto.randomUUID(),
      sourcePath: file.path,
      destPath: targetPath,
      targetDir,
      fileName: file.name,
      finalFileName: targetFileName,
      size: file.size,
      category: file.category,
      categoryFolder,
      mode,
      conflictAction
    });
  }

  return {
    operationId: crypto.randomUUID(),
    mode,
    conflictResolution,
    targetRootDir: resolvedTarget,
    totalFiles: plannedItems.length,
    totalBytes: plannedItems.reduce((acc, it) => acc + it.size, 0),
    conflictsCount,
    categoriesSummary,
    items: plannedItems
  };
}

/**
 * Executes a planned organization operation with complete transactional logging.
 */
export async function executeOrganizationPlan(plan, onProgress = null) {
  const db = getDatabase();
  const opId = plan.operationId || crypto.randomUUID();
  const now = new Date().toISOString();

  // Create operation transaction header in DB
  const insertOpStmt = db.prepare(`
    INSERT INTO operations (id, type, source_dir, target_dir, files_count, total_size, created_at, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
  `);
  insertOpStmt.run(
    opId,
    plan.mode,
    path.dirname(plan.items[0]?.sourcePath || ''),
    plan.targetRootDir,
    plan.items.length,
    plan.totalBytes,
    now
  );

  const insertItemStmt = db.prepare(`
    INSERT INTO operation_items (id, operation_id, original_path, organized_path, file_size, status)
    VALUES (?, ?, ?, ?, ?, 'active')
  `);

  const executedItems = [];
  const errors = [];

  for (let i = 0; i < plan.items.length; i++) {
    const item = plan.items[i];
    try {
      // Ensure target folder exists
      if (!fs.existsSync(item.targetDir)) {
        fs.mkdirSync(item.targetDir, { recursive: true });
      }

      if (plan.mode === 'copy') {
        fs.copyFileSync(item.sourcePath, item.destPath);
      } else {
        // Move file
        try {
          fs.renameSync(item.sourcePath, item.destPath);
        } catch (renameErr) {
          // If across distinct drive partitions (EXDEV), fallback to copy + unlink
          if (renameErr.code === 'EXDEV') {
            fs.copyFileSync(item.sourcePath, item.destPath);
            fs.unlinkSync(item.sourcePath);
          } else {
            throw renameErr;
          }
        }
      }

      insertItemStmt.run(
        crypto.randomUUID(),
        opId,
        item.sourcePath,
        item.destPath,
        item.size
      );

      executedItems.push(item);

      if (onProgress) {
        onProgress({
          completed: i + 1,
          total: plan.items.length,
          currentFile: item.fileName,
          percent: Math.round(((i + 1) / plan.items.length) * 100)
        });
      }
    } catch (err) {
      errors.push({ file: item.sourcePath, error: err.message });
    }
  }

  // Finalize operation status
  const updateStatusStmt = db.prepare(`
    UPDATE operations SET status = ? WHERE id = ?
  `);
  updateStatusStmt.run(errors.length === 0 ? 'completed' : 'partially_completed', opId);

  return {
    operationId: opId,
    status: errors.length === 0 ? 'completed' : 'partially_completed',
    successCount: executedItems.length,
    errorCount: errors.length,
    errors
  };
}
