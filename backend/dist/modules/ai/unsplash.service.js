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
var UnsplashService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnsplashService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const media_service_1 = require("../media/media.service");
let UnsplashService = UnsplashService_1 = class UnsplashService {
    constructor(configService, mediaService) {
        this.configService = configService;
        this.mediaService = mediaService;
        this.logger = new common_1.Logger(UnsplashService_1.name);
    }
    getAccessKey() {
        const accessKey = this.configService.get('UNSPLASH_ACCESS_KEY') ?? '';
        if (!accessKey) {
            throw new common_1.BadRequestException('UNSPLASH_ACCESS_KEY chưa được cấu hình trên server.');
        }
        return accessKey;
    }
    async searchPhoto(query) {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) {
            return null;
        }
        const accessKey = this.getAccessKey();
        const endpoint = new URL('https://api.unsplash.com/search/photos');
        endpoint.searchParams.set('query', trimmedQuery);
        endpoint.searchParams.set('per_page', '1');
        endpoint.searchParams.set('orientation', 'landscape');
        const response = await fetch(endpoint.toString(), {
            headers: {
                Authorization: `Client-ID ${accessKey}`,
                'Accept-Version': 'v1',
            },
        });
        const data = (await response.json());
        if (!response.ok) {
            const message = data.errors?.join(', ') ?? `Unsplash trả về lỗi ${response.status}`;
            this.logger.warn(`Unsplash search failed for "${trimmedQuery}": ${message}`);
            return null;
        }
        const photo = data.results?.[0];
        const sourceUrl = photo?.urls?.regular ?? photo?.urls?.full ?? '';
        if (!sourceUrl) {
            return null;
        }
        return {
            sourceUrl,
            alt: photo?.alt_description ?? photo?.description ?? trimmedQuery,
        };
    }
    async uploadFromUrl(sourceUrl, ownerId, purpose, filename) {
        const response = await fetch(sourceUrl);
        if (!response.ok) {
            throw new common_1.BadRequestException(`Không thể tải ảnh từ Unsplash (${response.status}).`);
        }
        const buffer = Buffer.from(await response.arrayBuffer());
        const contentType = response.headers.get('content-type') ?? 'image/jpeg';
        const extension = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
        const uploaded = await this.mediaService.upload({
            originalname: `${filename}.${extension}`,
            mimetype: contentType,
            size: buffer.length,
            buffer,
        }, ownerId, purpose);
        return uploaded.fileUrl;
    }
    async fetchBrandImages(keywords, gallery, ownerId) {
        const queries = [
            keywords[0] ?? keywords.join(' '),
            keywords[1] ?? `${keywords[0] ?? 'portrait'} portrait`,
            gallery[0]?.title ?? keywords[2] ?? keywords[0] ?? 'creative',
            gallery[1]?.title ?? keywords[3] ?? keywords[0] ?? 'lifestyle',
        ];
        const uploaded = [];
        for (let index = 0; index < queries.length; index += 1) {
            const query = String(queries[index] ?? '').trim();
            const found = await this.searchPhoto(query);
            if (!found) {
                uploaded.push('');
                continue;
            }
            const purpose = index === 1 ? 'avatar' : 'background';
            try {
                const publicUrl = await this.uploadFromUrl(found.sourceUrl, ownerId, purpose, `unsplash-${index + 1}`);
                uploaded.push(publicUrl);
            }
            catch (error) {
                this.logger.warn(`Failed to upload Unsplash image for "${query}": ${String(error)}`);
                uploaded.push(found.sourceUrl);
            }
        }
        const fallback = uploaded.find((url) => url.length > 0) ?? '';
        return {
            backgroundUrl: uploaded[0] || fallback,
            avatarUrl: uploaded[1] || fallback,
            galleryUrls: [uploaded[2] || fallback, uploaded[3] || fallback],
        };
    }
    async fetchBackgroundVariants(keywords, ownerId, count = 3) {
        const baseKeywords = keywords.map((item) => String(item ?? '').trim()).filter(Boolean);
        const fallbackQuery = baseKeywords[0] || 'creative lifestyle';
        const queries = Array.from({ length: count }, (_, index) => {
            const keyword = baseKeywords[index] ?? baseKeywords[baseKeywords.length - 1] ?? fallbackQuery;
            return index === 0 ? keyword : `${keyword} background ${index + 1}`;
        });
        const urls = [];
        const seen = new Set();
        for (let index = 0; index < queries.length; index += 1) {
            const found = await this.searchPhoto(queries[index]);
            if (!found) {
                continue;
            }
            try {
                const publicUrl = await this.uploadFromUrl(found.sourceUrl, ownerId, 'background', `unsplash-style-bg-${index + 1}`);
                if (publicUrl && !seen.has(publicUrl)) {
                    seen.add(publicUrl);
                    urls.push(publicUrl);
                }
            }
            catch (error) {
                this.logger.warn(`Failed to upload background variant for "${queries[index]}": ${String(error)}`);
                if (found.sourceUrl && !seen.has(found.sourceUrl)) {
                    seen.add(found.sourceUrl);
                    urls.push(found.sourceUrl);
                }
            }
        }
        return urls;
    }
};
exports.UnsplashService = UnsplashService;
exports.UnsplashService = UnsplashService = UnsplashService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        media_service_1.MediaService])
], UnsplashService);
