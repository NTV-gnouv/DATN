"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const client_s3_1 = require("@aws-sdk/client-s3");
const path_1 = require("path");
let StorageService = class StorageService {
    get uploadRoot() {
        return (0, path_1.join)(process.cwd(), 'uploads');
    }
    get mediaRoot() {
        return (0, path_1.join)(this.uploadRoot, 'media');
    }
    get publicBaseUrl() {
        return process.env.R2_PUBLIC_URL ?? 'https://cdn.local.invalid';
    }
    get r2Endpoint() {
        return process.env.R2_ENDPOINT ?? '';
    }
    get accessKeyId() {
        return process.env.R2_ACCESS_KEY ?? '';
    }
    get secretAccessKey() {
        return process.env.R2_SECRET_KEY ?? '';
    }
    get apiBaseUrl() {
        return process.env.API_PUBLIC_URL ?? 'http://localhost:3000/api';
    }
    get bucketName() {
        return process.env.R2_BUCKET ?? 'shotvn-images';
    }
    hasR2Credentials() {
        return Boolean(this.r2Endpoint && this.accessKeyId && this.secretAccessKey && this.bucketName);
    }
    createS3Client() {
        if (!this.hasR2Credentials()) {
            throw new Error('Missing R2 configuration.');
        }
        return new client_s3_1.S3Client({
            region: 'auto',
            endpoint: this.r2Endpoint,
            credentials: {
                accessKeyId: this.accessKeyId,
                secretAccessKey: this.secretAccessKey,
            },
            forcePathStyle: true,
        });
    }
    async uploadObject(storageKey, body, contentType) {
        const client = this.createS3Client();
        await client.send(new client_s3_1.PutObjectCommand({
            Bucket: this.bucketName,
            Key: storageKey,
            Body: body,
            ContentType: contentType,
        }));
    }
    buildPublicUrl(storageKey) {
        return `${this.publicBaseUrl.replace(/\/$/, '')}/${storageKey.replace(/^\//, '')}`;
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = __decorate([
    (0, common_1.Injectable)()
], StorageService);
