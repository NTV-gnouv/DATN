import { ImageProcessorService } from './processors/image-processor.service';
import { StorageService } from './processors/storage.service';
import { MediaRepository } from './media.repository';
type UploadFile = {
    originalname: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
};
export declare class MediaService {
    private readonly mediaRepository;
    private readonly imageProcessorService;
    private readonly storageService;
    private readonly logger;
    constructor(mediaRepository: MediaRepository, imageProcessorService: ImageProcessorService, storageService: StorageService);
    list(): Promise<{
        id: string;
        ownerId?: string;
        originalName: string;
        mimeType: string;
        size: number;
        purpose?: "avatar" | "background";
        width: number | null;
        height: number | null;
        storageKey: string;
        previewPath?: string;
        thumbPath?: string;
        publicUrl: string;
        variants: Record<string, string>;
    }[]>;
    get(id: string): Promise<{
        id: string;
        ownerId?: string;
        originalName: string;
        mimeType: string;
        size: number;
        purpose?: "avatar" | "background";
        width: number | null;
        height: number | null;
        storageKey: string;
        previewPath?: string;
        thumbPath?: string;
        publicUrl: string;
        variants: Record<string, string>;
    } | null>;
    create(payload: Record<string, unknown>): Promise<{
        id: string;
        ownerId?: string;
        originalName: string;
        mimeType: string;
        size: number;
        purpose?: "avatar" | "background";
        width: number | null;
        height: number | null;
        storageKey: string;
        previewPath?: string;
        thumbPath?: string;
        publicUrl: string;
        variants: Record<string, string>;
    }>;
    update(id: string, payload: Record<string, unknown>): Promise<{
        id: string;
        ownerId?: string;
        originalName: string;
        mimeType: string;
        size: number;
        purpose?: "avatar" | "background";
        width: number | null;
        height: number | null;
        storageKey: string;
        previewPath?: string;
        thumbPath?: string;
        publicUrl: string;
        variants: Record<string, string>;
    } | null>;
    private normalizePurpose;
    private normalizeOwnerId;
    private inferImageReferer;
    isHostedPublicUrl(sourceUrl: string): boolean;
    uploadFromUrl(sourceUrl: string, ownerId: string, purposeInput?: string, filename?: string): Promise<string>;
    upload(file: UploadFile, ownerId: string, purposeInput?: string): Promise<{
        record: {
            id: string;
            ownerId?: string;
            originalName: string;
            mimeType: string;
            size: number;
            purpose?: "avatar" | "background";
            width: number | null;
            height: number | null;
            storageKey: string;
            previewPath?: string;
            thumbPath?: string;
            publicUrl: string;
            variants: Record<string, string>;
        };
        metadata: {
            width: number | null;
            height: number | null;
            format: string | null;
            size: number | null;
        };
        variants: import("./processors/image-processor.service").ImageBufferVariant[];
        fileUrl: string;
    }>;
}
export {};
