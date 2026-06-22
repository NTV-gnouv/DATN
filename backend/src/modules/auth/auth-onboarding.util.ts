type AccountIdentity = {
  name: string;
  email: string;
};

export function normalizeAccountSlug(value: string) {
  return String(value || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function getAccountUsernames(user: AccountIdentity) {
  const usernameFromName = normalizeAccountSlug(user.name);
  const usernameFromEmail = normalizeAccountSlug(user.email.split('@')[0] || '');
  return [usernameFromName, usernameFromEmail].filter(
    (value, index, all) => Boolean(value) && all.indexOf(value) === index,
  );
}

export function hasConfiguredThemeTokens(themeTokens: unknown) {
  return Boolean(themeTokens && typeof themeTokens === 'object' && Object.keys(themeTokens as object).length > 0);
}
