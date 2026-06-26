"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ImageProcessorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageProcessorService = void 0;
const common_1 = require("@nestjs/common");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const sharp = require("sharp");
let ImageProcessorService = ImageProcessorService_1 = class ImageProcessorService {
    constructor() {
        this.logger = new common_1.Logger(ImageProcessorService_1.name);
    }
    buildVariantSpecs(purpose) {
        return purpose === 'avatar'
            ? [
                { key: 'thumb', width: 160, height: 160 },
                { key: 'display', width: 512, height: 512 },
            ]
            : [
                { key: 'thumb', width: 960, height: undefined },
                { key: 'display', width: 1920, height: undefined },
            ];
    }
    async processBuffer(inputBuffer, purpose = 'background') {
        const metadata = await sharp(inputBuffer).metadata();
        const pipeline = sharp(inputBuffer).rotate();
        const specs = this.buildVariantSpecs(purpose);
        const variants = [];
        for (const spec of specs) {
            const fit = purpose === 'avatar' ? 'cover' : 'inside';
            const buffer = await pipeline
                .clone()
                .resize({
                width: spec.width,
                height: spec.height,
                withoutEnlargement: true,
                fit,
                position: 'centre',
            })
                .flatten({ background: '#ffffff' })
                .webp({ quality: purpose === 'avatar' ? 86 : 82 })
                .toBuffer();
            variants.push({
                key: spec.key,
                width: spec.width,
                height: spec.height,
                format: 'webp',
                buffer,
            });
        }
        return {
            metadata: {
                width: metadata.width ?? null,
                height: metadata.height ?? null,
                format: metadata.format ?? null,
                size: metadata.size ?? null,
            },
            variants,
        };
    }
    async generateVariants(inputPath, outputDir = (0, path_1.join)(process.cwd(), 'uploads', 'generated'), purpose = 'background') {
        await (0, promises_1.mkdir)(outputDir, { recursive: true });
        const sourceBuffer = await (0, promises_1.readFile)(inputPath);
        const specResults = await this.processBuffer(sourceBuffer, purpose);
        const variants = specResults.variants.map((variant) => ({
            key: variant.key,
            width: variant.width,
            height: variant.height,
            format: variant.format,
            filePath: (0, path_1.join)(outputDir, `${variant.key}.webp`),
        }));
        for (const variant of specResults.variants) {
            const targetPath = (0, path_1.join)(outputDir, `${variant.key}.webp`);
            await (0, promises_1.writeFile)(targetPath, variant.buffer);
        }
        this.logger.log(`Generated ${variants.length} image variants for ${inputPath}`);
        return {
            originalPath: inputPath,
            variants,
        };
    }
    async extractMetadata(inputPath) {
        const metadata = await sharp(await (0, promises_1.readFile)(inputPath)).metadata();
        return {
            width: metadata.width ?? null,
            height: metadata.height ?? null,
            format: metadata.format ?? null,
            size: metadata.size ?? null,
        };
    }
    async optimizeBuffer(buffer) {
        return sharp(buffer)
            .rotate()
            .webp({ quality: 82 })
            .toBuffer();
    }
};
exports.ImageProcessorService = ImageProcessorService;
exports.ImageProcessorService = ImageProcessorService = ImageProcessorService_1 = __decorate([
    (0, common_1.Injectable)()
], ImageProcessorService);
