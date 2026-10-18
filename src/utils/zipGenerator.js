/**
 * Client-Side Pure JavaScript ZIP File Generator (PKZIP Specification)
 * Zero external dependencies. Creates valid standard .zip files from memory.
 */

// CRC-32 Table for standard ZIP checksums
const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[n] = c;
}

function calculateCRC32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date = new Date()) {
  const year = Math.max(1980, date.getFullYear());
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1);
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { dosTime, dosDate };
}

/**
 * Creates a valid ZIP file Blob from an array of files:
 * files: Array of { path: string, content: string | Uint8Array }
 */
export function createZipBlob(files = []) {
  const encoder = new TextEncoder();
  const fileEntries = [];
  let offset = 0;
  const { dosTime, dosDate } = dosDateTime();

  const localChunks = [];

  for (const file of files) {
    const nameBytes = encoder.encode(file.path.replace(/\\/g, '/'));
    const dataBytes = typeof file.content === 'string' ? encoder.encode(file.content) : file.content;
    const crc = calculateCRC32(dataBytes);
    const size = dataBytes.length;

    // Local file header (30 bytes + name length)
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(localHeader.buffer);

    lv.setUint32(0, 0x04034b50, true); // Local file header signature
    lv.setUint16(4, 20, true);         // Version needed: 2.0
    lv.setUint16(6, 0x0800, true);     // General purpose bit flag (UTF-8)
    lv.setUint16(8, 0, true);          // Compression method: 0 (Stored)
    lv.setUint16(10, dosTime, true);
    lv.setUint16(12, dosDate, true);
    lv.setUint32(14, crc, true);       // CRC-32
    lv.setUint32(18, size, true);      // Compressed size
    lv.setUint32(22, size, true);      // Uncompressed size
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true);         // Extra field length

    localHeader.set(nameBytes, 30);

    localChunks.push(localHeader);
    localChunks.push(dataBytes);

    fileEntries.push({
      path: file.path,
      nameBytes,
      crc,
      size,
      offset
    });

    offset += localHeader.length + dataBytes.length;
  }

  // Central Directory
  const centralChunks = [];
  let centralDirSize = 0;
  const centralDirStartOffset = offset;

  for (const entry of fileEntries) {
    const centralHeader = new Uint8Array(46 + entry.nameBytes.length);
    const cv = new DataView(centralHeader.buffer);

    cv.setUint32(0, 0x02014b50, true); // Central directory file header signature
    cv.setUint16(4, 20, true);         // Version made by
    cv.setUint16(6, 20, true);         // Version needed
    cv.setUint16(8, 0x0800, true);     // General purpose bit flag (UTF-8)
    cv.setUint16(10, 0, true);         // Compression method: 0
    cv.setUint16(12, dosTime, true);
    cv.setUint16(14, dosDate, true);
    cv.setUint32(16, entry.crc, true);
    cv.setUint32(20, entry.size, true);
    cv.setUint32(24, entry.size, true);
    cv.setUint16(28, entry.nameBytes.length, true);
    cv.setUint16(30, 0, true);         // Extra field length
    cv.setUint16(32, 0, true);         // File comment length
    cv.setUint16(34, 0, true);         // Disk number start
    cv.setUint16(36, 0, true);         // Internal file attributes
    cv.setUint32(38, 0, true);         // External file attributes
    cv.setUint32(42, entry.offset, true); // Relative offset of local header

    centralHeader.set(entry.nameBytes, 46);
    centralChunks.push(centralHeader);
    centralDirSize += centralHeader.length;
  }

  // End of Central Directory Record (EOCD - 22 bytes)
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);

  ev.setUint32(0, 0x06054b50, true); // EOCD signature
  ev.setUint16(4, 0, true);          // Number of this disk
  ev.setUint16(6, 0, true);          // Disk where central directory starts
  ev.setUint16(8, fileEntries.length, true);  // Number of central directory records on this disk
  ev.setUint16(10, fileEntries.length, true); // Total number of central directory records
  ev.setUint32(12, centralDirSize, true);     // Size of central directory
  ev.setUint32(16, centralDirStartOffset, true); // Offset of start of central directory
  ev.setUint16(20, 0, true);         // ZIP comment length

  return new Blob([...localChunks, ...centralChunks, eocd], { type: 'application/zip' });
}

/**
 * Trigger immediate browser download of ZIP file
 */
export function downloadZipFile(filename, files) {
  const blob = createZipBlob(files);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.zip') ? filename : `${filename}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
