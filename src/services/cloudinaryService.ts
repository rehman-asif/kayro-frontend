/**
 * Cloudinary uploads go through the backend (signed) so the API secret stays server-side.
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

export async function uploadToCloudinary(
  file: File,
  onProgress?: (percent: number) => void
): Promise<CloudinaryUploadResult> {
  const resizedFile = await resizeImage(file, 1200);
  const formData = new FormData();
  formData.append('file', resizedFile);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      try {
        const data = JSON.parse(xhr.responseText) as {
          success?: boolean;
          message?: string;
          data?: {
            url: string;
            secureUrl: string;
            publicId: string;
            width: number;
            height: number;
            format: string;
          };
          error?: { message?: string };
        };

        if (xhr.status >= 200 && xhr.status < 300 && data.data) {
          resolve(data.data);
          return;
        }
        reject(new Error(data.message || data.error?.message || `Upload failed: HTTP ${xhr.status}`));
      } catch {
        reject(new Error(`Upload failed: HTTP ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Network error during upload.')));
    xhr.addEventListener('abort', () => reject(new Error('Upload cancelled.')));

    xhr.open('POST', `${API_BASE}/upload/image`);
    xhr.withCredentials = true;
    xhr.send(formData);
  });
}

async function resizeImage(file: File, maxWidth: number): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.width <= maxWidth) {
        resolve(file);
        return;
      }
      const ratio = maxWidth / img.width;
      const canvas = document.createElement('canvas');
      canvas.width = maxWidth;
      canvas.height = Math.round(img.height * ratio);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          resolve(new File([blob], file.name, { type: 'image/jpeg' }));
        },
        'image/jpeg',
        0.88
      );
    };
    img.onerror = () => resolve(file);
    img.src = url;
  });
}
