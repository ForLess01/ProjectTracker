import fs from 'fs/promises';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export interface UploadResult {
  url: string;
  filename: string;
  mimeType: string;
}

export interface IStorageProvider {
  uploadFile(fileBuffer: Buffer, originalFilename: string, mimeType: string): Promise<UploadResult>;
}

// 1. Local Disk Storage Provider (For Local Dev / Fallback)
export class DiskStorageProvider implements IStorageProvider {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'public', 'uploads');
  }

  async uploadFile(fileBuffer: Buffer, originalFilename: string, mimeType: string): Promise<UploadResult> {
    await fs.mkdir(this.uploadDir, { recursive: true });
    
    const ext = path.extname(originalFilename) || '.png';
    const cleanFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
    const filePath = path.join(this.uploadDir, cleanFilename);

    await fs.writeFile(filePath, fileBuffer);

    return {
      url: `/uploads/${cleanFilename}`,
      filename: originalFilename,
      mimeType,
    };
  }
}

// 2. Cloudflare R2 Storage Provider (For Cloudflare Production)
export class R2StorageProvider implements IStorageProvider {
  private s3Client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor() {
    const accountId = process.env.R2_ACCOUNT_ID || '';
    const accessKeyId = process.env.R2_ACCESS_KEY_ID || '';
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '';
    
    this.bucketName = process.env.R2_BUCKET_NAME || 'project-tracker-images';
    this.publicUrl = process.env.R2_PUBLIC_URL || '';

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadFile(fileBuffer: Buffer, originalFilename: string, mimeType: string): Promise<UploadResult> {
    const ext = path.extname(originalFilename) || '.png';
    const key = `uploads/${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: mimeType,
      })
    );

    const fileUrl = this.publicUrl ? `${this.publicUrl}/${key}` : `/${key}`;

    return {
      url: fileUrl,
      filename: originalFilename,
      mimeType,
    };
  }
}

// Factory function
export function getStorageProvider(): IStorageProvider {
  const hasR2Config = Boolean(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY
  );

  if (hasR2Config) {
    return new R2StorageProvider();
  }

  return new DiskStorageProvider();
}
