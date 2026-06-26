type AccountIdentity = {
    name: string;
    email: string;
};
export declare function normalizeAccountSlug(value: string): string;
export declare function getAccountUsernames(user: AccountIdentity): string[];
export declare function hasConfiguredThemeTokens(themeTokens: unknown): boolean;
export {};
