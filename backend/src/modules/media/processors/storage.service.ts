import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { join } from 'path';

@Injectable()
export class StorageService {
  get uploadRoot(): string {
    return join(process.cwd(), 'uploads');
  }

  get mediaRoot(): string {
    return join(this.uploadRoot, 'media');
  }

  get publicBaseUrl(): string {
    return process.env.R2_PUBLIC_URL ?? 'https://cdn.local.invalid';
  }

  get r2Endpoint(): string {
    return process.env.R2_ENDPOINT ?? '';
  }

  get accessKeyId(): string {
    return process.env.R2_ACCESS_KEY ?? '';
  }

  get secretAccessKey(): string {
    return process.env.R2_SECRET_KEY ?? '';
  }

  get apiBaseUrl(): string {
    return process.env.API_PUBLIC_URL ?? 'http://localhost:3000/api';
  }

  get bucketName(): string {
    return process.env.R2_BUCKET ?? 'shotvn-images';
  }

  hasR2Credentials(): boolean {
    return Boolean(this.r2Endpoint && this.accessKeyId && this.secretAccessKey && this.bucketName);
  }

  createS3Client() {
    if (!this.hasR2Credentials()) {
      throw new Error('Missing R2 configuration.');
    }

    return new S3Client({
      region: 'auto',
      endpoint: this.r2Endpoint,
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      },
      forcePathStyle: true,
    });
  }

  async uploadObject(storageKey: string, body: Buffer, contentType: string) {
    const client = this.createS3Client();
    await client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: storageKey,
        Body: body,
        ContentType: contentType,
      }),
    );
  }

  buildPublicUrl(storageKey: string): string {
    return `${this.publicBaseUrl.replace(/\/$/, '')}/${storageKey.replace(/^\//, '')}`;
  }
}
