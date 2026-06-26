"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MediaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const image_processor_service_1 = require("./processors/image-processor.service");
const storage_service_1 = require("./processors/storage.service");
const media_repository_1 = require("./media.repository");
let MediaService = MediaService_1 = class MediaService {
    constructor(mediaRepository, imageProcessorService, storageService) {
        this.mediaRepository = mediaRepository;
        this.imageProcessorService = imageProcessorService;
        this.storageService = storageService;
        this.logger = new common_1.Logger(MediaService_1.name);
    }
    list() {
        return this.mediaRepository.list();
    }
    get(id) {
        return this.mediaRepository.get(id);
    }
    create(payload) {
        return this.mediaRepository.create(payload);
    }
    update(id, payload) {
        return this.mediaRepository.update(id, payload);
    }
    normalizePurpose(value) {
        return value === 'avatar' ? 'avatar' : 'background';
    }
    normalizeOwnerId(ownerId) {
        return ownerId.trim().replace(/[^a-zA-Z0-9_-]/g, '_') || 'anonymous';
    }
    inferImageReferer(sourceUrl) {
        const lower = sourceUrl.toLowerCase();
        if (lower.includes('instagram') || lower.includes('cdninstagram') || lower.includes('fbcdn.net')) {
            return 'https://www.instagram.com/';
        }
        if (lower.includes('tiktok')) {
            return 'https://www.tiktok.com/';
        }
        if (lower.includes('youtube') || lower.includes('ytimg.com') || lower.includes('ggpht.com')) {
            return 'https://www.youtube.com/';
        }
        if (lower.includes('twimg.com') || lower.includes('x.com')) {
            return 'https://x.com/';
        }
        return '';
    }
    isHostedPublicUrl(sourceUrl) {
        const publicBase = this.storageService.publicBaseUrl.replace(/\/$/, '');
        if (publicBase === 'https://cdn.local.invalid') {
            return false;
        }
        return sourceUrl.startsWith(`${publicBase}/`);
    }
    async uploadFromUrl(sourceUrl, ownerId, purposeInput, filename = 'remote-image') {
        const referer = this.inferImageReferer(sourceUrl);
        const response = await fetch(sourceUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
                Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
                ...(referer ? { Referer: referer } : {}),
            },
        });
        if (!response.ok) {
            throw new common_1.InternalServerErrorException(`Không thể tải ảnh từ URL nguồn (${response.status}).`);
        }
        const buffer = Buffer.from(await response.arrayBuffer());
        const contentType = response.headers.get('content-type') ?? 'image/jpeg';
        const extension = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
        const uploaded = await this.upload({
            originalname: `${filename}.${extension}`,
            mimetype: contentType,
            size: buffer.length,
            buffer,
        }, ownerId, purposeInput);
        return uploaded.fileUrl;
    }
    async upload(file, ownerId, purposeInput) {
        try {
            const safeOwnerId = this.normalizeOwnerId(ownerId);
            const purpose = this.normalizePurpose(purposeInput);
            const mediaId = `media-${Date.now()}-${(0, crypto_1.randomUUID)().slice(0, 8)}`;
            const objectPrefix = `users/${safeOwnerId}/media/${mediaId}`;
            const originalKey = `${objectPrefix}/original`;
            const processed = await this.imageProcessorService.processBuffer(file.buffer, purpose);
            await this.storageService.uploadObject(originalKey, file.buffer, file.mimetype);
            for (const variant of processed.variants) {
                await this.storageService.uploadObject(`${objectPrefix}/${variant.key}.webp`, variant.buffer, 'image/webp');
            }
            const record = await this.mediaRepository.create({
                ownerId: safeOwnerId,
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                purpose,
                width: processed.metadata.width,
                height: processed.metadata.height,
                storageKey: originalKey,
                publicUrl: this.storageService.buildPublicUrl(originalKey),
                variants: processed.variants.reduce((accumulator, variant) => {
                    accumulator[variant.key] = this.storageService.buildPublicUrl(`${objectPrefix}/${variant.key}.webp`);
                    return accumulator;
                }, {}),
            });
            return {
                record,
                metadata: processed.metadata,
                variants: processed.variants,
                fileUrl: this.storageService.buildPublicUrl(originalKey),
            };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown upload error';
            this.logger.error(`Upload failed for owner ${ownerId}: ${message}`, error instanceof Error ? error.stack : undefined);
            throw new common_1.InternalServerErrorException(`Avatar upload failed: ${message}`);
        }
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = MediaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [media_repository_1.MediaRepository,
        image_processor_service_1.ImageProcessorService,
        storage_service_1.StorageService])
], MediaService);
