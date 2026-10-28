import type { Media } from '../../shared/types';
import { api } from './api';

const uploads = new WeakMap<File, { key: string; media?: Media }>();

async function thumbnail(file: File): Promise<Blob | null> {
  let source: ImageBitmap | HTMLVideoElement;
  let url: string | undefined;
  try {
    if (file.type.startsWith('video/')) {
      source = document.createElement('video');
      source.muted = true;
      source.preload = 'auto';
      url = URL.createObjectURL(file);
      const video = source;
      await new Promise<void>((resolve, reject) => {
        const timer = window.setTimeout(() => {
          video.onloadeddata = null;
          video.onerror = null;
          reject(new Error('No video preview'));
        }, 5000);
        video.onloadeddata = () => {
          clearTimeout(timer);
          resolve();
        };
        video.onerror = () => {
          clearTimeout(timer);
          reject(new Error('No video preview'));
        };
        video.src = url!;
      });
    } else source = await createImageBitmap(file);
    const width = source instanceof HTMLVideoElement ? source.videoWidth : source.width;
    const height = source instanceof HTMLVideoElement ? source.videoHeight : source.height;
    const scale = Math.min(1, 600 / Math.max(width, height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    canvas.getContext('2d')?.drawImage(source, 0, 0, canvas.width, canvas.height);
    if (source instanceof ImageBitmap) source.close();
    else {
      source.removeAttribute('src');
      source.load();
    }
    return await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.8));
  } catch {
    return null;
  } finally {
    if (url) URL.revokeObjectURL(url);
  }
}

export async function uploadMedia(file: File) {
  const cached = uploads.get(file) || { key: crypto.randomUUID() };
  if (cached.media) return cached.media;
  uploads.set(file, cached);
  const form = new FormData();
  form.append('file', file);
  const preview = await thumbnail(file);
  if (preview) form.append('thumbnail', preview, 'thumbnail.jpg');
  const media = await api<Media>('media', {
    method: 'POST',
    body: form,
    headers: { 'X-Upload-Key': cached.key },
  });
  cached.media = media;
  return media;
}
