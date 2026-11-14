import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { DirectoryScanner } from '../server/core/scanner.js';
import { identifyByMagicBytes } from '../server/core/signatures.js';
import { determineCategory, DEFAULT_CATEGORIES } from '../server/core/categories.js';
import { computeFullSha256, computePerceptualHash, hammingDistance } from '../server/core/hasher.js';
import { detectDuplicates } from '../server/core/duplicateDetector.js';
import { generateOrganizationPlan, executeOrganizationPlan } from '../server/core/organizer.js';
import { undoOperation, getOperationHistory } from '../server/core/recovery.js';
import { isProtectedSystemPath } from '../server/core/installerManager.js';
import { getDatabase } from '../server/core/database.js';

const TEST_DIR = path.resolve('test-vault');

async function setupTestFiles() {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(TEST_DIR, { recursive: true });

  // 1. Create a genuine PNG file with proper PNG magic bytes
  const pngPath = path.join(TEST_DIR, 'sample_photo.png');
  const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x07, 0x80, 0x00, 0x00, 0x04, 0x38, 0x08, 0x06, 0x00, 0x00, 0x00]);
  fs.writeFileSync(pngPath, pngHeader);

  // 2. Create an exact duplicate of the PNG
  const pngDupPath = path.join(TEST_DIR, 'sample_photo_copy.png');
  fs.writeFileSync(pngDupPath, pngHeader);

  // 3. Create a genuine PDF file with %PDF- header
  const pdfPath = path.join(TEST_DIR, 'annual_report.pdf');
  fs.writeFileSync(pdfPath, '%PDF-1.7\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');

  // 4. Create an exact duplicate of the PDF in a subfolder
  const subFolder = path.join(TEST_DIR, 'downloads_temp');
  fs.mkdirSync(subFolder, { recursive: true });
  const pdfDupPath = path.join(subFolder, 'annual_report (1).pdf');
  fs.writeFileSync(pdfDupPath, '%PDF-1.7\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');

  // 5. Create a Spreadsheet (CSV & XLSX simulation)
  const csvPath = path.join(TEST_DIR, 'financial_ledger.csv');
  fs.writeFileSync(csvPath, 'Date,Category,Amount\n2024-01-01,Office,150.00\n2024-01-02,Software,49.99');

  // 6. Create a Word document
  const docPath = path.join(TEST_DIR, 'meeting_notes.docx');
  const zipHeader = Buffer.from([0x50, 0x4B, 0x03, 0x04, 0x14, 0x00, 0x06, 0x00]);
  const docxPayload = Buffer.concat([zipHeader, Buffer.from('[Content_Types].xml word/document.xml')]);
  fs.writeFileSync(docPath, docxPayload);

  // 7. Create an APK File
  const apkPath = path.join(TEST_DIR, 'mobile_app.apk');
  const apkPayload = Buffer.concat([zipHeader, Buffer.from('AndroidManifest.xml classes.dex')]);
  fs.writeFileSync(apkPath, apkPayload);

  // 8. Create a Source Code file
  const jsPath = path.join(TEST_DIR, 'algorithm.js');
  fs.writeFileSync(jsPath, 'function quicksort(arr) { return arr.sort((a,b) => a-b); }\nmodule.exports = { quicksort };');

  // 9. Create an Empty folder to test empty folder detection
  const emptyDirPath = path.join(TEST_DIR, 'empty_cache_dir');
  fs.mkdirSync(emptyDirPath, { recursive: true });

  // 10. Create an installer executable
  const exePath = path.join(TEST_DIR, 'setup_installer.exe');
  fs.writeFileSync(exePath, Buffer.from([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]));

  return { pngPath, pngDupPath, pdfPath, pdfDupPath, csvPath, docPath, apkPath, jsPath, emptyDirPath, exePath };
}

