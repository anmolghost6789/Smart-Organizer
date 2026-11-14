import crypto from 'node:crypto';
import path from 'node:path';
import { computeFullSha256, hammingDistance } from './hasher.js';

/**
 * Intelligent Duplicate and Similarity Detection Engine.
 */
export async function detectDuplicates(files, options = {}) {
  const { includePerceptual = true, maxPerceptualHamming = 6 } = options;

  // 1. Group by exact file size
  const sizeMap = new Map();
  for (const file of files) {
    if (file.size <= 0) continue; // Skip 0-byte empty files
    if (!sizeMap.has(file.size)) {
      sizeMap.set(file.size, []);
    }
    sizeMap.get(file.size).push(file);
  }

  // 2. Filter size groups that have >= 2 files
  const candidateGroups = [];
  for (const group of sizeMap.values()) {
    if (group.length > 1) {
      candidateGroups.push(group);
    }
  }

  // 3. Compare partial hashes and compute full SHA-256 for exact matches
  const exactDuplicates = [];
  let potentialSavingsBytes = 0;

  for (const group of candidateGroups) {
    // Sub-group by partial hash
    const partialMap = new Map();
    for (const f of group) {
      const pHash = f.partialHash || 'none';
      if (!partialMap.has(pHash)) {
        partialMap.set(pHash, []);
      }
      partialMap.get(pHash).push(f);
    }

    for (const pSubGroup of partialMap.values()) {
      if (pSubGroup.length <= 1) continue;

      // Now compute full cryptographic SHA-256 for definitive match
      const shaMap = new Map();
      for (const f of pSubGroup) {
        if (!f.sha256) {
          try {
            f.sha256 = await computeFullSha256(f.path);
          } catch {
            continue;
          }
        }

        if (!shaMap.has(f.sha256)) {
          shaMap.set(f.sha256, []);
        }
        shaMap.get(f.sha256).push(f);
      }

      for (const [sha, exactList] of shaMap.entries()) {
        if (exactList.length > 1) {
          // Identify best file to retain
          const evaluatedFiles = evaluateRetention(exactList);
          const recoverable = (exactList.length - 1) * exactList[0].size;
          potentialSavingsBytes += recoverable;

          exactDuplicates.push({
            id: crypto.randomUUID(),
            type: 'exact',
            sha256: sha,
            fileCount: exactList.length,
            fileSize: exactList[0].size,
            potentialSaving: recoverable,
            files: evaluatedFiles
          });
        }
      }
    }
  }

  // 4. Perceptual Similar Image Detection
  const similarImages = [];
  if (includePerceptual) {
    const photoFiles = files.filter(f => f.category === 'Photos' && f.phash);
    const visited = new Set();

    for (let i = 0; i < photoFiles.length; i++) {
      if (visited.has(photoFiles[i].id)) continue;
      const group = [photoFiles[i]];

      for (let j = i + 1; j < photoFiles.length; j++) {
        if (visited.has(photoFiles[j].id)) continue;

        // Skip if already in the exact duplicate cluster with same SHA
        if (photoFiles[i].sha256 && photoFiles[i].sha256 === photoFiles[j].sha256) {
          continue;
        }

        const dist = hammingDistance(photoFiles[i].phash, photoFiles[j].phash);
        if (dist <= maxPerceptualHamming) {
          group.push({ ...photoFiles[j], hammingDistance: dist });
          visited.add(photoFiles[j].id);
        }
      }

      if (group.length > 1) {
        visited.add(photoFiles[i].id);
        const evaluated = evaluateRetention(group);
        similarImages.push({
          id: crypto.randomUUID(),
          type: 'similar',
          fileCount: group.length,
          files: evaluated
        });
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
 */
function evaluateRetention(files) {
  // Sort files by quality criteria:
  // 1. Files NOT containing "copy", "(1)", "duplicate", "download" in filename
  // 2. Resolution if photo
  // 3. Oldest modified/created date (original file)
  // 4. Path depth and permanence (e.g. desktop/downloads is temporary compared to documents/pictures)

  const scored = files.map(file => {
    let score = 100;
    const lowerName = file.name.toLowerCase();
    const lowerPath = file.path.toLowerCase();

    // Penalty for copy suffix
    if (/\(\d+\)/.test(lowerName) || lowerName.includes('copy') || lowerName.includes('duplicate')) {
      score -= 30;
    }

    // Penalty for temporary/download folders
    if (lowerPath.includes('download') || lowerPath.includes('temp') || lowerPath.includes('tmp')) {
      score -= 20;
    }

    // Bonus for higher image resolution
    if (file.photoMeta && file.photoMeta.width && file.photoMeta.height) {
      score += Math.min(25, Math.floor((file.photoMeta.width * file.photoMeta.height) / 100000));
    }

    // Bonus for earlier timestamp (older original file)
    const time = new Date(file.birthtime || file.mtime || 0).getTime();
    return { file, score, time };
  });

  // Sort descending by score, then ascending by time (oldest first)
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.time - b.time;
  });

  return scored.map((item, index) => ({
    ...item.file,
    isRecommendedKeep: index === 0,
    keepReason: index === 0 ? 'Original primary file (Highest score & cleanest location)' : 'Identified redundant duplicate copy'
  }));
}

export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
