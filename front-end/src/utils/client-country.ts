export async function resolveClientCountryCode(): Promise<string | undefined> {
  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 4000);
    const response = await fetch('https://ipwho.is/', {
      signal: controller.signal,
    });
    window.clearTimeout(timeout);

    if (!response.ok) {
      return undefined;
    }

    const data = (await response.json()) as { success?: boolean; country_code?: string };
    const code = String(data.country_code ?? '').trim().toUpperCase();
    if (data.success && /^[A-Z]{2}$/.test(code)) {
      return code;
    }
  } catch {
    return undefined;
  }

  return undefined;
}
