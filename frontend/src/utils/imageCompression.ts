import imageCompression from 'browser-image-compression';

/**
 * Default compression options:
 * - maxSizeMB: 1MB maximum file size
 * - maxWidthOrHeight: 1920px maximum dimension
 * - fileType: output as WebP for optimal compression
 * - useWebWorker: offload compression to a Web Worker
 * - preserveExif: strip EXIF data to reduce size
 */
const DEFAULT_OPTIONS: Parameters<typeof imageCompression>[1] = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  fileType: 'image/webp',
  useWebWorker: true,
  preserveExif: false,
};

/**
 * Compress an image File before uploading.
 * Non-image files are returned as-is.
 *
 * @param file - The original File object
 * @param options - Optional overrides for compression settings
 * @returns The compressed File (or original if not an image)
 */
export const compressImageFile = async (
  file: File,
  options?: Partial<Parameters<typeof imageCompression>[1]>,
): Promise<File> => {
  // Skip non-image files
  if (!file.type.startsWith('image/')) {
    return file;
  }

  // Skip files already under 500KB
  if (file.size <= 500 * 1024) {
    return file;
  }

  try {
    const compressed = await imageCompression(file, {
      ...DEFAULT_OPTIONS,
      ...options,
    });

    // Return compressed file with the original name (but webp extension)
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    return new File([compressed], `${baseName}.webp`, {
      type: 'image/webp',
      lastModified: Date.now(),
    });
  } catch (error) {
    console.warn('[imageCompression] Failed to compress, using original:', error);
    return file;
  }
};

/**
 * Compress multiple image files.
 */
export const compressImageFiles = async (
  files: File[],
  options?: Partial<Parameters<typeof imageCompression>[1]>,
): Promise<File[]> => {
  return Promise.all(files.map((f) => compressImageFile(f, options)));
};

export default compressImageFile;
