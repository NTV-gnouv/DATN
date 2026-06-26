export type AiSurfaceStyle = {
    className: string;
    interactionCss: string;
    displayFont: string;
    bodyFont: string;
    headingWeight: number;
    bodyWeight: number;
    lineHeight: number;
};
export declare const AI_SURFACE_STYLES: Record<string, AiSurfaceStyle>;
export declare function getAiSurfaceStyle(surfaceClass?: string | null): AiSurfaceStyle | null;
