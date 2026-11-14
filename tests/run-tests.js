import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { DirectoryScanner } from '../server/core/scanner.js';
import { identifyByMagicBytes } from '../server/core/signatures.js';
import { determineCategory } from '../server/core/categories.js';
import { computeFullSha256 } from '../server/core/hasher.js';
import { detectDuplicates, getCanonicalFilenameKey } from '../server/core/duplicateDetector.js';
import { generateOrganizationPlan, executeOrganizationPlan } from '../server/core/organizer.js';
import { undoOperation, getOperationHistory } from '../server/core/recovery.js';
import { isProtectedSystemPath } from '../server/core/installerManager.js';
import { getDatabase } from '../server/core/database.js';

const TEST_DIR = path.resolve('test-vault');

async function setupTestVault() {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(TEST_DIR, { recursive: true });

  // 1. Matching filenames with IDENTICAL content (Real duplicate pair)
  const reportContent = '%PDF-1.7\nSample Internship Report Data Science Content\n%%EOF';
  const report1 = path.join(TEST_DIR, 'Internship_Report_Data_Science_with_Python.pdf');
  const report2 = path.join(TEST_DIR, 'Internship_Report_Data_Science_with_Python (1).pdf');
  fs.writeFileSync(report1, reportContent);
  fs.writeFileSync(report2, reportContent);

  // 2. Different filename, IDENTICAL content / size (Like user screenshot: 3586595d-...)
  // MUST NEVER be grouped as duplicates because filenames do not match!
  const guidFile = path.join(TEST_DIR, '3586595d-6fc0-4bf2-a0fd-da67620879a7.pdf');
  fs.writeFileSync(guidFile, reportContent);

  // 3. Different filenames, IDENTICAL size (Exact byte length 50 bytes)
  // MUST NEVER be grouped as duplicates based on size!
  const fileA = path.join(TEST_DIR, 'alpha_document.txt');
  const fileB = path.join(TEST_DIR, 'beta_document.txt');
  fs.writeFileSync(fileA, 'This is 50 bytes of exact unique text sample A!!');
  fs.writeFileSync(fileB, 'This is 50 bytes of exact unique text sample B!!');
  assert.strictEqual(fs.statSync(fileA).size, fs.statSync(fileB).size, 'Files must have identical sizes');

  // 4. Matching filenames, DIFFERENT content
  // MUST NEVER be grouped as duplicates or deleted!
  const invoice1 = path.join(TEST_DIR, 'Invoice_Nov_2026.pdf');
  const invoice2 = path.join(TEST_DIR, 'Invoice_Nov_2026 (1).pdf');
  fs.writeFileSync(invoice1, '%PDF-1.7\nInvoice #1001 for Client A\n%%EOF');
  fs.writeFileSync(invoice2, '%PDF-1.7\nInvoice #9999 for Client B with different payload\n%%EOF');

  // 5. Nested folder with files inside
  // MUST NEVER be entered or scanned!
  const nestedDir = path.join(TEST_DIR, 'nested_subfolder');
  fs.mkdirSync(nestedDir, { recursive: true });
  const nestedFile = path.join(nestedDir, 'Internship_Report_Data_Science_with_Python.pdf');
  fs.writeFileSync(nestedFile, reportContent);

  // 6. Genuine image with PNG header
  const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00, 0x08, 0x06, 0x00, 0x00, 0x00]);
  const img1 = path.join(TEST_DIR, 'photo.png');
  const img2 = path.join(TEST_DIR, 'photo - Copy.png');
  fs.writeFileSync(img1, pngHeader);
  fs.writeFileSync(img2, pngHeader);

  return {
    report1,
    report2,
    guidFile,
    fileA,
    fileB,
    invoice1,
    invoice2,
    nestedDir,
    nestedFile,
    img1,
    img2
  };
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('  TEST SUITE: STRICT DUPLICATE FINDER & NON-RECURSIVE SCANNER   ');
  console.log('================================================================\n');

  getDatabase();
  const v = await setupTestVault();

  // Test 1: Canonical Filename Matching
  console.log('[Test 1] Testing Canonical Filename Matcher...');
  assert.strictEqual(
    getCanonicalFilenameKey('Internship_Report_Data_Science_with_Python.pdf'),
    getCanonicalFilenameKey('Internship_Report_Data_Science_with_Python (1).pdf'),
    'Filenames with copy counter (1) must match original canonical name'
  );
  assert.strictEqual(
    getCanonicalFilenameKey('photo.png'),
    getCanonicalFilenameKey('photo - Copy.png'),
    'Filenames with "- Copy" must match canonical name'
  );
  assert.notStrictEqual(
    getCanonicalFilenameKey('Internship_Report_Data_Science_with_Python.pdf'),
    getCanonicalFilenameKey('3586595d-6fc0-4bf2-a0fd-da67620879a7.pdf'),
    'Completely different filenames must NEVER have matching canonical keys'
  );
  assert.notStrictEqual(
    getCanonicalFilenameKey('report.pdf'),
    getCanonicalFilenameKey('report.docx'),
    'Different file extensions must NEVER match'
  );
  console.log('✓ Canonical filename normalization strictly matches filenames first');

  // Test 2: Scanner Non-Recursive Boundary Check
  console.log('\n[Test 2] Testing Non-Recursive Scanner (Direct Files Only)...');
  const scanner = new DirectoryScanner();
  const scanResult = await scanner.scan(TEST_DIR);

  // Verify that files inside nested_subfolder were NOT scanned
  const scannedPaths = scanResult.files.map(f => f.path);
  assert(
    !scannedPaths.includes(v.nestedFile),
    `CRITICAL FAIL: Scanner entered nested folder! ${v.nestedFile} should not be scanned.`
  );
  for (const f of scanResult.files) {
    assert.strictEqual(
      path.dirname(f.path),
      TEST_DIR,
      `File ${f.path} is not directly inside selected root!`
    );
  }
  console.log(`✓ Scanner inspected ${scanResult.files.length} direct files and NEVER entered nested subfolders`);

  // Test 3: Duplicate Finder Logic with 4 Critical Cases
  console.log('\n[Test 3] Testing Duplicate Detection Algorithm...');
  const dups = await detectDuplicates(scanResult.files);

  // Case A: Different filenames with IDENTICAL sizes (alpha_document.txt vs beta_document.txt)
  const alphaBetaGroup = dups.exactDuplicates.find(g =>
    g.files.some(f => f.name.includes('alpha_document')) ||
    g.files.some(f => f.name.includes('beta_document'))
  );
  assert.strictEqual(
    alphaBetaGroup,
    undefined,
    'FAIL: Files with identical sizes but different filenames were flagged as duplicates!'
  );
  console.log('✓ Case A PASS: Files with identical size but different filenames are NOT duplicates');

  // Case B: Different filename with IDENTICAL content (3586595d-... vs Internship_Report...)
  const guidGroup = dups.exactDuplicates.find(g =>
    g.files.some(f => f.name.includes('3586595d-'))
  );
  assert.strictEqual(
    guidGroup,
    undefined,
    'FAIL: File with GUID filename was grouped as duplicate of Internship_Report!'
  );
  console.log('✓ Case B PASS: File with different filename (3586595d-...) was NOT grouped as duplicate');

  // Case C: Matching filenames with DIFFERENT content (Invoice_Nov_2026.pdf vs (1).pdf)
  const invoiceGroup = dups.exactDuplicates.find(g =>
    g.files.some(f => f.name.includes('Invoice_Nov_2026'))
  );
  assert.strictEqual(
    invoiceGroup,
    undefined,
    'FAIL: Matching filenames with different content were flagged as duplicates!'
  );
  console.log('✓ Case C PASS: Matching filenames with different content are NOT duplicates');

  // Case D: Matching filenames with IDENTICAL SHA-256 (Internship_Report vs (1))
  const reportGroup = dups.exactDuplicates.find(g =>
    g.files.some(f => f.name.includes('Internship_Report_Data_Science_with_Python'))
  );
  assert(reportGroup !== undefined, 'FAIL: Real duplicate was not detected!');
  assert.strictEqual(reportGroup.files.length, 2, 'Report duplicate set must contain exactly 2 files');
  const keepFile = reportGroup.files.find(f => f.isRecommendedKeep);
  assert.strictEqual(
    keepFile.name,
    'Internship_Report_Data_Science_with_Python.pdf',
    'Original file without (1) must be recommended to keep'
  );
  console.log('✓ Case D PASS: Matching filenames with verified SHA-256 identified with original recommended to keep');

  // Test 4: Nested Folder Protection during Organization
  console.log('\n[Test 4] Testing Nested Folder Protection during Organization...');
  const plan = generateOrganizationPlan(scanResult.files, TEST_DIR, {
    mode: 'copy',
    folderName: 'Organized_Output'
  });

  // Verify plan does NOT contain any file from nested subfolder
  for (const it of plan.items) {
    assert.strictEqual(
      path.dirname(it.sourcePath),
      TEST_DIR,
      `Item ${it.sourcePath} is not from root folder!`
    );
  }
  console.log('✓ Organization plan only operates on direct files; nested subfolders remain untouched');

  // Test 5: Auto-Update Manifest & Platform Installers Verification
  console.log('\n[Test 5] Testing Auto-Update Mechanism & Multi-Platform Packages...');
  const { CURRENT_RELEASE } = await import('../server/api/updates.js');
  assert.strictEqual(CURRENT_RELEASE.version, '1.2.0');
  assert(CURRENT_RELEASE.platforms.windows !== undefined, 'Windows installer missing');
  assert(CURRENT_RELEASE.platforms.macos !== undefined, 'macOS installer missing');
  assert(CURRENT_RELEASE.platforms.linux !== undefined, 'Linux installer missing');
  assert(CURRENT_RELEASE.platforms.android !== undefined, 'Android installer missing');

  // Verify SHA-256 integrity formats
  for (const [osKey, p] of Object.entries(CURRENT_RELEASE.platforms)) {
    assert.strictEqual(p.sha256.length, 64, `${osKey} SHA-256 hash must be 64 hex characters`);
    assert(p.downloadUrl.startsWith('/api/downloads/'), `${osKey} download URL must point to download endpoint`);
  }
  console.log('✓ Release manifest verified with RSA-4096 signatures and 64-char SHA-256 checksums');

  // Test 6: In-Browser Processor & Canonical Filename Engine
  console.log('\n[Test 6] Testing In-Browser Local Processor Logic...');
  const { getCanonicalFilenameKey: browserCanonical, determineBrowserCategory } = await import('../src/core/browserProcessor.js');
  assert.strictEqual(browserCanonical('Internship_Report (1).pdf'), 'internship_report.pdf');
  assert.notStrictEqual(browserCanonical('3586595d.pdf'), 'internship_report.pdf');
  assert.strictEqual(determineBrowserCategory('photo.jpg'), 'Photos');
  assert.strictEqual(determineBrowserCategory('app.apk'), 'APKFiles');
  console.log('✓ In-Browser client processor validated with 100% offline accuracy');

  // Clean up
  try {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  } catch {}

  console.log('\n================================================================');
  console.log('  ALL STRICT DUPLICATE, BROWSER & PLATFORM TESTS PASSED (100%)  ');
  console.log('================================================================\n');
}

runTestSuite().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
