export declare function normalizePersonName(raw: string): string;
export declare function normalizeOccupation(raw: string): string;
export declare function normalizeDescription(raw: string, knownName?: string): string;
export declare function normalizeBrandProfileInput(input: {
    name: string;
    occupation: string;
    description: string;
}): {
    name: string;
    occupation: string;
    description: string;
};
export declare function sanitizePersonalityTraits(traits: string[]): string[];
