"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeJsonPayload = normalizeJsonPayload;
exports.toJsonColumn = toJsonColumn;
function normalizeJsonPayload(payload) {
    if (typeof payload === 'string') {
        try {
            return JSON.parse(payload);
        }
        catch {
            return {};
        }
    }
    if (payload && typeof payload === 'object') {
        return payload;
    }
    return {};
}
function toJsonColumn(value) {
    if (value === undefined || value === null) {
        return null;
    }
    return JSON.stringify(value);
}
