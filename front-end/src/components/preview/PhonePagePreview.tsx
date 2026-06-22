import { useMemo } from 'react';

import { ContentBlockRenderer } from '@/components/blocks/ContentBlockRenderer';
import { ContactFormBlockPreview, getContactFormBlockConfig } from '@/components/blocks/ContactFormBlockPreview';
import type { HeaderBlock, PageBackground } from '@/models/editor.model';
import type { LandingPage, PageBlock } from '@/models/page.model';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { getBodyStyle, getHeadingStyle, resolvePageTypography } from '@/utils/fonts';
import { clampSocialIconSize } from '@/utils/social-icon-size';
import { isRenderablePreviewBlock } from '@/utils/page-blocks';
import { getThemeEffectsConfig } from '@/utils/theme-effects';
import { resolveThemePreviewMetrics } from '@/utils/theme-preview-metrics';
import { buildPageBackgroundStyle } from '@/utils/page-background';
import { buildContactFormPreviewStyles } from '@/utils/contact-form-surface';
import { ProfileHeaderSection } from '@/components/profile/ProfileHeaderSection';
import { resolveAvatarDisplayStyle } from '@/models/avatar-display.model';

function hasText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

type PhonePagePreviewProps = {
  page: LandingPage | null;
  headerBlock: HeaderBlock | null;
  themeTokens?: Record<string, unknown> | null;
  loading?: boolean;
  error?: string;
  displayNameOverride?: string;
  bioOverride?: string;
  avatarOverride?: string;
};

export function PhonePagePreview({
  page,
  headerBlock,
  themeTokens = null,
  loading = false,
  error = '',
  displayNameOverride,
  bioOverride,
  avatarOverride,
}: PhonePagePreviewProps) {
  const activeHeaderBlock = headerBlock;
  const previewTitle =
    (hasText(displayNameOverride) ? displayNameOverride : '') ||
    (activeHeaderBlock && hasText(activeHeaderBlock.fields.profile.displayName)
      ? activeHeaderBlock.fields.profile.displayName
      : '');
  const previewBio =
    (hasText(bioOverride) ? bioOverride : '') ||
    (activeHeaderBlock && hasText(activeHeaderBlock.fields.profile.bio) ? activeHeaderBlock.fields.profile.bio : '');
  const socialItems = activeHeaderBlock
    ? activeHeaderBlock.fields.socials.items.filter((item) => hasText(item.url) || hasText(item.iconUrl))
    : [];
  const previewBlocks = (page?.blocks ?? []).filter((block) => isRenderablePreviewBlock(block, String(page?.title ?? '')));
  const avatarDisplayStyle = resolveAvatarDisplayStyle(activeHeaderBlock?.fields.profile);
  const avatarUrl =
    (hasText(avatarOverride) ? avatarOverride : '') ||
    (activeHeaderBlock?.fields.profile.avatarUrl ?? '');
  const avatarSize = activeHeaderBlock?.fields.profile.avatarSize ?? 96;
  const displayNameSize = activeHeaderBlock?.fields.profile.displayNameSize;
  const pageBackground: PageBackground = activeHeaderBlock?.fields.colors.pageBackground ?? {
    mode: 'solid',
    solid: '#ffffff',
    gradient: { start: '#ffffff', end: '#cbd5e1', type: 'linear' },
    imageUrl: '',
    overlayColor: '#000000',
    overlayOpacity: 0,
  };
  const headerColor = activeHeaderBlock?.fields.colors.headerTextAndIcon ?? '#111111';
  const socialBg = activeHeaderBlock?.fields.colors.socialBlockBackground ?? '#f5f5f5';
  const socialText = activeHeaderBlock?.fields.colors.socialBlockText ?? '#111111';
  const socialIconSize = clampSocialIconSize(activeHeaderBlock?.fields.socials.iconSize);
  const contentBg = activeHeaderBlock?.fields.colors.contentBlockBackground ?? '#ffffff';
  const contentText = activeHeaderBlock?.fields.colors.contentBlockText ?? '#111111';
  const buttonColor = activeHeaderBlock?.fields.colors.contentBlockButton ?? '#111111';
  const divWidth = activeHeaderBlock?.fields.divLayout.widthPercent ?? 100;
  const border = activeHeaderBlock?.fields.divLayout.border ?? {
    width: 1,
    style: 'solid' as const,
    color: '#cccccc',
    radius: 2,
  };
  const shadow = activeHeaderBlock?.fields.divLayout.boxShadow ?? {
    enabled: false,
    x: 0,
    y: 6,
    blur: 18,
    spread: 0,
    color: 'rgba(0, 0, 0, 0.18)',
  };
  const previewBackgroundStyle = buildPageBackgroundStyle(pageBackground);
  const pageTypography = useMemo(
    () => resolvePageTypography(activeHeaderBlock?.fields ?? null, themeTokens),
    [activeHeaderBlock?.fields, themeTokens],
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
    [avatarSize, displayNameSize, divWidth, pageTypography.bodySize, pageTypography.headingSize, reviewFontSizeFromTokens, socialIconSize],
  );
  const reviewFontSize = previewMetrics.reviewFontSize;
  const avatarWidthPercent = previewMetrics.avatarWidthPercent;
  const themeEffects = getThemeEffectsConfig(themeTokens);
  const cardSurfaceStyle = themeEffects?.cardStyle ?? {};

  return (
    <div className="phone-preview phone-review">
      {themeEffects?.css ? <style>{themeEffects.css}</style> : null}
      <div
        className={`phone-preview-screen mobile-theme-canvas${themeEffects?.className ? ` ${themeEffects.className}` : ''}`}
        style={{
          ...previewBackgroundStyle,
          color: headerColor,
          fontFamily: pageTypography.bodyFontStack,
          lineHeight: pageTypography.lineHeight,
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
          socialDisplayMode={activeHeaderBlock?.fields.socials.displayMode}
        />

        {previewBlocks.map((block, index) => {
          const typedBlock = block as Record<string, unknown>;
          if (String(typedBlock.type ?? '') === 'contact-form') {
            const formConfig = getContactFormBlockConfig(typedBlock);
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
                key={`contact-form-${index}`}
                className="landing-contact-form phone-content-card"
                title={formConfig.title}
                submitLabel={formConfig.submitLabel}
                fields={formConfig.fields}
                showFieldLabels={formConfig.showFieldLabels}
                buttonColor={buttonColor}
                contentText={contentText}
                titleStyle={formStyles.titleStyle}
                surfaceStyle={formStyles.surfaceStyle}
                onSubmit={(event) => event.preventDefault()}
              />
            );
          }

          if (['text', 'gallery', 'link-block', 'review-block'].includes(String(typedBlock.type ?? ''))) {
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

          return (
            <div
              key={`${String(typedBlock.type ?? 'block')}-${index}`}
              className={isLinkType ? 'phone-link-card' : 'phone-content-card'}
              style={{
                width: `${divWidth}%`,
                marginInline: 'auto',
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
              {label ? <p style={{ fontSize: `${reviewFontSize}px` }}>{label}</p> : null}
              {detail ? <p style={{ fontSize: `${reviewFontSize}px` }}>{detail}</p> : null}
            </div>
          );
        })}
        {loading ? <p className="muted-copy">Đang tải preview...</p> : null}
        {error ? <p className="field-error">{error}</p> : null}
      </div>
    </div>
  );
}
