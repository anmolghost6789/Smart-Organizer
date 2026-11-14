import crypto from 'node:crypto';
import path from 'node:path';
import { computeFullSha256, hammingDistance } from './hasher.js';

/**
 * Normalizes a filename to compare filenames first, including file extensions.
 * Strips common copy/download suffixes to match duplicate candidates.
 *
 * Examples:
 *   "report.pdf" -> "report.pdf"
 *   "report (1).pdf" -> "report.pdf"
 *   "report (2).pdf" -> "report.pdf"
 *   "report - Copy.pdf" -> "report.pdf"
 *   "report - Copy (2).pdf" -> "report.pdf"
 *   "report_copy.pdf" -> "report.pdf"
 *
 * But:
 *   "different_file.pdf" -> "different_file.pdf" (Does NOT match "report.pdf")
 *   "report.docx" -> "report.docx" (Does NOT match "report.pdf" - extension must match)
 */
export function getCanonicalFilenameKey(filename) {
  if (!filename) return '';
  const ext = path.extname(filename).toLowerCase();
  const base = path.basename(filename, ext);

  // Strip duplicate/copy suffixes (case-insensitive)
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
 * Intelligent Duplicate and Similarity Detection Engine.
 *
 * Core Safety Rules:
 * 1. Never identify files as duplicates based only on file size.
 * 2. Compare filenames first, including file extensions. Only files with matching filenames are candidates.
 * 3. Verify file content using cryptographic SHA-256 before confirming an actual duplicate.
 *    Same filename but different content must NEVER be marked as duplicates or deleted.
 * 4. Never automatically delete anything. Show candidates and require user confirmation.
 */
export async function detectDuplicates(files, options = {}) {
  const { includePerceptual = true, maxPerceptualHamming = 6 } = options;

  // 1. Group files by matching filename FIRST (including file extension)
  const filenameCandidateMap = new Map();

  for (const file of files) {
    if (file.size <= 0) continue; // Skip 0-byte empty files

    const canonicalKey = getCanonicalFilenameKey(file.name);
    if (!filenameCandidateMap.has(canonicalKey)) {
      filenameCandidateMap.set(canonicalKey, []);
    }
    filenameCandidateMap.get(canonicalKey).push(file);
  }

  // 2. Filter groups: only files with MATCHING FILENAMES become duplicate candidates
  const matchingNameCandidates = [];
  for (const [key, group] of filenameCandidateMap.entries()) {
    if (group.length > 1) {
      matchingNameCandidates.push({ canonicalKey: key, files: group });
    }
  }

  // 3. For each candidate group with matching filenames, verify content using SHA-256
  const exactDuplicates = [];
  let potentialSavingsBytes = 0;

  for (const candidate of matchingNameCandidates) {
    const shaMap = new Map();

    for (const file of candidate.files) {
      if (!file.sha256) {
        try {
          file.sha256 = await computeFullSha256(file.path);
        } catch {
          continue;
        }
      }

      if (!shaMap.has(file.sha256)) {
        shaMap.set(file.sha256, []);
      }
      shaMap.get(file.sha256).push(file);
    }

    // Only files with matching filename AND identical SHA-256 hash are confirmed duplicates
    for (const [sha, exactList] of shaMap.entries()) {
      if (exactList.length > 1) {
        // Smart recommendation for which copy to KEEP (original vs copies)
        const evaluatedFiles = evaluateRetention(exactList);
        const recoverable = (exactList.length - 1) * exactList[0].size;
        potentialSavingsBytes += recoverable;

        exactDuplicates.push({
          id: crypto.randomUUID(),
          type: 'exact',
          canonicalName: candidate.canonicalKey,
          sha256: sha,
          fileCount: exactList.length,
          fileSize: exactList[0].size,
          potentialSaving: recoverable,
          files: evaluatedFiles
        });
      }
    }
  }

  // 4. Perceptual Similar Images:
  // Must ALSO respect matching filenames! Never group completely different images as duplicates.
  const similarImages = [];
  if (includePerceptual) {
    for (const candidate of matchingNameCandidates) {
      const photos = candidate.files.filter(f => f.category === 'Photos' && f.phash);
      if (photos.length <= 1) continue;

      const visited = new Set();
      for (let i = 0; i < photos.length; i++) {
        if (visited.has(photos[i].id)) continue;
        const group = [photos[i]];

        for (let j = i + 1; j < photos.length; j++) {
          if (visited.has(photos[j].id)) continue;

          // Skip if already confirmed in exact duplicate set with same SHA
          if (photos[i].sha256 && photos[i].sha256 === photos[j].sha256) {
            continue;
          }

          const dist = hammingDistance(photos[i].phash, photos[j].phash);
          if (dist <= maxPerceptualHamming) {
            group.push({ ...photos[j], hammingDistance: dist });
            visited.add(photos[j].id);
          }
        }

        if (group.length > 1) {
          visited.add(photos[i].id);
          const evaluated = evaluateRetention(group);
          similarImages.push({
            id: crypto.randomUUID(),
            type: 'similar',
            canonicalName: candidate.canonicalKey,
            fileCount: group.length,
            files: evaluated
          });
        }
      }
    }
  }

  return {
    exactDuplicates,
    similarImages,
    totalExactGroups: exactDuplicates.length,
    totalSimilarGroups: similarImages.length,
    totalRedundantFiles: exactDuplicates.reduce((sum, g) => sum + (g.fileCount - 1), 0),
    potentialSavingsBytes,
    formattedSavings: formatBytes(potentialSavingsBytes)
  };
}

/**
 * Evaluates a list of duplicate files to intelligently recommend which copy to KEEP.
 * Prioritizes the original file over downloaded copies with (1) or - Copy.
 */
function evaluateRetention(files) {
  const scored = files.map(file => {
    let score = 100;
    const lowerName = file.name.toLowerCase();
    const lowerPath = file.path.toLowerCase();

    // Heavy penalty for copy suffixes like (1), - Copy, _copy
    if (/\(\d+\)/.test(lowerName) || lowerName.includes('copy') || lowerName.includes('duplicate')) {
      score -= 40;
    }

    // Penalty for temporary/download subpaths
    if (lowerPath.includes('temp') || lowerPath.includes('tmp')) {
      score -= 20;
    }

    // Bonus for higher image resolution if available
    if (file.photoMeta && file.photoMeta.width && file.photoMeta.height) {
      score += Math.min(25, Math.floor((file.photoMeta.width * file.photoMeta.height) / 100000));
    }

    // Bonus for earlier timestamp (older original file)
    const time = new Date(file.birthtime || file.mtime || 0).getTime();
    return { file, score, time };
  });

  // Sort descending by score (highest quality original first), then oldest time
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.time - b.time;
  });

  return scored.map((item, index) => ({
    ...item.file,
    isRecommendedKeep: index === 0,
    keepReason: index === 0
      ? 'Original primary file (Cleanest filename & verified creation)'
      : 'Identified redundant duplicate copy'
  }));
}

export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
