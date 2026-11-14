import fs from 'node:fs';
import path from 'node:path';
import { getDatabase } from './database.js';

/**
 * Returns full history of all organization operations.
 */
export function getOperationHistory() {
  const db = getDatabase();
  const rows = db.prepare(`
    SELECT * FROM operations ORDER BY created_at DESC
  `).all();

  return rows.map(row => ({
    ...row,
    formattedDate: new Date(row.created_at).toLocaleString()
  }));
}

/**
 * Undoes an organization operation, restoring all moved or copied files back to original state.
 */
export async function undoOperation(operationId) {
  const db = getDatabase();

  const op = db.prepare(`
    SELECT * FROM operations WHERE id = ?
  `).get(operationId);

  if (!op) {
    throw new Error(`Operation not found with ID: ${operationId}`);
  }

  if (op.status === 'undone') {
    throw new Error(`Operation has already been undone.`);
  }

  const items = db.prepare(`
    SELECT * FROM operation_items WHERE operation_id = ?
  `).all(operationId);

  let restoredCount = 0;
  const errors = [];
  const dirsToCleanup = new Set();

  for (const item of items) {
    try {
      if (fs.existsSync(item.organized_path)) {
        if (op.type === 'move') {
          // Restore moved file to original path
          const origDir = path.dirname(item.original_path);
          if (!fs.existsSync(origDir)) {
            fs.mkdirSync(origDir, { recursive: true });
          }

          // Handle if a file with same name appeared in original path
          let targetOrigPath = item.original_path;
          if (fs.existsSync(targetOrigPath) && targetOrigPath !== item.organized_path) {
            const parsed = path.parse(item.original_path);
            targetOrigPath = path.join(parsed.dir, `${parsed.name}_restored${parsed.ext}`);
          }

          try {
            fs.renameSync(item.organized_path, targetOrigPath);
          } catch (renErr) {
            if (renErr.code === 'EXDEV') {
              fs.copyFileSync(item.organized_path, targetOrigPath);
              fs.unlinkSync(item.organized_path);
            } else {
              throw renErr;
            }
          }
        } else if (op.type === 'copy') {
          // Remove the copied file
          fs.unlinkSync(item.organized_path);
        }

        dirsToCleanup.add(path.dirname(item.organized_path));
        restoredCount++;
      }
    } catch (err) {
      errors.push({ file: item.organized_path, error: err.message });
    }
  }

  // Prune any now-empty directories in the destination
  for (const dir of dirsToCleanup) {
    try {
      if (fs.existsSync(dir)) {
        const contents = fs.readdirSync(dir);
        if (contents.length === 0) {
          fs.rmdirSync(dir);
        }
      }
    } catch {}
  }

  // Update operation status
  db.prepare(`
    UPDATE operations SET status = 'undone' WHERE id = ?
  `).run(operationId);

  db.prepare(`
    UPDATE operation_items SET status = 'restored' WHERE operation_id = ?
  `).run(operationId);

  return {
    operationId,
    restoredCount,
    totalItems: items.length,
    status: 'undone',
    errors
  };
}
