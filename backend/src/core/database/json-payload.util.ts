export function normalizeJsonPayload(payload: unknown): Record<string, unknown> {
  if (typeof payload === 'string') {
    try {
      return JSON.parse(payload) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  if (payload && typeof payload === 'object') {
    return payload as Record<string, unknown>;
  }

  return {};
}

export function toJsonColumn(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  return JSON.stringify(value);
}
