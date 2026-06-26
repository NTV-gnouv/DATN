"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePersonName = normalizePersonName;
exports.normalizeOccupation = normalizeOccupation;
exports.normalizeDescription = normalizeDescription;
exports.normalizeBrandProfileInput = normalizeBrandProfileInput;
exports.sanitizePersonalityTraits = sanitizePersonalityTraits;
const NAME_PREFIXES = [
    /^tôi\s+tên\s+(là\s+)?/i,
    /^ten\s+(cua\s+)?toi\s+(la\s+)?/i,
    /^tên\s+(của\s+)?tôi\s+(là\s+)?/i,
    /^mình\s+tên\s+(là\s+)?/i,
    /^mình\s+là\s+/i,
    /^tôi\s+là\s+/i,
    /^my\s+name\s+is\s+/i,
    /^i\s+am\s+/i,
    /^i'm\s+/i,
];
const OCCUPATION_PREFIXES = [
    /^tôi\s+là\s+(một\s+)?/i,
    /^mình\s+là\s+(một\s+)?/i,
    /^tôi\s+làm\s+/i,
    /^mình\s+làm\s+/i,
    /^công\s+việc(\s+của\s+tôi)?\s+là\s+/i,
    /^nghề(\s+nghiệp)?(\s+của\s+tôi)?\s+là\s+/i,
    /^lam\s+/i,
    /^làm\s+/i,
    /^i\s+am\s+a(n)?\s+/i,
    /^i\s+work\s+as\s+/i,
    /^my\s+job\s+is\s+/i,
];
function collapseWhitespace(value) {
    return value.replace(/\s+/g, ' ').trim();
}
function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function stripPrefixes(value, prefixes) {
    let next = collapseWhitespace(value);
    for (const prefix of prefixes) {
        if (prefix.test(next)) {
            next = collapseWhitespace(next.replace(prefix, ''));
        }
    }
    return next;
}
function capitalizeFirst(value) {
    if (!value) {
        return value;
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
}
function normalizePersonName(raw) {
    const cleaned = stripPrefixes(raw, NAME_PREFIXES)
        .replace(/^["'`]+|["'`]+$/g, '')
        .replace(/[,.!?:;]+$/g, '')
        .trim();
    return collapseWhitespace(cleaned);
}
function normalizeOccupation(raw) {
    const cleaned = stripPrefixes(raw, OCCUPATION_PREFIXES)
        .replace(/^một\s+/i, '')
        .replace(/^mot\s+/i, '')
        .replace(/[,.!?:;]+$/g, '')
        .trim();
    return capitalizeFirst(collapseWhitespace(cleaned));
}
function normalizeDescription(raw, knownName) {
    let cleaned = collapseWhitespace(raw.replace(/[,.!?:;]+$/g, '').trim());
    const normalizedName = knownName ? normalizePersonName(knownName) : '';
    if (normalizedName) {
        const namePrefixPattern = new RegExp(`^${escapeRegExp(normalizedName)}\\s*[:\\-–—]\\s*`, 'iu');
        cleaned = cleaned.replace(namePrefixPattern, '').trim();
    }
    const colonMatch = cleaned.match(/^([^:\n]{2,80}):\s*(.+)$/);
    if (colonMatch) {
        const prefix = colonMatch[1].trim();
        const rest = colonMatch[2].trim();
        const wordCount = prefix.split(/\s+/).filter(Boolean).length;
        const looksLikeName = /^[\p{L}\s'.-]+$/u.test(prefix) && wordCount >= 1 && wordCount <= 6;
        if (looksLikeName && rest.length >= 8) {
            cleaned = rest;
        }
    }
    return collapseWhitespace(cleaned);
}
function normalizeBrandProfileInput(input) {
    return {
        name: normalizePersonName(input.name),
        occupation: normalizeOccupation(input.occupation),
        description: normalizeDescription(input.description, input.name),
    };
}
const HOBBY_TRAIT_PATTERNS = [
    /^thích\b/i,
    /^yêu thích\b/i,
    /^sở thích\b/i,
    /^so thich\b/i,
    /^đam mê/i,
    /^dam me/i,
    /^passion for\b/i,
];
function sanitizePersonalityTraits(traits) {
    return traits
        .map((trait) => collapseWhitespace(trait))
        .filter(Boolean)
        .filter((trait) => !HOBBY_TRAIT_PATTERNS.some((pattern) => pattern.test(trait)))
        .slice(0, 8);
}
