export function getPageOwnerId(page: Record<string, unknown> | null | undefined): string {
  return String(page?.ownerId ?? '').trim();
}

export function isPageOwnedBy(page: Record<string, unknown> | null | undefined, ownerId: string): boolean {
  const normalizedOwnerId = String(ownerId ?? '').trim();
  if (!normalizedOwnerId) {
    return false;
  }
  return getPageOwnerId(page) === normalizedOwnerId;
}
