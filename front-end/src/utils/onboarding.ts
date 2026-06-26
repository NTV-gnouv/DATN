import type { AuthSession, AuthUser } from '@/models/auth.model';
import type { LandingPage } from '@/models/page.model';
import { loadSession, saveSession, syncUserProfile } from '@/services/auth.service';
import { getMyPage, getPageById } from '@/services/pages.service';
import { pageOwnedByUser } from '@/utils/page-ownership';
import { normalizeSlug } from '@/utils/slug';

export const ONBOARDING_PAGE_ID_KEY = 'shotvn.onboarding.pageId';

export function saveOnboardingPageId(pageId: string) {
  localStorage.setItem(ONBOARDING_PAGE_ID_KEY, pageId);
}

export function getOnboardingPageId() {
  return localStorage.getItem(ONBOARDING_PAGE_ID_KEY) || '';
}

export function clearOnboardingPageId() {
  localStorage.removeItem(ONBOARDING_PAGE_ID_KEY);
}

export function isOnboardingRequired(user: AuthUser | undefined) {
  return user?.onboardingCompleted === false;
}

export function getAccountUsernames(session: AuthSession | null) {
  const usernameFromName = normalizeSlug(session?.user?.name || '');
  const usernameFromEmail = normalizeSlug(session?.user?.email?.split('@')[0] || '');
  return [usernameFromName, usernameFromEmail].filter((value, index, all) => Boolean(value) && all.indexOf(value) === index);
}

export async function refreshSessionFromServer(): Promise<AuthSession | null> {
  const session = loadSession();
  if (!session?.user?.id) {
    return null;
  }

  try {
    const user = await syncUserProfile(session.user.id);
    const nextSession: AuthSession = {
      ...session,
      user,
    };
    saveSession(nextSession);
    return nextSession;
  } catch {
    return session;
  }
}

async function findOwnedOnboardingPage(session: AuthSession): Promise<LandingPage | null> {
  const userId = session.user.id;
  if (!userId) {
    return null;
  }

  const storedPageId = getOnboardingPageId();
  if (storedPageId) {
    try {
      const storedPage = await getPageById(storedPageId);
      if (pageOwnedByUser(storedPage, userId)) {
        return storedPage;
      }
    } catch {
      // Stored page is not owned by this user.
    }
    clearOnboardingPageId();
  }

  const ownedPage = await getMyPage();
  if (pageOwnedByUser(ownedPage, userId)) {
    return ownedPage;
  }

  return null;
}

export async function resolveOnboardingPathFromSession(session: AuthSession | null) {
  if (!session || !isOnboardingRequired(session.user)) {
    return '/dashboard';
  }

  const ownedPage = await findOwnedOnboardingPage(session);
  if (ownedPage) {
    saveOnboardingPageId(ownedPage.id);
    return '/onboarding/chat';
  }

  return '/onboarding/domain';
}

export async function resolveOnboardingPath(session: AuthSession | null) {
  const activeSession = (await refreshSessionFromServer()) ?? session;
  return resolveOnboardingPathFromSession(activeSession);
}
