"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeAccountSlug = normalizeAccountSlug;
exports.getAccountUsernames = getAccountUsernames;
exports.hasConfiguredThemeTokens = hasConfiguredThemeTokens;
function normalizeAccountSlug(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);
}
function getAccountUsernames(user) {
    const usernameFromName = normalizeAccountSlug(user.name);
    const usernameFromEmail = normalizeAccountSlug(user.email.split('@')[0] || '');
    return [usernameFromName, usernameFromEmail].filter((value, index, all) => Boolean(value) && all.indexOf(value) === index);
}
function hasConfiguredThemeTokens(themeTokens) {
    return Boolean(themeTokens && typeof themeTokens === 'object' && Object.keys(themeTokens).length > 0);
}
