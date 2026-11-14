#!/usr/bin/env node

import path from 'node:path';
import { DirectoryScanner } from '../server/core/scanner.js';
import { detectDuplicates } from '../server/core/duplicateDetector.js';
import { generateOrganizationPlan, executeOrganizationPlan } from '../server/core/organizer.js';
import { undoOperation, getOperationHistory } from '../server/core/recovery.js';

const args = process.argv.slice(2);
const command = args[0] || 'help';

async function main() {
  console.log('========================================================');
  console.log('  Universal Smart File Organizer — CLI Engine');
  console.log('========================================================\n');

  if (command === 'scan') {
    const target = args[1] || process.cwd();
    console.log(`Scanning target directory: ${target}`);
    const scanner = new DirectoryScanner();
    const result = await scanner.scan(target);
    console.log(`\nScan complete:`);
    console.log(`- Total Files: ${result.totalFiles}`);
    console.log(`- Total Size: ${(result.totalBytes / 1024 / 1024).toFixed(2)} MB`);
    console.log(`- Empty Folders: ${result.emptyFolders.length}`);

    const dups = await detectDuplicates(result.files);
    console.log(`- Exact Duplicate Sets: ${dups.totalExactGroups}`);
    console.log(`- Potential Storage Savings: ${dups.formattedSavings}`);
  } else if (command === 'organize') {
    const target = args[1] || process.cwd();
    const mode = args[2] === '--copy' ? 'copy' : 'move';
    console.log(`Analyzing target for safe organization (${mode} mode): ${target}`);

    const scanner = new DirectoryScanner();
    const result = await scanner.scan(target);
    const plan = generateOrganizationPlan(result.files, target, { mode });

    console.log(`\nProposed Plan:`);
    console.log(`- Files to organize: ${plan.totalFiles}`);
    console.log(`- Destination Root: ${plan.targetRootDir}`);
    console.log(`- Auto-resolved Conflicts: ${plan.conflictsCount}`);

    const execResult = await executeOrganizationPlan(plan);
    console.log(`\nExecution result: ${execResult.status}`);
    console.log(`- Successfully organized: ${execResult.successCount} files`);
    console.log(`- Operation ID (for undo): ${execResult.operationId}`);
  } else if (command === 'undo') {
    const opId = args[1];
    if (!opId) {
      console.log('Usage: node bin/organizer-cli.js undo <OPERATION_ID>');
      const history = getOperationHistory();
      if (history.length > 0) {
        console.log('\nRecent Operations:');
        for (const h of history.slice(0, 5)) {
          console.log(`- ID: ${h.id} (${h.type}, ${h.files_count} files, ${h.formattedDate}, Status: ${h.status})`);
        }
      }
      return;
    }

    console.log(`Rolling back operation ${opId}...`);
    const res = await undoOperation(opId);
    console.log(`✓ Restored ${res.restoredCount} files back to original locations!`);
  } else {
    console.log('Usage:');
    console.log('  node bin/organizer-cli.js scan [FOLDER_PATH]');
    console.log('  node bin/organizer-cli.js organize [FOLDER_PATH] [--copy|--move]');
    console.log('  node bin/organizer-cli.js undo <OPERATION_ID>');
    console.log('  npm start (launches desktop / local web UI)\n');
  }
}

main().catch(err => {
  console.error('CLI Error:', err.message);
  process.exit(1);
});
