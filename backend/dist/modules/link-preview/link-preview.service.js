"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkPreviewService = void 0;
const common_1 = require("@nestjs/common");
let LinkPreviewService = class LinkPreviewService {
    decodeHtml(value) {
        return value
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .trim();
    }
    extractMeta(html, key) {
        const patterns = [
            new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']+)["']`, 'i'),
            new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${key}["']`, 'i'),
            new RegExp(`<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']+)["']`, 'i'),
            new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${key}["']`, 'i'),
        ];
        for (const pattern of patterns) {
            const match = html.match(pattern);
            if (match?.[1]) {
                return this.decodeHtml(match[1]);
            }
        }
        return '';
    }
    resolveUrl(baseUrl, value) {
        if (!value) {
            return '';
        }
        try {
            return new URL(value, baseUrl).toString();
        }
        catch {
            return value;
        }
    }
    async preview(rawUrl) {
        let parsed;
        try {
            parsed = new URL(rawUrl.trim());
        }
        catch {
            throw new common_1.BadRequestException('URL không hợp lệ.');
        }
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            throw new common_1.BadRequestException('Chỉ hỗ trợ URL http/https.');
        }
        const response = await fetch(parsed.toString(), {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; ShotVNBot/1.0)',
                Accept: 'text/html,application/xhtml+xml',
            },
            redirect: 'follow',
            signal: AbortSignal.timeout(10000),
        });
        if (!response.ok) {
            throw new common_1.BadRequestException(`Không thể tải URL (${response.status}).`);
        }
        const html = await response.text();
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = this.extractMeta(html, 'og:title') ||
            this.extractMeta(html, 'twitter:title') ||
            (titleMatch?.[1] ? this.decodeHtml(titleMatch[1]) : '');
        const description = this.extractMeta(html, 'og:description') ||
            this.extractMeta(html, 'twitter:description') ||
            this.extractMeta(html, 'description');
        const thumbnailUrl = this.resolveUrl(parsed.toString(), this.extractMeta(html, 'og:image') || this.extractMeta(html, 'twitter:image'));
        return {
            url: parsed.toString(),
            title,
            description,
            thumbnailUrl,
        };
    }
};
exports.LinkPreviewService = LinkPreviewService;
exports.LinkPreviewService = LinkPreviewService = __decorate([
    (0, common_1.Injectable)()
], LinkPreviewService);
