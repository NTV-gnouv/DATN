import { S3Client } from '@aws-sdk/client-s3';
export declare class StorageService {
    get uploadRoot(): string;
    get mediaRoot(): string;
    get publicBaseUrl(): string;
    get r2Endpoint(): string;
    get accessKeyId(): string;
    get secretAccessKey(): string;
    get apiBaseUrl(): string;
    get bucketName(): string;
    hasR2Credentials(): boolean;
    createS3Client(): S3Client;
    uploadObject(storageKey: string, body: Buffer, contentType: string): Promise<void>;
    buildPublicUrl(storageKey: string): string;
}
