import * as sharp from 'sharp';
export type ImageVariant = {
    key: 'thumb' | 'display';
    width?: number;
    height?: number;
    format: 'webp';
    filePath: string;
};
export type ImageUploadPurpose = 'avatar' | 'background';
export type ImageProcessingResult = {
    originalPath: string;
    variants: ImageVariant[];
};
export type ImageBufferVariant = {
    key: 'thumb' | 'display';
    width?: number;
    height?: number;
    format: 'webp';
    buffer: Buffer;
};
export type ImageBufferProcessingResult = {
    metadata: {
        width: number | null;
        height: number | null;
        format: string | null;
        size: number | null;
    };
    variants: ImageBufferVariant[];
};
export declare class ImageProcessorService {
    private readonly logger;
    private buildVariantSpecs;
    processBuffer(inputBuffer: Buffer, purpose?: ImageUploadPurpose): Promise<ImageBufferProcessingResult>;
    generateVariants(inputPath: string, outputDir?: string, purpose?: ImageUploadPurpose): Promise<ImageProcessingResult>;
    extractMetadata(inputPath: string): Promise<{
        width: number;
        height: number;
        format: keyof sharp.FormatEnum;
        size: number | null;
    }>;
    optimizeBuffer(buffer: Buffer): Promise<Buffer>;
}
