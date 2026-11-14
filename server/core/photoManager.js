import fs from 'node:fs';
import path from 'node:path';

/**
 * Extracts basic image dimensions and metadata from binary headers without external dependencies.
 */
export function extractImageMetadata(filePath, extension) {
  const ext = extension.toLowerCase().replace(/^\./, '');
  let fd;
  try {
    const buffer = Buffer.alloc(4096);
    fd = fs.openSync(filePath, 'r');
    const bytesRead = fs.readSync(fd, buffer, 0, 4096, 0);
    fs.closeSync(fd);
    fd = null;

    let width = 0;
    let height = 0;
    let cameraMake = null;
    let cameraModel = null;
    let captureDate = null;

    if (ext === 'png' && bytesRead >= 24) {
      // PNG IHDR chunk starts at byte 12: 4 bytes length, 4 bytes 'IHDR', 4 bytes width, 4 bytes height
      width = buffer.readUInt32BE(16);
      height = buffer.readUInt32BE(20);
    } else if (ext === 'gif' && bytesRead >= 10) {
      width = buffer.readUInt16LE(6);
      height = buffer.readUInt16LE(8);
    } else if (ext === 'bmp' && bytesRead >= 26) {
      width = buffer.readInt32LE(18);
      height = Math.abs(buffer.readInt32LE(22));
    } else if (['jpg', 'jpeg'].includes(ext) && bytesRead >= 16) {
      // Parse JPEG markers for SOF0/SOF2 and Exif APP1
      let offset = 2;
      while (offset < bytesRead - 8) {
        if (buffer[offset] !== 0xFF) break;
        const marker = buffer[offset + 1];
        const length = buffer.readUInt16BE(offset + 2);

        // APP1 Exif marker (0xFFE1)
        if (marker === 0xE1 && offset + length <= bytesRead) {
          const exifHeader = buffer.subarray(offset + 4, offset + 10).toString('ascii');
          if (exifHeader.startsWith('Exif')) {
            const exifString = buffer.subarray(offset + 10, offset + 2 + length).toString('binary');
            // Extract camera model or date heuristics
            const dateMatch = exifString.match(/(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
            if (dateMatch) {
              captureDate = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
            }
          }
        }

        // SOF0 (0xC0), SOF1 (0xC1), SOF2 (0xC2)
        if ([0xC0, 0xC1, 0xC2].includes(marker)) {
          height = buffer.readUInt16BE(offset + 5);
          width = buffer.readUInt16BE(offset + 7);
          break;
        }

        offset += 2 + length;
      }
    } else if (ext === 'webp' && bytesRead >= 30) {
      if (buffer.subarray(12, 16).toString('ascii') === 'VP8 ') {
        width = buffer.readUInt16LE(26) & 0x3FFF;
        height = buffer.readUInt16LE(28) & 0x3FFF;
      } else if (buffer.subarray(12, 16).toString('ascii') === 'VP8X') {
        width = 1 + buffer.readUIntLE(24, 3);
        height = 1 + buffer.readUIntLE(27, 3);
      }
    }

    return {
      width,
      height,
      cameraMake,
      cameraModel,
      captureDate
    };
  } catch (err) {
    if (fd) {
      try { fs.closeSync(fd); } catch {}
    }
    return { width: 0, height: 0, captureDate: null };
  }
}

/**
 * Intelligent photo classification: Screenshot vs Camera Photo vs Graphic Design.
 */
export function classifyPhoto(fileName, metadata, stats) {
  const name = fileName.toLowerCase();

  // Screenshot heuristics: filename patterns
  const screenshotPatterns = [
    'screenshot', 'screen shot', 'screengrab', 'screen_shot',
    'snip', 'prtscr', 'capture', 'captura', 'bildschirmfoto'
  ];
  const isScreenshotName = screenshotPatterns.some(pat => name.includes(pat));

  // Common screen resolutions (Full HD, 2K, 4K, Mobile displays)
  const isScreenResolution = (
    (metadata.width === 1920 && metadata.height === 1080) ||
    (metadata.width === 1080 && metadata.height === 1920) ||
    (metadata.width === 2560 && metadata.height === 1440) ||
    (metadata.width === 1440 && metadata.height === 2560) ||
    (metadata.width === 3840 && metadata.height === 2160) ||
    (metadata.width === 1366 && metadata.height === 768) ||
    (metadata.width === 1280 && metadata.height === 720) ||
    (metadata.width === 1170 && metadata.height === 2532) || // iPhone 12/13/14
    (metadata.width === 1290 && metadata.height === 2796)    // iPhone Pro Max
  );

  // Camera filename patterns (DCIM, IMG_, DSC_, PXL_, SAM_)
  const cameraPatterns = [
    /^img_\d+/i, /^dsc_\d+/i, /^pxl_\d+/i, /^sam_\d+/i, /^dji_\d+/i, /^mvimg_\d+/i
  ];
  const isCameraName = cameraPatterns.some(rx => rx.test(fileName));

  let subType = 'General Photo';
  if (isScreenshotName || (isScreenResolution && !metadata.cameraModel && !isCameraName)) {
    subType = 'Screenshot';
  } else if (isCameraName || metadata.cameraModel || metadata.captureDate) {
    subType = 'Camera Photo';
  }

  // Determine best date for organization (YYYY/MM)
  let bestDate = metadata.captureDate;
  if (!bestDate && stats && stats.mtime) {
    const d = new Date(stats.mtime);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    bestDate = `${yyyy}-${mm}`;
  }

  return {
    subType,
    isScreenshot: subType === 'Screenshot',
    isCamera: subType === 'Camera Photo',
    yearMonth: bestDate ? bestDate.substring(0, 7) : null
  };
}
