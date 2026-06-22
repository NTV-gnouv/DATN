import { useEffect, useMemo, useRef, useState } from 'react';
import { PencilSquareIcon, SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useParams, useSearchParams } from 'react-router-dom';

import { SelectedDomainToolbar } from '@/components/dashboard/SelectedDomainToolbar';
import { DashboardBuilderLayout } from '@/components/layout/DashboardBuilderLayout';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { EDITOR_REGISTRY } from '@/editor';
import type { HeaderBlock, PageBackground, PageBackgroundGradientType } from '@/models/editor.model';
import type { LandingPage, PageBlock } from '@/models/page.model';
import { loadSession } from '@/services/auth.service';
import {
  checkSlugAvailability,
  getPageById,
  getPageByUsername,
  getPageEditorConfig,
  updatePageEditorConfig,
  updatePageSlug,
  updatePageSlugByUsername,
} from '@/services/pages.service';
import { FontPairingPicker } from '@/components/editor/FontPairingPicker';
import { AvatarDisplayStylePicker } from '@/components/editor/AvatarDisplayStylePicker';
import { SocialLinksEditor } from '@/components/editor/SocialLinksEditor';
import { ProfileHeaderSection } from '@/components/profile/ProfileHeaderSection';
import { resolveAvatarDisplayStyle } from '@/models/avatar-display.model';
import type { FontPairing } from '@/config/font-catalog';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { uploadMediaImage } from '@/services/media.service';
import { listThemes, type ThemeManifest } from '@/services/themes.service';
import { getSocialPlatformIcon } from '../../utils/social-icons';
import { clampSocialIconSize } from '@/utils/social-icon-size';
import { getBodyStyle, getHeadingStyle, resolvePageTypography } from '@/utils/fonts';
import { resolveThemePreviewMetrics } from '@/utils/theme-preview-metrics';
import { normalizeAvatarWidthPercent } from '@/utils/avatar-size';
import {
  clampDisplayNameSizePercent,
  MAX_DISPLAY_NAME_SIZE_PERCENT,
  MIN_DISPLAY_NAME_SIZE_PERCENT,
  normalizeDisplayNameSizePercent,
} from '@/utils/display-name-size';
import { getDefaultBlockId, getDefaultHeaderBlock, getDefaultThemeId } from '@/services/editor.service';
import { AI_BACKGROUND_SUGGESTED_PROMPT, generateAiBackground } from '@/services/ai-background.service';

function getSocialIconElement(platform: string, color: string, size: number = 18): string {
  const svgIcon = getSocialPlatformIcon(platform, color);
  if (!svgIcon) {
    return '';
  }
  // Wrap SVG with proper sizing
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">${svgIcon.slice(4)}`; // Remove <?xml...> if any
}

function normalizeSlug(value: string) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function hasText(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0;
}

function createDefaultPageBackground(): PageBackground {
  return {
    mode: 'solid',
    solid: '#ffffff',
    gradient: {
      start: '#ffffff',
      end: '#cbd5e1',
      type: 'linear',
    },
    imageUrl: '',
    overlayColor: '#000000',
    overlayOpacity: 0,
  };
}

function normalizeHeaderBlock(headerBlock: HeaderBlock): HeaderBlock {
  return {
    ...headerBlock,
    fields: {
      ...headerBlock.fields,
      colors: {
        ...headerBlock.fields.colors,
        pageBackground: headerBlock.fields.colors.pageBackground ?? createDefaultPageBackground(),
      },
    },
  };
}

function getValueByPath(source: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((current, key) => {
    if (!current || typeof current !== 'object') {
      return undefined;
    }
    return (current as Record<string, unknown>)[key];
  }, source);
}

function setValueByPath(source: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const keys = path.split('.').filter(Boolean);
  if (!keys.length) {
    return source;
  }

  const clone: Record<string, unknown> = { ...source };
  let cursor: Record<string, unknown> = clone;

  for (let index = 0; index < keys.length - 1; index += 1) {
    const key = keys[index];
    const next = cursor[key];
    cursor[key] = next && typeof next === 'object' ? { ...(next as Record<string, unknown>) } : {};
    cursor = cursor[key] as Record<string, unknown>;
  }

  cursor[keys[keys.length - 1]] = value;
  return clone;
}

function mergeThemeDefaults(currentFields: Record<string, unknown>, defaults: Record<string, unknown> | undefined) {
  if (!defaults) {
    return currentFields;
  }

  const merged = { ...currentFields };
  Object.entries(defaults).forEach(([key, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const currentValue = merged[key];
      const base = currentValue && typeof currentValue === 'object' ? (currentValue as Record<string, unknown>) : {};
      merged[key] = mergeThemeDefaults(base, value as Record<string, unknown>);
      return;
    }

    merged[key] = value;
  });

  return merged;
}

function defaultThemePreview(themeId: string) {
  return `/img/themes/${themeId}/preview.png`;
}

type SlugState = 'idle' | 'checking' | 'available' | 'taken';

type PageEditorViewProps = {
  pageId?: string;
};

const DEFAULT_HERO_BODY = 'A fast creator landing page with a clean Beacons-style flow.';

