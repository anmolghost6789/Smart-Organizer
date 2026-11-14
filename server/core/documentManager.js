import fs from 'node:fs';

/**
 * Extracts preview content and metadata for supported text, markdown, CSV, and code documents.
 * Always strictly read-only.
 */
export function getDocumentPreview(filePath, extension, maxSize = 4096) {
  const ext = extension.toLowerCase().replace(/^\./, '');
  const previewableExtensions = [
    'txt', 'md', 'markdown', 'csv', 'tsv', 'json', 'xml', 'html', 'css',
    'js', 'ts', 'jsx', 'tsx', 'py', 'sql', 'log', 'yaml', 'yml', 'ini', 'cfg'
  ];

  if (!previewableExtensions.includes(ext)) {
    return { canPreview: false, previewText: null };
  }

  try {
    const buffer = Buffer.alloc(maxSize);
    const fd = fs.openSync(filePath, 'r');
    const bytesRead = fs.readSync(fd, buffer, 0, maxSize, 0);
    fs.closeSync(fd);

    const text = buffer.subarray(0, bytesRead).toString('utf8');
    const lines = text.split(/\r?\n/);
    const lineCount = lines.length;
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

    return {
      canPreview: true,
      previewText: text,
      lineCount,
      wordCount,
      isTruncated: bytesRead === maxSize
    };
  } catch (err) {
    return { canPreview: false, previewText: null, error: err.message };
  }
}

/**
 * Classifies document subtype
 */
export function classifyDocument(extension) {
  const ext = extension.toLowerCase().replace(/^\./, '');
  if (ext === 'pdf') return 'PDF';
  if (['doc', 'docx', 'odt', 'rtf', 'pages'].includes(ext)) return 'Word Document';
  if (['xls', 'xlsx', 'csv', 'tsv', 'ods', 'numbers'].includes(ext)) return 'Spreadsheet';
  if (['ppt', 'pptx', 'odp', 'key'].includes(ext)) return 'Presentation';
  if (['epub', 'mobi', 'azw3', 'cbr', 'cbz'].includes(ext)) return 'E-book';
  if (['txt', 'md', 'log'].includes(ext)) return 'Text Document';
  return 'General Document';
}
