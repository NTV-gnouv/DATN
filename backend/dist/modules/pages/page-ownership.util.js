"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPageOwnerId = getPageOwnerId;
exports.isPageOwnedBy = isPageOwnedBy;
function getPageOwnerId(page) {
    return String(page?.ownerId ?? '').trim();
}
function isPageOwnedBy(page, ownerId) {
    const normalizedOwnerId = String(ownerId ?? '').trim();
    if (!normalizedOwnerId) {
        return false;
    }
    return getPageOwnerId(page) === normalizedOwnerId;
}
