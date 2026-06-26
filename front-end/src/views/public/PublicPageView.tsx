import { useEffect, useMemo, useState, type FormEvent } from 'react';

import { SiteShell } from '@/components/layout/SiteShell';
import { ContentBlockRenderer } from '@/components/blocks/ContentBlockRenderer';
import { ContactFormBlockPreview, getContactFormBlockConfig } from '@/components/blocks/ContactFormBlockPreview';
import type { ContactFormPageBlock } from '@/models/contact-form-block.model';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { useThemePreviewMetrics } from '@/hooks/useThemePreviewMetrics';
import { getPageBySlug, getPageEditorConfig } from '@/services/pages.service';
import { listThemes } from '@/services/themes.service';
import { trackPageView } from '@/services/page-analytics.service';
import { submitContactForm, getContactForm, type ContactFormField, type ContactFormRecord } from '@/services/contact-forms.service';
import { clampSocialIconSize } from '@/utils/social-icon-size';
import { isRenderablePreviewBlock } from '@/utils/page-blocks';
import { getThemeEffectsConfig } from '@/utils/theme-effects';
import { getBodyStyle, getHeadingStyle, getThemeTypographyCssVars, resolvePageTypography } from '@/utils/fonts';
import { buildSocialBlockStyleFromHeader } from '@/utils/social-surface';
import { buildContactFormPreviewStyles } from '@/utils/contact-form-surface';
import { collectContactFormPayload, collectContactFormIdsFromPage, formatContactFormSubmitError, resolveContactFormId, resolvePublicContactFormDisplay } from '@/utils/contact-form-submit';
import { getBlockShellStyle } from '@/utils/block-render-context';
import { ProfileHeaderSection } from '@/components/profile/ProfileHeaderSection';
import { resolveAvatarDisplayStyle } from '@/models/avatar-display.model';
import type { LandingPage, PageBlock } from '@/models/page.model';
import type { HeaderBlock } from '@/models/editor.model';

type PublicPageViewProps = {
  slug: string;
};

type ContactFormPageBlockLocal = ContactFormPageBlock & {
  fields?: ContactFormField[];
};

const DEFAULT_HERO_BODY = 'A fast creator landing page with a clean Beacons-style flow.';

function hasText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function buildPageBackgroundStyle(pageBackground: Record<string, unknown>): React.CSSProperties {
  const bg = pageBackground as Record<string, unknown>;
  if (bg.mode === 'solid') {
    return { backgroundColor: String(bg.solid || '#ffffff') };
  }

  if (bg.mode === 'gradient') {
    const gradient = bg.gradient as Record<string, unknown>;
    const startColor = String(gradient.start || '#ffffff');
    const endColor = String(gradient.end || '#000000');
    const type = String(gradient.type || 'linear');

    if (type === 'linear') {
      return { backgroundImage: `linear-gradient(135deg, ${startColor}, ${endColor})` };
    }

    if (type === 'radial') {
      return { backgroundImage: `radial-gradient(circle, ${startColor}, ${endColor})` };
    }

    if (type === 'diagonal') {
      return { backgroundImage: `linear-gradient(45deg, ${startColor}, ${endColor})` };
    }

    return { backgroundImage: `linear-gradient(135deg, ${startColor}, ${endColor})` };
  }

  if ((bg.mode === 'image' || bg.mode === 'ai') && hasText(bg.imageUrl)) {
    const overlayOpacity = Number(bg.overlayOpacity ?? 0) / 100;
    const rawOverlayColor = String(bg.overlayColor ?? '#000000');

    function toRgba(color: string, alpha: number) {
      const c = color.trim();
      // Hex formats: #RRGGBB or #RGB
      if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(c)) {
        let hex = c.substring(1);
        if (hex.length === 3) {
          hex = hex.split('').map((ch) => ch + ch).join('');
        }
        const intVal = parseInt(hex, 16);
        const r = (intVal >> 16) & 255;
        const g = (intVal >> 8) & 255;
        const b = intVal & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }

      // rgb(...) or rgba(...)
      const rgbMatch = c.match(/rgba?\(([^)]+)\)/i);
      if (rgbMatch) {
        const parts = rgbMatch[1].split(',').map((p) => p.trim());
        const r = parts[0] ?? 0;
        const g = parts[1] ?? 0;
        const b = parts[2] ?? 0;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }

      // fallback to black with alpha
      return `rgba(0,0,0,${alpha})`;
    }

    const overlayStyle = overlayOpacity > 0 ? `linear-gradient(${toRgba(rawOverlayColor, overlayOpacity)}, ${toRgba(rawOverlayColor, overlayOpacity)})` : '';
    const imagePart = `url('${String(bg.imageUrl)}')`;

    return {
      backgroundImage: overlayStyle ? `${overlayStyle}, ${imagePart}` : imagePart,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }

  return { backgroundColor: '#ffffff' };
}

