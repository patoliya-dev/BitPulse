import { v2 as cloudinary } from 'cloudinary';
import config from '../config/config';

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME!,
  api_key: config.CLOUDINARY_API_KEY!,
  api_secret: config.CLOUDINARY_API_SECRET!,
});

export async function uploadImageBuffer(buf: Buffer, folder: string, filename?: string) {
  return new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, public_id: filename, resource_type: 'image' },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve({ secure_url: result.secure_url! });
      }
    );
    stream.end(buf);
  });
}

export async function uploadDataUrl(dataUrl: string, folder: string, filename?: string) {
  // Cloudinary accepts data URLs directly
  const res = await cloudinary.uploader.upload(dataUrl, {
    folder,
    public_id: filename,
    resource_type: 'image',
  });
  return { secure_url: res.secure_url! };
}
