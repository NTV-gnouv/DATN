const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';
const SESSION_KEY = 'shotvn.session';

type StoredSession = {
  accessToken?: string;
  refreshToken?: string;
  user?: unknown;
};

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  timestamp: string;
};

type ApiErrorBody = {
  message?: unknown;
  errors?: Record<string, string>;
};

export class ApiRequestError extends Error {
  fieldErrors?: Record<string, string>;

  constructor(message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'ApiRequestError';
    this.fieldErrors = fieldErrors;
  }
}

function extractMessage(payload: unknown): string {
  if (typeof payload === 'string') {
    return payload;
  }

  if (payload && typeof payload === 'object') {
    const record = payload as { message?: unknown; errors?: Record<string, string> };
    const message = record.message;
    const fieldErrors =
      record.errors && typeof record.errors === 'object'
        ? Object.values(record.errors).filter((item) => typeof item === 'string' && item.trim().length > 0)
        : [];

    if (fieldErrors.length > 0) {
      return fieldErrors.join(' ');
    }

    if (Array.isArray(message)) {
      return message.map((item) => String(item)).join(', ');
    }

    if (typeof message === 'string') {
      return message;
    }

    return JSON.stringify(payload);
  }

  return 'Request failed';
}

function throwApiError(errorBody: unknown): never {
  if (errorBody && typeof errorBody === 'object') {
    const record = errorBody as ApiErrorBody;
    const fieldErrors = record.errors && typeof record.errors === 'object' ? record.errors : undefined;
    throw new ApiRequestError(extractMessage(errorBody), fieldErrors);
  }

  throw new ApiRequestError(extractMessage(errorBody));
}

function getAccessToken(): string {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      return '';
    }

    const session = JSON.parse(raw) as { accessToken?: unknown };
    return typeof session.accessToken === 'string' ? session.accessToken : '';
  } catch {
    return '';
  }
}

function getStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

async function refreshAccessToken(): Promise<string> {
  const currentSession = getStoredSession();
  const refreshToken = currentSession?.refreshToken;

  if (!refreshToken) {
    return '';
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  const payload = await response.json().catch(() => null) as ApiEnvelope<{ accessToken: string }> | null;

  if (!response.ok || !payload || payload.success === false || !payload.data?.accessToken) {
    return '';
  }

  const nextSession: StoredSession = {
    ...(currentSession ?? {}),
    accessToken: payload.data.accessToken,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
  return payload.data.accessToken;
}

async function execute<T>(path: string, init: RequestInit, includeJsonContentType: boolean, tokenOverride?: string) {
  const token = tokenOverride ?? getAccessToken();
  const { headers: initHeaders, ...restInit } = init;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...restInit,
    headers: {
      ...(includeJsonContentType ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(initHeaders ?? {}),
    },
  });

  const payload = await response.json().catch(() => null) as ApiEnvelope<T> | { success?: boolean; error?: unknown } | null;

  return { response, payload };
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const firstAttempt = await execute<T>(path, init, true);
  const firstErrorBody = firstAttempt.payload && 'error' in firstAttempt.payload ? firstAttempt.payload.error : firstAttempt.payload;

  if (firstAttempt.response.status === 401 && getAccessToken()) {
    const nextAccessToken = await refreshAccessToken();
    if (!nextAccessToken) {
      localStorage.removeItem(SESSION_KEY);
      throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');
    }

    const retryAttempt = await execute<T>(path, init, true, nextAccessToken);
    const retryErrorBody = retryAttempt.payload && 'error' in retryAttempt.payload ? retryAttempt.payload.error : retryAttempt.payload;

    if (!retryAttempt.response.ok || !retryAttempt.payload || retryAttempt.payload.success === false) {
      throwApiError(retryErrorBody);
    }

    return (retryAttempt.payload as ApiEnvelope<T>).data;
  }

  if (!firstAttempt.response.ok || !firstAttempt.payload || firstAttempt.payload.success === false) {
    throwApiError(firstErrorBody);
  }

  return (firstAttempt.payload as ApiEnvelope<T>).data;
}

export async function apiUploadRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const firstAttempt = await execute<T>(path, init, false);
  const firstErrorBody = firstAttempt.payload && 'error' in firstAttempt.payload ? firstAttempt.payload.error : firstAttempt.payload;

  if (firstAttempt.response.status === 401 && getAccessToken()) {
    const nextAccessToken = await refreshAccessToken();
    if (!nextAccessToken) {
      localStorage.removeItem(SESSION_KEY);
      throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');
    }

    const retryAttempt = await execute<T>(path, init, false, nextAccessToken);
    const retryErrorBody = retryAttempt.payload && 'error' in retryAttempt.payload ? retryAttempt.payload.error : retryAttempt.payload;

    if (!retryAttempt.response.ok || !retryAttempt.payload || retryAttempt.payload.success === false) {
      throwApiError(retryErrorBody);
    }

    return (retryAttempt.payload as ApiEnvelope<T>).data;
  }

  if (!firstAttempt.response.ok || !firstAttempt.payload || firstAttempt.payload.success === false) {
    throwApiError(firstErrorBody);
  }

  return (firstAttempt.payload as ApiEnvelope<T>).data;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}