export default function PageEditorView({ pageId: pageIdProp }: PageEditorViewProps) {
  const params = useParams<{ pageId: string }>();
  const pageId = pageIdProp ?? params.pageId ?? 'p-demo';
  const { signOut } = useAuth();
  const session = loadSession();
  const accountUsernames = useMemo(() => {
    const usernameFromName = normalizeSlug(session?.user?.name || '');
    const usernameFromEmail = normalizeSlug(session?.user?.email?.split('@')[0] || '');
    return [usernameFromName, usernameFromEmail].filter((value, index, all) => Boolean(value) && all.indexOf(value) === index);
  }, [session?.user?.email, session?.user?.name]);

  const [page, setPage] = useState<LandingPage | null>(null);
  const [themeId, setThemeId] = useState('minimal');
  const [themeTokens, setThemeTokens] = useState<Record<string, unknown> | null>(null);
  const [themeCatalog, setThemeCatalog] = useState<ThemeManifest[]>([]);
  const [headerBlockId, setHeaderBlockId] = useState('block-header-default');
  const [headerBlock, setHeaderBlock] = useState<HeaderBlock | null>(null);
  const [slug, setSlug] = useState('creator-page');
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [slugState, setSlugState] = useState<SlugState>('idle');
  const [loadingEditor, setLoadingEditor] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [generatingAiBackground, setGeneratingAiBackground] = useState(false);
  const [aiBackgroundPrompt, setAiBackgroundPrompt] = useState(AI_BACKGROUND_SUGGESTED_PROMPT);
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const [profileDraft, setProfileDraft] = useState<HeaderBlock['fields']['profile'] | null>(null);
  const [notice, setNotice] = useState('');
  const [editorError, setEditorError] = useState('');
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const backgroundInputRef = useRef<HTMLInputElement | null>(null);
  const autoSaveTimerRef = useRef<number | null>(null);
  const lastAutoSaveSnapshotRef = useRef('');

  useEffect(() => {
    if (!notice && !editorError) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setNotice('');
      setEditorError('');
    }, 3200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [notice, editorError]);

  useEffect(() => {
    const fallbackSlug = normalizeSlug(page?.title ?? pageId) || 'creator-page';
    setSlug(page?.slug ?? fallbackSlug);
  }, [page?.slug, page?.title, pageId]);

  // open specific block editor when `openBlock` query param is present
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const openBlock = searchParams.get('openBlock');
    if (openBlock && openBlock === headerBlockId) {
      setIsProfileEditorOpen(true);
    }
  }, [searchParams, headerBlockId]);

  useEffect(() => {
    if (!isProfileEditorOpen || !headerBlock) {
      return;
    }

    setProfileDraft({
      ...headerBlock.fields.profile,
      displayNameSize: normalizeDisplayNameSizePercent(headerBlock.fields.profile.displayNameSize),
    });
  }, [headerBlock, isProfileEditorOpen]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        let loadedPage: LandingPage | null = null;

        for (const username of accountUsernames) {
          const byUsername = await getPageByUsername(username);
          if (byUsername && byUsername.status !== 'missing') {
            loadedPage = byUsername;
            break;
          }
        }

        if (!loadedPage) {
          loadedPage = await getPageById(pageId);
        }

        const effectivePageId = loadedPage.id ?? pageId;
        const [theme, blockIdResponse, defaultHeaderBlock, config, themes] = await Promise.all([
          getDefaultThemeId(),
          getDefaultBlockId(),
          getDefaultHeaderBlock(),
          getPageEditorConfig(effectivePageId),
          listThemes().catch(() => []),
        ]);

        if (cancelled) {
          return;
        }

        setPage(loadedPage);
        setSlug(loadedPage.slug ?? (normalizeSlug(loadedPage.title ?? pageId) || 'creator-page'));
        // Prefer explicit editor config -> page record themeId -> system default
        setThemeId(config.themeId ?? loadedPage?.themeId ?? theme.defaultThemeId);
        if (Array.isArray(themes)) {
          const catalog = new Map<string, ThemeManifest>();
          themes
            .filter((item) => item?.enabled !== false)
            .filter((item) => Array.isArray(item.fields) && item.fields.length > 0)
            .forEach((item) => {
              catalog.set(item.id, item);
            });
          setThemeCatalog(Array.from(catalog.values()));
        } else {
          setThemeCatalog([]);
        }
        setThemeTokens((config.themeTokens as Record<string, unknown> | null | undefined) ?? null);
        setHeaderBlockId(config.headerBlockId ?? blockIdResponse.defaultBlockId);
        setHeaderBlock(normalizeHeaderBlock((config.headerBlock as HeaderBlock | null) ?? defaultHeaderBlock));
      } catch (caughtError) {
        if (!cancelled) {
          const message = caughtError instanceof Error ? caughtError.message : 'Không thể tải trình chỉnh sửa';
          setEditorError(message);
        }
      } finally {
        if (!cancelled) {
          setLoadingEditor(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [accountUsernames, pageId]);

  function updateHeaderBlock(updater: (current: HeaderBlock) => HeaderBlock) {
    setHeaderBlock((current) => {
      if (!current) {
        return current;
      }

      return normalizeHeaderBlock(updater(current));
    });
    setNotice('');
    setEditorError('');
  }

  async function verifySlug(nextSlug: string) {
    const normalizedSlug = normalizeSlug(nextSlug);

    if (!normalizedSlug) {
      setSlugState('idle');
      return false;
    }

    setSlugState('checking');
    try {
      const result = await checkSlugAvailability(normalizedSlug, page?.id ?? pageId);
      setSlugState(result.available ? 'available' : 'taken');
      return result.available;
    } catch {
      setSlugState('idle');
      return false;
    }
  }

  useEffect(() => {
    if (loadingEditor || !headerBlock || !pageId) {
      return;
    }

    const normalizedSlug = normalizeSlug(slug);
    const snapshot = JSON.stringify({
      slug: normalizedSlug,
      themeId,
      themeTokens,
      headerBlockId,
      headerBlock,
      pageId: page?.id ?? pageId,
      username: page?.username ?? accountUsernames[0] ?? '',
    });

    if (!lastAutoSaveSnapshotRef.current) {
      lastAutoSaveSnapshotRef.current = snapshot;
      return;
    }

    if (snapshot === lastAutoSaveSnapshotRef.current) {
      return;
    }

    if (autoSaveTimerRef.current) {
      window.clearTimeout(autoSaveTimerRef.current);
    }

    // do not show a "saving" indicator while waiting for autosave;
    // only show the final saved notice after the save completes

    autoSaveTimerRef.current = window.setTimeout(() => {
      void (async () => {
        setEditorError('');

        try {
          const isAvailable = await verifySlug(normalizedSlug);

          if (!isAvailable) {
            setEditorError('Slug này đã được dùng. Hãy đổi slug khác trước khi lưu.');
            return;
          }

          const targetUsername = page?.username ?? accountUsernames[0];
          const updatedPage = targetUsername
            ? await updatePageSlugByUsername(targetUsername, normalizedSlug)
            : await updatePageSlug(page?.id ?? pageId, normalizedSlug);

          await updatePageEditorConfig(updatedPage.id ?? page?.id ?? pageId, {
            themeId,
            themeTokens,
            headerBlockId,
            headerBlock,
          });

          setPage(updatedPage);
          setSlug(updatedPage.slug ?? normalizedSlug);
          setNotice('Đã lưu');
          lastAutoSaveSnapshotRef.current = JSON.stringify({
            slug: updatedPage.slug ?? normalizedSlug,
              themeId,
              themeTokens,
              headerBlockId,
              headerBlock,
            pageId: updatedPage.id ?? page?.id ?? pageId,
            username: targetUsername ?? '',
          });
        } catch (caughtError) {
          const message = caughtError instanceof Error ? caughtError.message : 'Không thể tự động lưu cấu hình';
          setEditorError(message);
        }
      })();
    }, 700);

    return () => {
      if (autoSaveTimerRef.current) {
        window.clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [accountUsernames, headerBlock, headerBlockId, loadingEditor, page?.id, page?.username, pageId, slug, themeId, themeTokens]);

  const previewTitle = headerBlock && hasText(headerBlock.fields?.profile?.displayName)
    ? headerBlock.fields.profile.displayName
    : '';
  const previewBio = headerBlock && hasText(headerBlock.fields?.profile?.bio) ? headerBlock.fields.profile.bio : '';
  const socialItems = headerBlock?.fields?.socials?.items
    ? headerBlock.fields.socials.items.filter((item) => hasText(item.url) || hasText(item.iconUrl))
    : [];
  const editorSocialItems = headerBlock?.fields?.socials?.items ?? [];

  const effectiveProfile = isProfileEditorOpen && profileDraft ? profileDraft : headerBlock?.fields.profile;
  const avatarSize = normalizeAvatarWidthPercent(effectiveProfile?.avatarSize);
  const displayNameSize = normalizeDisplayNameSizePercent(effectiveProfile?.displayNameSize);
  const avatarDisplayStyle = resolveAvatarDisplayStyle(effectiveProfile);
  const avatarUrl = effectiveProfile?.avatarUrl ?? '';
  const pageBackground = headerBlock?.fields.colors.pageBackground ?? createDefaultPageBackground();
  const headerColor = headerBlock?.fields.colors.headerTextAndIcon ?? '#111111';
  const socialBg = headerBlock?.fields.colors.socialBlockBackground ?? '#f5f5f5';
  const socialText = headerBlock?.fields.colors.socialBlockText ?? '#111111';
  const socialIconSize = clampSocialIconSize(headerBlock?.fields?.socials?.iconSize);
  const contentBg = headerBlock?.fields.colors.contentBlockBackground ?? '#ffffff';
  const contentText = headerBlock?.fields.colors.contentBlockText ?? '#111111';
  const buttonColor = headerBlock?.fields.colors.contentBlockButton ?? '#111111';
  const backgroundModes = [
    { value: 'ai', label: 'AI background', icon: '✦' },
    { value: 'solid', label: 'Solid', icon: '◉' },
    { value: 'gradient', label: 'Gradient', icon: '◫' },
    { value: 'image', label: 'Image', icon: '▣' },
  ] as const;
  const divWidth = headerBlock?.fields.divLayout.widthPercent ?? 100;
  const border = headerBlock?.fields.divLayout.border ?? { width: 1, style: 'solid' as const, color: '#cccccc', radius: 2 };
  const shadow = headerBlock?.fields.divLayout.boxShadow ?? {
    enabled: false,
    x: 0,
    y: 6,
    blur: 18,
    spread: 0,
    color: 'rgba(0, 0, 0, 0.18)',
  };
  const themeCards: ThemeManifest[] = themeCatalog.length
    ? themeCatalog
    : EDITOR_REGISTRY.themes.map((theme) => ({
        id: theme.id,
        name: theme.name,
        description: theme.description,
        preview: 'preview.png',
        version: '1.0.0',
      }));
  const selectedTheme = themeCards.find((theme) => theme.id === themeId) ?? themeCards[0];
  const selectedThemeFields = (selectedTheme?.fields ?? []).filter(
    (field) => field.key !== 'typography.fontFamily',
  );
  const pageTypography = useMemo(
    () => resolvePageTypography(headerBlock?.fields ?? null, themeTokens),
    [headerBlock?.fields, themeTokens],
  );
  useGoogleFonts(pageTypography.googleFontFamilies);
  const reviewFontSizeFromTokens =
    themeTokens && typeof themeTokens === 'object' && themeTokens.review && typeof themeTokens.review === 'object'
      ? Number((themeTokens.review as Record<string, unknown>).fontSize ?? 0)
      : 0;
  const previewMetrics = useMemo(
    () =>
      resolveThemePreviewMetrics({
        canvasMode: 'phone-frame',
        typographyFontSize: pageTypography.bodySize,
        typographyHeadingSize: pageTypography.headingSize,
        themeReviewFontSize: reviewFontSizeFromTokens > 0 ? reviewFontSizeFromTokens : undefined,
        divWidthPercent: divWidth,
        avatarSize,
        displayNameSize,
        socialIconSize,
      }),
    [
      avatarSize,
      displayNameSize,
      divWidth,
      pageTypography.bodySize,
      pageTypography.headingSize,
      reviewFontSizeFromTokens,
      socialIconSize,
    ],
  );
  const reviewFontSize = previewMetrics.reviewFontSize;
  const avatarWidthPercent = previewMetrics.avatarWidthPercent;

  function applyFontPairing(pairing: FontPairing) {
    updateHeaderBlock((current) => ({
      ...current,
      fields: {
        ...current.fields,
        typography: {
          ...current.fields.typography,
          fontPairingId: pairing.id,
          fontFamily: pairing.bodyFont,
          displayFontFamily: pairing.displayFont,
          bodyFontFamily: pairing.bodyFont,
          fontSize: pairing.bodySize,
          fontWeight: pairing.bodyWeight,
          headingSize: pairing.headingSize,
          headingWeight: pairing.headingWeight,
          headingLetterSpacing: pairing.headingLetterSpacing,
          headingTransform: pairing.headingTransform,
          lineHeight: pairing.lineHeight,
        },
      },
    }));
  }

  function updateHeaderFieldByPath(path: string, value: unknown) {
    updateHeaderBlock((current) => ({
      ...current,
      fields: setValueByPath(current.fields as unknown as Record<string, unknown>, path, value) as HeaderBlock['fields'],
    }));
  }

  function resolveThemeFieldValue(path: string) {
    const currentFields = headerBlock?.fields as unknown as Record<string, unknown>;
    const current = getValueByPath(currentFields, path);
    if (current !== undefined) {
      return current;
    }

    const defaults = (selectedTheme?.cssDefaults as Record<string, unknown> | undefined) ?? {};
    return getValueByPath(defaults, path);
  }

  function renderThemeField(field: NonNullable<ThemeManifest['fields']>[number]) {
    const key = field.key;
    const value = resolveThemeFieldValue(key);
    const normalizedType = String(field.type || '').toLowerCase();

    if (normalizedType === 'color') {
      const color = typeof value === 'string' && value.startsWith('#') ? value : '#111111';
      return (
        <label key={key}>
          {field.label}
          <input
            className="input theme-color-input"
            type="color"
            value={color}
            onChange={(event) => updateHeaderFieldByPath(key, event.target.value)}
          />
        </label>
      );
    }

    if (normalizedType === 'number') {
      const numericValue = Number(value ?? 0);
      return (
        <label key={key}>
          {field.label}
          <input
            className="input"
            type="number"
            value={Number.isFinite(numericValue) ? numericValue : 0}
            onChange={(event) => updateHeaderFieldByPath(key, Number(event.target.value || 0))}
          />
        </label>
      );
    }

    if (normalizedType === 'boolean') {
      const enabled = Boolean(value);
      return (
        <label key={key}>
          {field.label}
          <select
            className="input"
            value={enabled ? 'on' : 'off'}
            onChange={(event) => updateHeaderFieldByPath(key, event.target.value === 'on')}
          >
            <option value="off">Tắt</option>
            <option value="on">Bật</option>
          </select>
        </label>
      );
    }

    if (normalizedType === 'select' || normalizedType === 'font-select') {
      const options = Array.isArray(field.options)
        ? field.options
        : normalizedType === 'font-select'
          ? ['Inter', 'Roboto', 'Poppins', 'Montserrat', 'Lora', 'Playfair Display', 'Noto Sans', 'System']
          : [];
      const selected = typeof value === 'string' ? value : options[0] ?? '';
      return (
        <label key={key}>
          {field.label}
          <select
            className="input"
            value={selected}
            onChange={(event) => updateHeaderFieldByPath(key, event.target.value)}
          >
            {options.map((option) => (
              <option key={`${key}-${option}`} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      );
    }

    const inputType = normalizedType === 'url' ? 'url' : 'text';
    return (
      <label key={key}>
        {field.label}
        <input
          className="input"
          type={inputType}
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => updateHeaderFieldByPath(key, event.target.value)}
        />
      </label>
    );
  }

  function handleThemeSelect(nextTheme: ThemeManifest) {
    setThemeId(nextTheme.id);
    const defaults = nextTheme.cssDefaults as Record<string, unknown> | undefined;
    if (!defaults) {
      return;
    }

    updateHeaderBlock((current) => ({
      ...current,
      fields: mergeThemeDefaults(current.fields as unknown as Record<string, unknown>, defaults) as HeaderBlock['fields'],
    }));
  }

  async function handleAvatarUpload(file: File) {
    setUploadingAvatar(true);
    setEditorError('');
    setNotice('');

    try {
      const result = await uploadMediaImage(file, 'avatar', session?.user?.id ?? 'anonymous');
      setProfileDraft((current) => ({
        ...(current ?? headerBlock?.fields.profile ?? {
          displayName: '',
          bio: '',
          avatarUrl: '',
          avatarShape: 'circle',
          avatarDisplayStyle: 'circle',
          avatarSize: 32,
          displayNameSize: 100,
        }),
        avatarUrl: result.fileUrl,
      }));
      setNotice('✓ Đã cập nhật ảnh đại diện.');
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : 'Không thể tải ảnh đại diện';
      setEditorError(message);
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleBackgroundUpload(file: File) {
    setUploadingBackground(true);
    setEditorError('');
    setNotice('');

    try {
      const result = await uploadMediaImage(file, 'background', session?.user?.id ?? 'anonymous');
      updateHeaderBlock((current) => ({
        ...current,
        fields: {
          ...current.fields,
          colors: {
            ...current.fields.colors,
            pageBackground: {
              ...current.fields.colors.pageBackground,
              mode: 'image',
              imageUrl: result.fileUrl,
            },
          },
        },
      }));
      setNotice('✓ Đã cập nhật background hình ảnh.');
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : 'Không thể tải ảnh nền';
      setEditorError(message);
    } finally {
      setUploadingBackground(false);
    }
  }

  async function handleGenerateAiBackground() {
    const prompt = aiBackgroundPrompt.trim();
    if (!prompt) {
      setEditorError('Hãy nhập mô tả background bạn muốn tạo.');
      return;
    }

    setGeneratingAiBackground(true);
    setEditorError('');
    setNotice('');

    try {
      const result = await generateAiBackground(prompt, session?.user?.id ?? 'anonymous');
      updateHeaderBlock((current) => ({
        ...current,
        fields: {
          ...current.fields,
          colors: {
            ...current.fields.colors,
            pageBackground: {
              ...current.fields.colors.pageBackground,
              mode: 'ai',
              imageUrl: result.imageUrl,
              aiPrompt: result.prompt,
            },
          },
        },
      }));
      setNotice('✓ Đã tạo background bằng AI.');
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : 'Không thể tạo background bằng AI';
      setEditorError(message);
    } finally {
      setGeneratingAiBackground(false);
    }
  }

  useEffect(() => {
    const savedPrompt = headerBlock?.fields?.colors?.pageBackground?.aiPrompt?.trim();
    if (savedPrompt) {
      setAiBackgroundPrompt(savedPrompt);
    }
  }, [headerBlock?.fields?.colors?.pageBackground?.aiPrompt]);

  if (loadingEditor || !headerBlock) {
    return (
      <DashboardShell onSignOut={signOut}>
        <Card>
          <p className="eyebrow">Trình chỉnh sửa</p>
          <h2>Đang tải cấu hình theme và block...</h2>
          {editorError ? (
            <p className="muted-copy">Nếu bạn đang dùng session cũ, hãy tải lại trang để bỏ token cũ, hoặc tiếp tục chỉnh sửa với dữ liệu mặc định.</p>
          ) : null}
        </Card>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell onSignOut={signOut}>
      <DashboardBuilderLayout
        page={page}
        headerBlock={headerBlock}
        themeTokens={themeTokens}
        domainToolbar={
          <SelectedDomainToolbar
            slug={slug}
            editable={{
              isEditing: isEditingSlug,
              onChange: (value) => {
                setSlug(value);
                setSlugState('idle');
              },
              onStartEdit: () => {
                setIsEditingSlug(true);
                setSlugState('idle');
              },
              onBlur: async () => {
                const normalizedSlug = normalizeSlug(slug);
                setSlug(normalizedSlug);
                await verifySlug(normalizedSlug);
                setIsEditingSlug(false);
              },
              onKeyDown: (event) => {
                if (event.key === 'Enter') {
                  event.currentTarget.blur();
                }

                if (event.key === 'Escape') {
                  const fallbackSlug = normalizeSlug(page?.slug ?? slug) || 'creator-page';
                  setSlug(fallbackSlug);
                  setSlugState('idle');
                  setIsEditingSlug(false);
                }
              },
            }}
            onCopySuccess={(message) => setNotice(message)}
            onCopyError={(message) => setEditorError(message)}
          />
        }
      >
          <Card>
            <section className="editor-section">
              <p className="eyebrow">Profile</p>
              <div className="editor-profile-summary">
                <div className={`editor-profile-avatar profile-avatar is-style-${avatarDisplayStyle}`}>
                  {avatarUrl ? <img src={avatarUrl} alt={previewTitle || 'Ảnh đại diện'} /> : <span>AV</span>}
                </div>
                <div className="editor-profile-copy">
                  <strong>{previewTitle || 'Chưa có tên hiển thị'}</strong>
                  <p>{previewBio || 'Chưa có mô tả'}</p>
                </div>
                <button type="button" className="btn btn-secondary editor-profile-edit-button" onClick={() => setIsProfileEditorOpen(true)}>
                  Edit profile
                </button>
              </div>
            </section>

            <div className="editor-section-divider" aria-hidden="true" />
          </Card>

          {isProfileEditorOpen ? (
            <div
              className="editor-modal-backdrop"
              role="presentation"
              onClick={() => {
                setProfileDraft(null);
                setIsProfileEditorOpen(false);
              }}
            >
              <div
                className="editor-modal"
                role="dialog"
                aria-modal="true"
                aria-label="Edit profile"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="editor-modal-header">
                  <div>
                    <p className="eyebrow">Profile</p>
                    <h3>Edit profile</h3>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary editor-modal-close"
                    onClick={() => {
                      setProfileDraft(null);
                      setIsProfileEditorOpen(false);
                    }}
                  >
                    <XMarkIcon className="icon-18" aria-hidden="true" />
                  </button>
                </div>

                <div className="editor-modal-body">
                  <section className="editor-modal-section">
                    <p className="editor-modal-section-title">Photo</p>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="editor-avatar-hidden-input"
                      disabled={uploadingAvatar}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = '';
                        if (file) {
                          void handleAvatarUpload(file);
                        }
                      }}
                    />
                    <div className="editor-modal-photo-row">
                      <button
                        type="button"
                        className={`editor-avatar-preview editor-avatar-trigger editor-avatar-preview-large profile-avatar is-style-${avatarDisplayStyle}`}
                        onClick={() => avatarInputRef.current?.click()}
                        aria-label="Thay đổi ảnh đại diện"
                        disabled={uploadingAvatar}
                      >
                        {avatarUrl ? <img src={avatarUrl} alt={previewTitle || 'Ảnh đại diện'} /> : <span>AV</span>}
                        <span className="editor-avatar-pencil" aria-hidden="true">
                          <PencilSquareIcon className="icon-12" />
                        </span>
                      </button>
                      <div className="editor-modal-photo-copy">
                        <strong>{previewTitle || 'Chưa có tên hiển thị'}</strong>
                        <p>Click vào ảnh để thay đổi ảnh đại diện.</p>
                      </div>
                    </div>
                  </section>

                  <section className="editor-modal-section">
                    <p className="editor-modal-section-title">Text</p>
                    <div className="editor-profile-grid">
                      <label>
                        Tên hiển thị
                        <input
                          className="input"
                          maxLength={40}
                          value={profileDraft?.displayName ?? ''}
                          onChange={(event) => setProfileDraft((current) => (current ? { ...current, displayName: event.target.value } : current))}
                        />
                      </label>
                      <label>
                        Mô tả
                        <input
                          className="input"
                          maxLength={60}
                          value={profileDraft?.bio ?? ''}
                          onChange={(event) => setProfileDraft((current) => (current ? { ...current, bio: event.target.value } : current))}
                        />
                      </label>
                    </div>
                    <div className="editor-avatar-size-row editor-avatar-size-row-inline">
                      <span className="editor-avatar-size-label">Kích cỡ tên</span>
                      <input
                        className="editor-avatar-size-slider"
                        type="range"
                        min={MIN_DISPLAY_NAME_SIZE_PERCENT}
                        max={MAX_DISPLAY_NAME_SIZE_PERCENT}
                        step={1}
                        value={displayNameSize}
                        onChange={(event) => {
                          const nextSize = clampDisplayNameSizePercent(
                            Number(event.target.value || displayNameSize),
                          );
                          setProfileDraft((current) => (current ? { ...current, displayNameSize: nextSize } : current));
                        }}
                      />
                      <div className="editor-avatar-size-value">
                        <span>{displayNameSize}</span>
                        <span>%</span>
                      </div>
                    </div>
                    <p className="muted-copy editor-avatar-size-hint">Tỉ lệ cỡ tên so với tiêu đề theme (10–100%).</p>
                  </section>

                  <AvatarDisplayStylePicker
                    value={avatarDisplayStyle}
                    avatarSize={avatarSize}
                    onStyleChange={(patch) =>
                      setProfileDraft((current) => (current ? { ...current, ...patch } : current))
                    }
                    onSizeChange={(nextSize) =>
                      setProfileDraft((current) => (current ? { ...current, avatarSize: nextSize } : current))
                    }
                  />
                </div>

                <div className="editor-modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setProfileDraft(null);
                      setIsProfileEditorOpen(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      if (profileDraft) {
                        updateHeaderBlock((current) => ({
                          ...current,
                          fields: {
                            ...current.fields,
                            profile: profileDraft,
                          },
                        }));
                      }
                      setProfileDraft(null);
                      setIsProfileEditorOpen(false);
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <Card>
            <section className="editor-section">
              <p className="eyebrow">Font pairing</p>
              <p className="muted-copy">Chọn bộ font cho tiêu đề (Heading) và nội dung (Paragraph).</p>
              <FontPairingPicker
                value={headerBlock?.fields.typography.fontPairingId ?? pageTypography.fontPairingId}
                onChange={applyFontPairing}
              />
            </section>
          </Card>

          <Card>
            <section className="editor-section">
              <p className="eyebrow">Theme</p>
              <div className="theme-preview-row">
                {themeCards.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    className={`theme-card ${theme.id === themeId ? 'is-selected' : ''}`}
                    title={theme.name}
                    onClick={() => handleThemeSelect(theme)}
                    aria-pressed={theme.id === themeId}
                  >
                    <img
                      src={defaultThemePreview(theme.id)}
                      alt={theme.name}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/img/theme-default.svg';
                      }}
                    />
                    <div className="theme-name">{theme.name}</div>
                  </button>
                ))}
              </div>
              <p className="muted-copy">{selectedTheme?.description ?? 'Theme được nạp từ backend manifest.'}</p>
            </section>
          </Card>

          <Card>
            <section className="editor-section">
              <p className="eyebrow">Style theme</p>
              <div className="editor-form-grid">
                {selectedThemeFields.length
                  ? selectedThemeFields.map((field: NonNullable<ThemeManifest['fields']>[number]) => renderThemeField(field))
                  : (
                    <p className="muted-copy" style={{ margin: 0 }}>Theme này chưa khai báo fields trong manifest.</p>
                  )}
              </div>
            </section>
          </Card>

          <Card>
            <section className="editor-section">
              <p className="eyebrow">Bộ màu</p>
              <div className="editor-stack">
                <section className="editor-background-panel">
                  <div className="background-mode-picker">
                    {backgroundModes.map((option) => {
                      const isActive = pageBackground.mode === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          className={`background-mode-card ${isActive ? 'is-active' : ''}`}
                          onClick={() => {
                            updateHeaderBlock((current) => ({
                              ...current,
                              fields: {
                                ...current.fields,
                                colors: {
                                  ...current.fields.colors,
                                  pageBackground: {
                                    ...current.fields.colors.pageBackground,
                                    mode: option.value,
                                  },
                                },
                              },
                            }));
                            if (option.value === 'ai' && !aiBackgroundPrompt.trim()) {
                              setAiBackgroundPrompt(AI_BACKGROUND_SUGGESTED_PROMPT);
                            }
                          }}
                          aria-pressed={isActive}
                        >
                          <span className={`background-mode-icon background-mode-icon-${option.value}`} aria-hidden="true">
                            {option.icon}
                          </span>
                          <span className="background-mode-label">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {pageBackground.mode === 'ai' ? (
                    <div className="ai-background-panel">
                      <p className="ai-background-panel-title">Mô tả background bạn muốn</p>
                      <textarea
                        className="input ai-background-prompt"
                        rows={4}
                        value={aiBackgroundPrompt}
                        placeholder={AI_BACKGROUND_SUGGESTED_PROMPT}
                        onChange={(event) => setAiBackgroundPrompt(event.target.value)}
                      />
                      <div className="ai-background-actions">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setAiBackgroundPrompt(AI_BACKGROUND_SUGGESTED_PROMPT)}
                        >
                          Dùng gợi ý
                        </button>
                        <button
                          type="button"
                          className="btn btn-dark ai-background-generate-btn"
                          onClick={() => void handleGenerateAiBackground()}
                          disabled={generatingAiBackground}
                        >
                          <SparklesIcon className="icon-18" aria-hidden="true" />
                          {generatingAiBackground ? 'Đang tạo...' : 'Tạo background'}
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {pageBackground.mode === 'image' ? (
                    <button
                      type="button"
                      className="btn btn-primary background-upload-button"
                      onClick={() => backgroundInputRef.current?.click()}
                      disabled={uploadingBackground}
                    >
                      Upload an Image
                    </button>
                  ) : null}

                  <input
                    ref={backgroundInputRef}
                    className="editor-avatar-hidden-input"
                    type="file"
                    accept="image/*"
                    disabled={uploadingBackground}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = '';
                      if (file) {
                        void handleBackgroundUpload(file);
                      }
                    }}
                  />

                  {(pageBackground.mode === 'image' || pageBackground.mode === 'ai') && pageBackground.imageUrl ? (
                    <div className="editor-image-preview" style={{ backgroundImage: `url(${pageBackground.imageUrl})` }} />
                  ) : null}

                </section>

                <section className="editor-color-shell">
                  <div className="editor-colors-header">
                    <p className="eyebrow">Colors</p>
                  </div>

                  <div className="editor-stack">
                    <section className="editor-color-group">
                      <p className="editor-color-group-title">Page</p>
                      <div className="editor-color-list">
                        {pageBackground.mode === 'solid' ? (
                          <label className="editor-color-row">
                            <span>Background</span>
                            <input
                              className="input"
                              type="color"
                              value={pageBackground.solid}
                              onChange={(event) =>
                                updateHeaderBlock((current) => ({
                                  ...current,
                                  fields: {
                                    ...current.fields,
                                    colors: {
                                      ...current.fields.colors,
                                      pageBackground: {
                                        ...current.fields.colors.pageBackground,
                                        solid: event.target.value,
                                      },
                                    },
                                  },
                                }))
                              }
                            />
                          </label>
                        ) : null}

                        {pageBackground.mode === 'gradient' ? (
                          <>
                            <label className="editor-color-row">
                              <span>Background start</span>
                              <input
                                className="input"
                                type="color"
                                value={pageBackground.gradient.start}
                                onChange={(event) =>
                                  updateHeaderBlock((current) => ({
                                    ...current,
                                    fields: {
                                      ...current.fields,
                                      colors: {
                                        ...current.fields.colors,
                                        pageBackground: {
                                          ...current.fields.colors.pageBackground,
                                          gradient: {
                                            ...current.fields.colors.pageBackground.gradient,
                                            start: event.target.value,
                                          },
                                        },
                                      },
                                    },
                                  }))
                                }
                              />
                            </label>
                            <label className="editor-color-row">
                              <span>Background end</span>
                              <input
                                className="input"
                                type="color"
                                value={pageBackground.gradient.end}
                                onChange={(event) =>
                                  updateHeaderBlock((current) => ({
                                    ...current,
                                    fields: {
                                      ...current.fields,
                                      colors: {
                                        ...current.fields.colors,
                                        pageBackground: {
                                          ...current.fields.colors.pageBackground,
                                          gradient: {
                                            ...current.fields.colors.pageBackground.gradient,
                                            end: event.target.value,
                                          },
                                        },
                                      },
                                    },
                                  }))
                                }
                              />
                            </label>
                          </>
                        ) : null}

                        {(pageBackground.mode === 'image' || pageBackground.mode === 'ai') ? (
                          <>
                            <label className="editor-color-row">
                              <span>Overlay color</span>
                              <input
                                className="input"
                                type="color"
                                value={pageBackground.overlayColor ?? '#000000'}
                                onChange={(event) =>
                                  updateHeaderBlock((current) => ({
                                    ...current,
                                    fields: {
                                      ...current.fields,
                                      colors: {
                                        ...current.fields.colors,
                                        pageBackground: {
                                          ...current.fields.colors.pageBackground,
                                          overlayColor: event.target.value,
                                        },
                                      },
                                    },
                                  }))
                                }
                              />
                            </label>
                            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '14px', color: 'var(--muted)' }}>Overlay opacity</span>
                                <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: '600' }}>
                                  {pageBackground.overlayOpacity ?? 0}%
                                </span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={pageBackground.overlayOpacity ?? 0}
                                onChange={(event) =>
                                  updateHeaderBlock((current) => ({
                                    ...current,
                                    fields: {
                                      ...current.fields,
                                      colors: {
                                        ...current.fields.colors,
                                        pageBackground: {
                                          ...current.fields.colors.pageBackground,
                                          overlayOpacity: Number(event.target.value),
                                        },
                                      },
                                    },
                                  }))
                                }
                                style={{
                                  width: '100%',
                                  height: '6px',
                                  borderRadius: '3px',
                                  background: 'var(--line)',
                                  outline: 'none',
                                  cursor: 'pointer',
                                }}
                              />
                            </label>
                          </>
                        ) : null}

                        <label className="editor-color-row">
                          <span>Header text and icons</span>
                          <input
                            className="input"
                            type="color"
                            value={headerColor}
                            onChange={(event) =>
                              updateHeaderBlock((current) => ({
                                ...current,
                                fields: {
                                  ...current.fields,
                                  colors: { ...current.fields.colors, headerTextAndIcon: event.target.value },
                                },
                              }))
                            }
                          />
                        </label>
                      </div>
                    </section>

                    <section className="editor-color-group">
                      <p className="editor-color-group-title">Link block</p>
                      <div className="editor-color-list">
                        <label className="editor-color-row">
                          <span>Background</span>
                          <input
                            className="input"
                            type="color"
                            value={socialBg}
                            onChange={(event) =>
                              updateHeaderBlock((current) => ({
                                ...current,
                                fields: {
                                  ...current.fields,
                                  colors: { ...current.fields.colors, socialBlockBackground: event.target.value },
                                },
                              }))
                            }
                          />
                        </label>
                        <label className="editor-color-row">
                          <span>Text</span>
                          <input
                            className="input"
                            type="color"
                            value={socialText}
                            onChange={(event) =>
                              updateHeaderBlock((current) => ({
                                ...current,
                                fields: {
                                  ...current.fields,
                                  colors: { ...current.fields.colors, socialBlockText: event.target.value },
                                },
                              }))
                            }
                          />
                        </label>
                      </div>
                    </section>

                    <section className="editor-color-group">
                      <p className="editor-color-group-title">Block</p>
                      <div className="editor-color-list">
                        <label className="editor-color-row">
                          <span>Background</span>
                          <input
                            className="input"
                            type="color"
                            value={contentBg}
                            onChange={(event) =>
                              updateHeaderBlock((current) => ({
                                ...current,
                                fields: {
                                  ...current.fields,
                                  colors: { ...current.fields.colors, contentBlockBackground: event.target.value },
                                },
                              }))
                            }
                          />
                        </label>
                        <label className="editor-color-row">
                          <span>Text</span>
                          <input
                            className="input"
                            type="color"
                            value={contentText}
                            onChange={(event) =>
                              updateHeaderBlock((current) => ({
                                ...current,
                                fields: {
                                  ...current.fields,
                                  colors: { ...current.fields.colors, contentBlockText: event.target.value },
                                },
                              }))
                            }
                          />
                        </label>
                        <label className="editor-color-row">
                          <span>Button background</span>
                          <input
                            className="input"
                            type="color"
                            value={buttonColor}
                            onChange={(event) =>
                              updateHeaderBlock((current) => ({
                                ...current,
                                fields: {
                                  ...current.fields,
                                  colors: { ...current.fields.colors, contentBlockButton: event.target.value },
                                },
                              }))
                            }
                          />
                        </label>
                      </div>
                    </section>
                  </div>
                </section>
              </div>
            </section>
          </Card>

          <Card>
            <section className="editor-section">
              <p className="eyebrow">Mạng xã hội</p>
              <SocialLinksEditor
                items={editorSocialItems}
                socialIconSize={socialIconSize}
                onIconSizeChange={(nextSize) =>
                  updateHeaderBlock((current) => ({
                    ...current,
                    fields: {
                      ...current.fields,
                      socials: {
                        ...current.fields.socials,
                        iconSize: nextSize,
                      },
                    },
                  }))
                }
                onItemsChange={(nextItems) =>
                  updateHeaderBlock((current) => ({
                    ...current,
                    fields: {
                      ...current.fields,
                      socials: {
                        ...current.fields.socials,
                        items: nextItems,
                      },
                    },
                  }))
                }
              />
            </section>
          </Card>
      </DashboardBuilderLayout>

      {notice || editorError ? (
        <div className={`editor-toast ${editorError ? 'is-error' : 'is-success'}`} role="status" aria-live="polite">
          <span className="editor-toast-icon" aria-hidden="true" />
          <span className="editor-toast-text">{editorError || notice}</span>
          <button
            type="button"
            className="editor-toast-close"
            aria-label="Đóng thông báo"
            onClick={() => {
              setNotice('');
              setEditorError('');
            }}
          >
            x
          </button>
        </div>
      ) : null}
    </DashboardShell>
  );
}
