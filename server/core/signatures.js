import fs from 'node:fs';

/**
 * Recognizes file format using magic bytes / file signatures from first 512 bytes.
 */
export function identifyByMagicBytes(filePath) {
  let fd;
  try {
    const buffer = Buffer.alloc(512);
    fd = fs.openSync(filePath, 'r');
    const bytesRead = fs.readSync(fd, buffer, 0, 512, 0);
    fs.closeSync(fd);
    fd = null;

    if (bytesRead < 4) return null;

    // Check PNG
    if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) {
      return { mime: 'image/png', ext: 'png', category: 'Photos' };
    }

    // Check JPEG
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
      return { mime: 'image/jpeg', ext: 'jpg', category: 'Photos' };
    }

    // Check GIF
    if (buffer.subarray(0, 6).toString('ascii') === 'GIF87a' || buffer.subarray(0, 6).toString('ascii') === 'GIF89a') {
      return { mime: 'image/gif', ext: 'gif', category: 'Photos' };
    }

    // Check WEBP / RIFF
    if (buffer.subarray(0, 4).toString('ascii') === 'RIFF') {
      const type = buffer.subarray(8, 12).toString('ascii');
      if (type === 'WEBP') return { mime: 'image/webp', ext: 'webp', category: 'Photos' };
      if (type === 'WAVE') return { mime: 'audio/wav', ext: 'wav', category: 'Audio' };
      if (type === 'AVI ') return { mime: 'video/x-msvideo', ext: 'avi', category: 'Videos' };
    }

    // Check BMP
    if (buffer[0] === 0x42 && buffer[1] === 0x4D) {
      return { mime: 'image/bmp', ext: 'bmp', category: 'Photos' };
    }

    // Check TIFF
    if ((buffer[0] === 0x49 && buffer[1] === 0x49 && buffer[2] === 0x2A && buffer[3] === 0x00) ||
        (buffer[0] === 0x4D && buffer[1] === 0x4D && buffer[2] === 0x00 && buffer[3] === 0x2A)) {
      return { mime: 'image/tiff', ext: 'tiff', category: 'Photos' };
    }

    // Check PDF (%PDF-)
    if (buffer.subarray(0, 5).toString('ascii') === '%PDF-') {
      return { mime: 'application/pdf', ext: 'pdf', category: 'PDFs' };
    }

    // Check SQLite
    if (buffer.subarray(0, 16).toString('ascii').startsWith('SQLite format 3')) {
      return { mime: 'application/vnd.sqlite3', ext: 'sqlite', category: 'Database Files' };
    }

    // Check 7-Zip
    if (buffer.subarray(0, 6).equals(Buffer.from([0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C]))) {
      return { mime: 'application/x-7z-compressed', ext: '7z', category: 'ZIP & Archives' };
    }

    // Check RAR
    if (buffer.subarray(0, 7).equals(Buffer.from([0x52, 0x61, 0x72, 0x21, 0x1A, 0x07, 0x00])) ||
        buffer.subarray(0, 7).equals(Buffer.from([0x52, 0x61, 0x72, 0x21, 0x1A, 0x07, 0x01]))) {
      return { mime: 'application/x-rar-compressed', ext: 'rar', category: 'ZIP & Archives' };
    }

    // Check GZIP
    if (buffer[0] === 0x1F && buffer[1] === 0x8B) {
      return { mime: 'application/gzip', ext: 'gz', category: 'ZIP & Archives' };
    }

    // Check FLAC
    if (buffer.subarray(0, 4).toString('ascii') === 'fLaC') {
      return { mime: 'audio/flac', ext: 'flac', category: 'Music' };
    }

    // Check OGG
    if (buffer.subarray(0, 4).toString('ascii') === 'OggS') {
      return { mime: 'audio/ogg', ext: 'ogg', category: 'Audio' };
    }

    // Check MP3 (ID3 tag or sync word)
    if (buffer.subarray(0, 3).toString('ascii') === 'ID3' || (buffer[0] === 0xFF && (buffer[1] & 0xE0) === 0xE0)) {
      return { mime: 'audio/mpeg', ext: 'mp3', category: 'Music' };
    }

    // Check MP4 / MOV / ISO media (ftyp box)
    if (bytesRead >= 12 && buffer.subarray(4, 8).toString('ascii') === 'ftyp') {
      const brand = buffer.subarray(8, 12).toString('ascii').trim();
      return { mime: 'video/mp4', ext: 'mp4', category: 'Videos', brand };
    }

    // Check MKV / WebM (EBML)
    if (buffer.subarray(0, 4).equals(Buffer.from([0x1A, 0x45, 0xDF, 0xA3]))) {
      return { mime: 'video/webm', ext: 'webm', category: 'Videos' };
    }

    // Check Windows PE Executable / DLL (MZ)
    if (buffer[0] === 0x4D && buffer[1] === 0x5A) {
      return { mime: 'application/x-msdownload', ext: 'exe', category: 'Software' };
    }

    // Check MSI / Compound Document (OLE CFB)
    if (buffer.subarray(0, 8).equals(Buffer.from([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]))) {
      return { mime: 'application/x-ole-storage', ext: 'msi', category: 'Software' };
    }

    // Check ELF binary (Linux executable / AppImage)
    if (buffer[0] === 0x7F && buffer.subarray(1, 4).toString('ascii') === 'ELF') {
      return { mime: 'application/x-executable', ext: 'bin', category: 'Software' };
    }

    // Check Fonts
    if (buffer.subarray(0, 4).toString('ascii') === 'wOFF') {
      return { mime: 'font/woff', ext: 'woff', category: 'Fonts' };
    }
    if (buffer.subarray(0, 4).toString('ascii') === 'wOF2') {
      return { mime: 'font/woff2', ext: 'woff2', category: 'Fonts' };
    }
    if (buffer.subarray(0, 4).toString('ascii') === 'OTTO') {
      return { mime: 'font/otf', ext: 'otf', category: 'Fonts' };
    }
    if (buffer[0] === 0x00 && buffer[1] === 0x01 && buffer[2] === 0x00 && buffer[3] === 0x00) {
      return { mime: 'font/ttf', ext: 'ttf', category: 'Fonts' };
    }

    // Check PKZIP based formats (ZIP, DOCX, XLSX, PPTX, APK, JAR, EPUB)
    if (buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04) {
      // Look inside first 512 bytes for recognizable indicators
      const headerStr = buffer.toString('utf8');
      if (headerStr.includes('word/') || headerStr.includes('[Content_Types].xml') && headerStr.includes('document')) {
        return { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', ext: 'docx', category: 'Documents' };
      }
      if (headerStr.includes('xl/') || headerStr.includes('workbook')) {
        return { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ext: 'xlsx', category: 'Spreadsheets' };
      }
      if (headerStr.includes('ppt/') || headerStr.includes('presentation')) {
        return { mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', ext: 'pptx', category: 'Presentations' };
      }
      if (headerStr.includes('mimetypeapplication/epub+zip')) {
        return { mime: 'application/epub+zip', ext: 'epub', category: 'E-books' };
      }
      if (headerStr.includes('AndroidManifest.xml')) {
        return { mime: 'application/vnd.android.package-archive', ext: 'apk', category: 'APK Files' };
      }
      return { mime: 'application/zip', ext: 'zip', category: 'ZIP & Archives' };
    }

    return null;
  } catch (err) {
    if (fd) {
      try { fs.closeSync(fd); } catch {}
    }
    return null;
  }
}