export default function PublicPageView({ slug }: PublicPageViewProps) {
  const [page, setPage] = useState<LandingPage | null>(null);
  const [headerBlock, setHeaderBlock] = useState<HeaderBlock | null>(null);
  const [themeTokens, setThemeTokens] = useState<Record<string, unknown> | null>(null);
  const [submittingFormId, setSubmittingFormId] = useState('');
  const [submitMessageByForm, setSubmitMessageByForm] = useState<Record<string, string>>({});
  const [submitErrorByForm, setSubmitErrorByForm] = useState<Record<string, string>>({});
  const [contactFormsById, setContactFormsById] = useState<Record<string, ContactFormRecord>>({});
  const [contactFormsLoaded, setContactFormsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) {
      setIsLoading(false);
      return;
    }

    void (async () => {
      try {
        const loadedPage = await getPageBySlug(slug);
        setPage(loadedPage);

        if (loadedPage.id) {
          const config = await getPageEditorConfig(loadedPage.id);
          setHeaderBlock(config.headerBlock as HeaderBlock | null);

          const resolvedThemeId = String(config.themeId ?? loadedPage.themeId ?? 'minimal');
          const savedThemeTokens = config.themeTokens as Record<string, unknown> | null | undefined;
          if (savedThemeTokens && Object.keys(savedThemeTokens).length > 0) {
            setThemeTokens(savedThemeTokens);
          } else {
            const themes = await listThemes().catch(() => []);
            const manifest = themes.find((item) => item.id === resolvedThemeId);
            setThemeTokens(
              manifest?.themeTokens && typeof manifest.themeTokens === 'object'
                ? (manifest.themeTokens as Record<string, unknown>)
                : null,
            );
          }
        }
      } catch (caughtError) {
        const error = caughtError instanceof Error ? caughtError.message : 'Không thể tải trang';
        setError(error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [slug]);

  const contactFormIds = useMemo(() => collectContactFormIdsFromPage(page), [page]);

  useEffect(() => {
    if (contactFormIds.length === 0) {
      setContactFormsById({});
      setContactFormsLoaded(true);
      return;
    }

    let cancelled = false;
    setContactFormsLoaded(false);
    void (async () => {
      const entries = await Promise.all(
        contactFormIds.map(async (formId) => {
          try {
            const form = await getContactForm(formId);
            return [formId, form] as const;
          } catch {
            return null;
          }
        }),
      );

      if (cancelled) {
        return;
      }

      const next: Record<string, ContactFormRecord> = {};
      for (const entry of entries) {
        if (entry) {
          next[entry[0]] = entry[1];
        }
      }
      setContactFormsById(next);
      setContactFormsLoaded(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [contactFormIds]);

  useEffect(() => {
    if (!page?.id || !slug || isLoading || error) {
      return;
    }

    void trackPageView(page.id, slug).catch(() => {
      // Analytics should not block public page rendering.
    });
  }, [error, isLoading, page?.id, slug]);

  const reviewFontSizeFromTokens =
    themeTokens && typeof themeTokens === 'object' && themeTokens.review && typeof themeTokens.review === 'object'
      ? Number((themeTokens.review as Record<string, unknown>).fontSize ?? 0)
      : 0;
  const pageTypography = useMemo(
    () => resolvePageTypography(headerBlock?.fields ?? null, themeTokens),
    [headerBlock?.fields, themeTokens],
  );
  useGoogleFonts(pageTypography.googleFontFamilies);
  const previewMetrics = useThemePreviewMetrics({
    canvasMode: 'public-page',
    typographyFontSize: headerBlock?.fields?.typography?.fontSize,
    typographyHeadingSize: headerBlock?.fields?.typography?.headingSize,
    themeReviewFontSize: reviewFontSizeFromTokens > 0 ? reviewFontSizeFromTokens : undefined,
    divWidthPercent: headerBlock?.fields?.divLayout?.widthPercent,
    avatarSize: headerBlock?.fields?.profile?.avatarSize,
    displayNameSize: headerBlock?.fields?.profile?.displayNameSize,
    socialIconSize: clampSocialIconSize(headerBlock?.fields?.socials?.iconSize),
  });
  const themeEffects = getThemeEffectsConfig(themeTokens);
  const cardSurfaceStyle = themeEffects?.cardStyle ?? {};
  const socialBlockStyle = useMemo(
    () =>
      buildSocialBlockStyleFromHeader(headerBlock?.fields ?? null, {
        cardSurfaceStyle,
        bodyFontStack: pageTypography.bodyFontStack,
        labelFontSize: previewMetrics.socialLabelFontSize,
        labelFontWeight: pageTypography.bodyWeight,
      }),
    [
      headerBlock?.fields,
      cardSurfaceStyle,
      pageTypography.bodyFontStack,
      pageTypography.bodyWeight,
      previewMetrics.socialLabelFontSize,
    ],
  );

  if (isLoading) {
    return (
      <SiteShell title={`Trang của ${slug}`} description="Đang tải trang...">
        <div className="public-landing-page" style={{ background: '#f7f7f7' }}>
          <p>Đang tải trang...</p>
        </div>
      </SiteShell>
    );
  }

  if (error || !page) {
    return (
      <SiteShell title={`Trang của ${slug}`} description="Trang không tìm thấy">
        <div className="public-landing-page" style={{ background: '#f7f7f7' }}>
          <p>{error || 'Trang không tìm thấy'}</p>
        </div>
      </SiteShell>
    );
  }

  const previewTitle = headerBlock && hasText(headerBlock.fields.profile.displayName)
    ? headerBlock.fields.profile.displayName
    : '';
  const previewBio = headerBlock && hasText(headerBlock.fields.profile.bio) ? headerBlock.fields.profile.bio : '';
  const socialItems = headerBlock
    ? headerBlock.fields.socials.items.filter((item) => hasText(item.url) || hasText(item.iconUrl))
    : [];
  const previewBlocks = (page?.blocks ?? []).filter((block) => isRenderablePreviewBlock(block, String(page?.title ?? '')));

  const avatarWidthPercent = previewMetrics.avatarWidthPercent;
  const avatarDisplayStyle = resolveAvatarDisplayStyle(headerBlock?.fields.profile);
  const avatarUrl = headerBlock?.fields.profile.avatarUrl ?? '';
  // Page background still follows block background config; theme canvas token styles the preview surface itself.
  const pageBackground = headerBlock?.fields.colors.pageBackground ?? { mode: 'solid', solid: '#ffffff' };

  const headerColor = headerBlock?.fields.colors.headerTextAndIcon ?? '#111111';
  const socialBg = headerBlock?.fields.colors.socialBlockBackground ?? '#f5f5f5';
  const socialText = headerBlock?.fields.colors.socialBlockText ?? '#111111';
  const socialIconSize = clampSocialIconSize(headerBlock?.fields.socials.iconSize);
  const contentBg = headerBlock?.fields.colors.contentBlockBackground ?? '#ffffff';
  const contentText = headerBlock?.fields.colors.contentBlockText ?? '#111111';
  const buttonColor = headerBlock?.fields.colors.contentBlockButton ?? '#111111';
  const divWidth = previewMetrics.divWidth;
  const border = headerBlock?.fields.divLayout.border ?? { width: 1, style: 'solid' as const, color: '#cccccc', radius: 2 };
  const shadow = headerBlock?.fields.divLayout.boxShadow ?? {
    enabled: false,
    x: 0,
    y: 6,
    blur: 18,
    spread: 0,
    color: 'rgba(0, 0, 0, 0.18)',
  };
  const previewBackgroundStyle = buildPageBackgroundStyle(pageBackground);
  const reviewFontSize = previewMetrics.reviewFontSize;

  async function handleSubmitContactForm(
    formBlock: ContactFormPageBlockLocal,
    fields: ContactFormField[],
    event: FormEvent<HTMLFormElement>,
    resolvedFormId: string,
  ) {
    if (!resolvedFormId) {
      return;
    }

    const formElement = event.currentTarget;
    const payload = collectContactFormPayload(formElement, fields);

    setSubmittingFormId(resolvedFormId);
    setSubmitErrorByForm((current) => ({ ...current, [resolvedFormId]: '' }));
    setSubmitMessageByForm((current) => ({ ...current, [resolvedFormId]: '' }));
    try {
      const response = await submitContactForm(resolvedFormId, payload, window.location.href);
      const apiSuccessMessage = contactFormsById[resolvedFormId]?.successMessage?.trim();
      setSubmitMessageByForm((current) => ({
        ...current,
        [resolvedFormId]: apiSuccessMessage || formBlock.successMessage || response.message || 'Đã gửi thành công.',
      }));
      formElement.reset();
    } catch (caughtError) {
      setSubmitErrorByForm((current) => ({
        ...current,
        [resolvedFormId]: formatContactFormSubmitError(caughtError, fields),
      }));
    } finally {
      setSubmittingFormId('');
    }
  }

  return (
      <SiteShell
        title={page?.title ?? `Trang của ${slug}`}
        description={previewBio || `Trang hồ sơ của ${slug}`}
        className="site-shell--public"
        hideHero
      >
      <div className="public-landing-page">
        <div className="public-page-background" style={previewBackgroundStyle} aria-hidden="true" />
        {themeEffects?.css ? <style>{themeEffects.css}</style> : null}
        <div className="public-preview-screen">
          <div
            className={`public-preview-canvas mobile-theme-canvas${themeEffects?.className ? ` ${themeEffects.className}` : ''}`}
            style={{
              color: headerColor,
              fontFamily: pageTypography.bodyFontStack,
              lineHeight: pageTypography.lineHeight,
              ...getThemeTypographyCssVars(pageTypography),
              ...previewMetrics.cssVars,
            }}
          >
          <ProfileHeaderSection
            avatarUrl={avatarUrl}
            avatarDisplayStyle={avatarDisplayStyle}
            avatarWidthPercent={avatarWidthPercent}
            previewTitle={previewTitle}
            previewBio={previewBio}
            headerColor={headerColor}
            titleStyle={getHeadingStyle(pageTypography, previewMetrics.titleFontSize, headerColor)}
            bioStyle={getBodyStyle(pageTypography, previewMetrics.bioFontSize, headerColor)}
            socialItems={socialItems}
            socialIconSize={socialIconSize}
            socialLabelFontSize={previewMetrics.socialLabelFontSize}
            socialDisplayMode={headerBlock?.fields.socials.displayMode}
            socialBlockStyle={socialBlockStyle}
            renderSocialLink={(item, _index, children) =>
              item.url?.trim() ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.platform}
                  style={{ display: 'contents', color: 'inherit', textDecoration: 'none' }}
                >
                  {children}
                </a>
              ) : (
                children
              )
            }
          />

          {/* Content Blocks */}
          {previewBlocks.map((block, index) => {
            const typedBlock = block as Record<string, unknown>;
            if (String(typedBlock.type ?? '') === 'contact-form') {
              const formBlock = typedBlock as unknown as ContactFormPageBlockLocal;
              const formConfig = getContactFormBlockConfig(typedBlock);
              const resolvedFormId = resolveContactFormId(formBlock, index);
              const apiForm = contactFormsById[resolvedFormId];
              if (resolvedFormId && contactFormIds.includes(resolvedFormId) && !contactFormsLoaded) {
                return (
                  <div key={`${resolvedFormId}-${index}-loading`} className="landing-contact-form public-contact-form phone-content-card">
                    <p className="muted-copy">Đang tải biểu mẫu...</p>
                  </div>
                );
              }
              const displayForm = resolvePublicContactFormDisplay(formBlock, formConfig, apiForm);
              const formStyles = buildContactFormPreviewStyles({
                divWidth,
                contentBg,
                contentText,
                border,
                shadow,
                typography: pageTypography,
                reviewFontSize,
                cardTitleFontSize: previewMetrics.cardTitleFontSize,
                cardSurfaceStyle,
              });
              return (
                <ContactFormBlockPreview
                  key={`${resolvedFormId}-${index}-${displayForm.fields.map((field) => field.id).join('-')}`}
                  className="landing-contact-form public-contact-form"
                  nativeForm
                  title={displayForm.title}
                  submitLabel={displayForm.submitLabel}
                  fields={displayForm.fields}
                  showFieldLabels={displayForm.showFieldLabels}
                  buttonColor={buttonColor}
                  contentText={contentText}
                  titleStyle={formStyles.titleStyle}
                  surfaceStyle={formStyles.surfaceStyle}
                  submitting={submittingFormId === resolvedFormId}
                  errorMessage={submitErrorByForm[resolvedFormId]}
                  successMessage={submitMessageByForm[resolvedFormId]}
                  onSubmit={(event) => {
                    event.preventDefault();
                    void handleSubmitContactForm(formBlock, displayForm.fields, event, resolvedFormId);
                  }}
                />
              );
            }

            if (['text', 'gallery', 'album-block', 'link-block', 'review-block'].includes(String(typedBlock.type ?? ''))) {
              return (
                <ContentBlockRenderer
                  key={`${String(typedBlock.type)}-${index}`}
                  block={typedBlock as PageBlock}
                  index={index}
                  context={{
                    contentBg,
                    contentText,
                    buttonColor,
                    divWidth,
                    border,
                    shadow,
                    reviewFontSize,
                    cardTitleFontSize: previewMetrics.cardTitleFontSize,
                    displayFontStack: pageTypography.displayFontStack,
                    bodyFontStack: pageTypography.bodyFontStack,
                    cardSurfaceStyle,
                  }}
                />
              );
            }

            const label = String(typedBlock.label ?? typedBlock.headline ?? '').trim();
            const detail = String(typedBlock.body ?? typedBlock.href ?? '').trim();
            const isLinkType = String(typedBlock.type ?? '').toLowerCase() === 'link';
            const buttonText = String(
              typedBlock.buttonText ?? typedBlock.buttonLabel ?? typedBlock.ctaText ?? typedBlock.ctaLabel ?? '',
            ).trim();

            return (
              <div
                key={`${String(typedBlock.type ?? 'block')}-${index}`}
                className={isLinkType ? 'phone-link-card' : 'phone-content-card'}
                style={{
                  ...getBlockShellStyle(),
                  background: isLinkType ? socialBg : contentBg,
                  color: isLinkType ? socialText : contentText,
                  border: `${border.width}px ${border.style} ${border.color}`,
                  borderRadius: `${border.radius}px`,
                  boxShadow: shadow.enabled
                    ? `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`
                    : 'none',
                  ...cardSurfaceStyle,
                }}
              >
                {label ? (
                  <p style={{ fontSize: `${reviewFontSize}px`, fontFamily: pageTypography.displayFontStack, fontWeight: pageTypography.headingWeight }}>
                    {label}
                  </p>
                ) : null}
                {detail ? (
                  <p style={{ fontSize: `${reviewFontSize}px`, fontFamily: pageTypography.bodyFontStack, lineHeight: pageTypography.lineHeight }}>
                    {detail}
                  </p>
                ) : null}
                {!isLinkType && hasText(buttonText) && hasText(buttonColor) ? (
                  <button type="button" style={{ background: buttonColor }}>
                    {buttonText}
                  </button>
                ) : null}
              </div>
            );
          })}
          </div>
        </div>
      </div>

      <footer className="public-footer" style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: '#999' }}>
        <p style={{ margin: '0' }}>© 2024 ShotVN - Hệ thống quản lý hồ sơ</p>
      </footer>
    </SiteShell>
  );
}
