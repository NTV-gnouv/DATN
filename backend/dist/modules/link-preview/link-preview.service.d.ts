export type LinkPreviewResult = {
    url: string;
    title: string;
    description: string;
    thumbnailUrl: string;
};
export declare class LinkPreviewService {
    private decodeHtml;
    private extractMeta;
    private resolveUrl;
    preview(rawUrl: string): Promise<LinkPreviewResult>;
}
