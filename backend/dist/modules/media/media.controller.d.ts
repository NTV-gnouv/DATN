import type { Response } from 'express';
import { MediaService } from './media.service';
type UploadFile = {
    originalname: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
};
export declare class MediaController {
    private readonly mediaService;
    constructor(mediaService: MediaService);
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
    create(body: Record<string, unknown>): Promise<{
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
    update(id: string, body: Record<string, unknown>): Promise<{
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
    upload(file: UploadFile | undefined, body: {
        ownerId?: string;
        purpose?: string;
    }): Promise<{
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
    file(id: string, response: Response): Promise<void>;
}
export {};
