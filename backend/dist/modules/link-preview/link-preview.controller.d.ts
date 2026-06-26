import { LinkPreviewService } from './link-preview.service';
export declare class LinkPreviewController {
    private readonly service;
    constructor(service: LinkPreviewService);
    preview(body: {
        url?: string;
    }): Promise<import("./link-preview.service").LinkPreviewResult>;
}