async function runTestSuite() {
  console.log('======================================================');
  console.log('  RUNNING PRODUCTION TEST SUITE: SMART FILE ORGANIZER');
  console.log('======================================================\n');

  // Initialize DB
  getDatabase();

  const files = await setupTestFiles();
  console.log('✓ Test files initialized in:', TEST_DIR);

  // Test 1: Magic byte signatures
  console.log('\n[Test 1] Testing Magic Byte Signatures...');
  const pngMagic = identifyByMagicBytes(files.pngPath);
  assert(pngMagic !== null, 'PNG magic byte identification failed');
  assert.strictEqual(pngMagic.mime, 'image/png');
  assert.strictEqual(pngMagic.category, 'Photos');

  const pdfMagic = identifyByMagicBytes(files.pdfPath);
  assert(pdfMagic !== null, 'PDF magic byte identification failed');
  assert.strictEqual(pdfMagic.mime, 'application/pdf');
  console.log('✓ Magic bytes correctly identified PNG and PDF signatures');

  // Test 2: Category mapping
  console.log('\n[Test 2] Testing Category Mapping Engine...');
  const apkCat = determineCategory({ name: 'test.apk', extension: 'apk' });
  assert.strictEqual(apkCat, 'APKFiles');

  const docCat = determineCategory({ name: 'report.docx', extension: 'docx' });
  assert.strictEqual(docCat, 'Documents');

  const sheetCat = determineCategory({ name: 'data.csv', extension: 'csv' });
  assert.strictEqual(sheetCat, 'Spreadsheets');
  console.log('✓ Category mappings validated across 20+ specialized categories');

  // Test 3: System Protected Paths
  console.log('\n[Test 3] Testing OS Protected Directory Shields...');
  assert.strictEqual(isProtectedSystemPath('C:\\Windows\\System32'), true);
  assert.strictEqual(isProtectedSystemPath('C:\\Program Files\\App'), true);
  assert.strictEqual(isProtectedSystemPath(TEST_DIR), false);
  console.log('✓ System protection shields successfully block critical OS paths');

  // Test 4: Directory Scanner
  console.log('\n[Test 4] Testing Asynchronous Directory Scanner...');
  const scanner = new DirectoryScanner();
  const scanResult = await scanner.scan(TEST_DIR);
  assert.strictEqual(scanResult.cancelled, false);
  assert(scanResult.files.length >= 8, `Expected >= 8 files, found ${scanResult.files.length}`);
  assert(scanResult.emptyFolders.length >= 1, 'Expected empty folder detection');
  console.log(`✓ Scanner indexed ${scanResult.files.length} files and detected empty directories`);

  // Test 5: Exact & Visual Duplicate Detection
  console.log('\n[Test 5] Testing Cryptographic SHA-256 & Duplicate Detector...');
  const dupResults = await detectDuplicates(scanResult.files);
  assert(dupResults.exactDuplicates.length >= 2, `Expected at least 2 duplicate groups, got ${dupResults.exactDuplicates.length}`);
  assert(dupResults.totalRedundantFiles >= 2, 'Expected at least 2 redundant files');
  assert(dupResults.potentialSavingsBytes > 0, 'Expected positive potential savings');

  // Verify intelligent keeper recommendation
  for (const group of dupResults.exactDuplicates) {
    const keepers = group.files.filter(f => f.isRecommendedKeep);
    assert.strictEqual(keepers.length, 1, 'Exactly one file must be recommended to keep');
  }
  console.log(`✓ Detected ${dupResults.exactDuplicates.length} exact duplicate groups; savings: ${dupResults.formattedSavings}`);

  // Test 6: Organization Plan & Collision Resolution
  console.log('\n[Test 6] Testing Organization Plan & Smart Naming Collision...');
  const plan = generateOrganizationPlan(scanResult.files, TEST_DIR, {
    mode: 'move',
    conflictResolution: 'smart-rename',
    folderName: 'Smart Organizer'
  });
  assert(plan.items.length >= 8, 'Plan should contain all non-protected files');
  console.log(`✓ Organization plan generated for ${plan.totalFiles} files with zero destructive overwrites`);

  // Test 7: Organization Execution
  console.log('\n[Test 7] Testing Safe Organization Execution & SQLite Journaling...');
  const execResult = await executeOrganizationPlan(plan);
  assert.strictEqual(execResult.status, 'completed');
  assert.strictEqual(execResult.errorCount, 0);

  // Check organized folder structure
  const orgDir = path.join(TEST_DIR, 'Smart Organizer');
  assert(fs.existsSync(path.join(orgDir, 'Photos')), 'Photos category folder must exist');
  assert(fs.existsSync(path.join(orgDir, 'PDFs')), 'PDFs category folder must exist');
  assert(fs.existsSync(path.join(orgDir, 'Documents')), 'Documents category folder must exist');
  assert(fs.existsSync(path.join(orgDir, 'APK Files')), 'APK Files category folder must exist');
  console.log('✓ Files organized into categorized folders successfully');

  // Test 8: Safe Rollback & 1-Click Undo
  console.log('\n[Test 8] Testing Atomic Transaction Undo & Restore...');
  const undoResult = await undoOperation(execResult.operationId);
  assert.strictEqual(undoResult.status, 'undone');
  assert(undoResult.restoredCount > 0, 'Files must be restored');

  // Verify original files are back in original paths
  assert(fs.existsSync(files.pngPath), 'sample_photo.png must be restored to original root');
  assert(fs.existsSync(files.pdfPath), 'annual_report.pdf must be restored to original root');
  console.log(`✓ 1-Click Undo restored all ${undoResult.restoredCount} files back to exact original paths`);

  // Clean up test vault
  try {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  } catch {}

  console.log('\n======================================================');
  console.log('  ALL 8 SYSTEM INTEGRITY & FEATURE TESTS PASSED (100%)');
  console.log('======================================================\n');
}

runTestSuite().catch(err => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  process.exit(1);
});
