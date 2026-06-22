import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowTopRightOnSquareIcon, EyeIcon, PencilSquareIcon, PlusIcon } from '@heroicons/react/24/outline';

import { AddBlockModal } from '@/components/dashboard/AddBlockModal';
import { DashboardBlockList } from '@/components/dashboard/DashboardBlockList';
import { ContentBlockRenderer } from '@/components/blocks/ContentBlockRenderer';
import { ContactFormBlockPreview, getContactFormBlockConfig } from '@/components/blocks/ContactFormBlockPreview';
import { buildContactFormPreviewStyles } from '@/utils/contact-form-surface';
import { ProfileHeaderSection } from '@/components/profile/ProfileHeaderSection';
import { resolveAvatarDisplayStyle } from '@/models/avatar-display.model';

import { DashboardShell } from '@/components/layout/DashboardShell';
import { useAuth } from '@/hooks/useAuth';
import type { AddableBlockType } from '@/config/block-catalog';
import { getBlockDisplayTitle, getBlockEditorPath } from '@/config/block-catalog';
import type { HeaderBlock, PageBackground } from '@/models/editor.model';
import type { PageBlock, LandingPage } from '@/models/page.model';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { loadSession } from '@/services/auth.service';
import { getDefaultHeaderBlock } from '@/services/editor.service';
import { getPageById, getPageByUsername, getPageEditorConfig, updatePage } from '@/services/pages.service';
import { resolvePageTypography } from '@/utils/fonts';
import { clampSocialIconSize } from '@/utils/social-icon-size';
import {
  createDefaultBlock,
  getBlockId,
  getContentBlocks,
  isRenderablePreviewBlock,
  normalizePageBlocks,
  reorderContentBlocks,
  removeContentBlock,
  toggleContentBlockVisibility,
  upsertContentBlock,
} from '@/utils/page-blocks';
import { getThemeEffectsConfig } from '@/utils/theme-effects';
import { resolveThemePreviewMetrics } from '@/utils/theme-preview-metrics';
import { buildPageBackgroundStyle } from '@/utils/page-background';

const DEFAULT_HERO_BODY = 'A fast creator landing page with a clean Beacons-style flow.';

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

function hasText(value: unknown): value is string {
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

export default function DashboardView() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const session = loadSession();
  const accountUsernames = useMemo(() => {
    const usernameFromName = normalizeSlug(session?.user?.name || '');
    const usernameFromEmail = normalizeSlug(session?.user?.email?.split('@')[0] || '');
    return [usernameFromName, usernameFromEmail].filter((value, index, all) => Boolean(value) && all.indexOf(value) === index);
  }, [session?.user?.email, session?.user?.name]);
  const [page, setPage] = useState<LandingPage | null>(null);
  const [configHeaderBlock, setConfigHeaderBlock] = useState<HeaderBlock | null>(null);
  const [themeTokens, setThemeTokens] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addingBlockType, setAddingBlockType] = useState<AddableBlockType | null>(null);
  const [togglingBlockId, setTogglingBlockId] = useState('');
  const [deletingBlockId, setDeletingBlockId] = useState('');
  const [reordering, setReordering] = useState(false);
  const [actionError, setActionError] = useState('');

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
          loadedPage = await getPageById('p-demo');
        }
        const fallbackHeader = await getDefaultHeaderBlock();
        const config = loadedPage.id ? await getPageEditorConfig(loadedPage.id) : null;
        const resolvedHeader = normalizeHeaderBlock((config?.headerBlock as HeaderBlock | null) ?? fallbackHeader);

        if (!cancelled) {
          setPage({
            ...loadedPage,
            blocks: normalizePageBlocks(loadedPage.blocks),
          });
          setConfigHeaderBlock(resolvedHeader);
          setThemeTokens((config?.themeTokens as Record<string, unknown> | null | undefined) ?? null);
        }
      } catch (caughtError) {
        if (!cancelled) {
          const message = caughtError instanceof Error ? caughtError.message : 'Không thể tải dashboard';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accountUsernames]);

  const activeHeaderBlock = configHeaderBlock;
  const slug = normalizeSlug(page?.slug || page?.title || 'creator-page') || 'creator-page';
  const previewTitle = activeHeaderBlock && hasText(activeHeaderBlock.fields.profile.displayName) ? activeHeaderBlock.fields.profile.displayName : '';
  const previewBio = activeHeaderBlock && hasText(activeHeaderBlock.fields.profile.bio) ? activeHeaderBlock.fields.profile.bio : '';
  const socialItems = activeHeaderBlock
    ? activeHeaderBlock.fields.socials.items.filter((item) => hasText(item.url) || hasText(item.iconUrl))
    : [];
  const contentBlocks = useMemo(() => getContentBlocks(page?.blocks), [page?.blocks]);
  const previewBlocks = (page?.blocks ?? []).filter((block) => isRenderablePreviewBlock(block, String(page?.title ?? '')));
  const avatarDisplayStyle = resolveAvatarDisplayStyle(activeHeaderBlock?.fields.profile);
  const avatarUrl = activeHeaderBlock?.fields.profile.avatarUrl ?? '';
  const avatarSize = activeHeaderBlock?.fields.profile.avatarSize ?? 96;
  const pageBackground = activeHeaderBlock?.fields.colors.pageBackground ?? createDefaultPageBackground();
  const headerColor = activeHeaderBlock?.fields.colors.headerTextAndIcon ?? '#111111';
  const socialBg = activeHeaderBlock?.fields.colors.socialBlockBackground ?? '#f5f5f5';
  const socialText = activeHeaderBlock?.fields.colors.socialBlockText ?? '#111111';
  const socialIconSize = clampSocialIconSize(activeHeaderBlock?.fields.socials.iconSize);
  const contentBg = activeHeaderBlock?.fields.colors.contentBlockBackground ?? '#ffffff';
  const contentText = activeHeaderBlock?.fields.colors.contentBlockText ?? '#111111';
  const buttonColor = activeHeaderBlock?.fields.colors.contentBlockButton ?? '#111111';
  const divWidth = activeHeaderBlock?.fields.divLayout.widthPercent ?? 100;
  const border = activeHeaderBlock?.fields.divLayout.border ?? { width: 1, style: 'solid' as const, color: '#cccccc', radius: 2 };
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
        displayNameSize: activeHeaderBlock?.fields.profile.displayNameSize,
        socialIconSize,
      }),
    [
      activeHeaderBlock?.fields.profile.displayNameSize,
      avatarSize,
      divWidth,
      pageTypography.bodySize,
      pageTypography.headingSize,
      reviewFontSizeFromTokens,
      socialIconSize,
    ],
  );
  const reviewFontSize = previewMetrics.reviewFontSize;
  const avatarWidthPercent = previewMetrics.avatarWidthPercent;
  const themeEffects = getThemeEffectsConfig(themeTokens);

  async function persistBlocks(nextBlocks: PageBlock[]) {
    if (!page?.id) {
      throw new Error('Không tìm thấy page để lưu block.');
    }
    const updatedPage = await updatePage(page.id, { blocks: nextBlocks });
    setPage({
      ...(updatedPage as LandingPage),
      blocks: normalizePageBlocks((updatedPage as LandingPage).blocks),
    });
  }

  async function handleAddBlock(type: AddableBlockType) {
    if (!page?.id) {
      setActionError('Không tìm thấy page để thêm block.');
      return;
    }

    setAddingBlockType(type);
    setActionError('');

    try {
      const block = createDefaultBlock(type);
      const nextBlocks = upsertContentBlock(page, block);
      await persistBlocks(nextBlocks);
      setIsAddModalOpen(false);
      navigate(getBlockEditorPath(type, getBlockId(block)));
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : 'Không thể thêm block');
    } finally {
      setAddingBlockType(null);
    }
  }

  async function handleToggleVisibility(blockId: string) {
    if (!page?.id) {
      return;
    }

    setTogglingBlockId(blockId);
    setActionError('');

    try {
      await persistBlocks(toggleContentBlockVisibility(page, blockId));
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : 'Không thể cập nhật block');
    } finally {
      setTogglingBlockId('');
    }
  }

  async function handleReorder(orderedIds: string[]) {
    if (!page?.id) {
      return;
    }

    setReordering(true);
    setActionError('');

    try {
      await persistBlocks(reorderContentBlocks(page, orderedIds));
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : 'Không thể sắp xếp block');
    } finally {
      setReordering(false);
    }
  }

  async function handleDeleteBlock(blockId: string) {
    if (!page?.id) {
      return;
    }

    const block = contentBlocks.find((item) => getBlockId(item) === blockId);
    const label = block ? getBlockDisplayTitle(String(block.type ?? ''), 0) : 'block này';
    const confirmed = window.confirm(`Xóa ${label}? Hành động này không thể hoàn tác.`);
    if (!confirmed) {
      return;
    }

    setDeletingBlockId(blockId);
    setActionError('');

    try {
      await persistBlocks(removeContentBlock(page, blockId));
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : 'Không thể xóa block');
    } finally {
      setDeletingBlockId('');
    }
  }

  return (
    <DashboardShell onSignOut={signOut}>
      <div className="editor-layout dashboard-home-layout">
        <div className="editor-left-pane">
          <div className="dashboard-home-header">
            <h2>Link in Bio</h2>
          </div>
          <div className="dashboard-blocks-page">
            <button
              type="button"
              className="dashboard-add-block"
              aria-label="Add block"
              onClick={() => setIsAddModalOpen(true)}
            >
              <PlusIcon className="dashboard-add-block-icon" aria-hidden="true" />
              Add block
            </button>

            {actionError ? <p className="field-error">{actionError}</p> : null}

            <DashboardBlockList
              contentBlocks={contentBlocks}
              togglingBlockId={togglingBlockId}
              deletingBlockId={deletingBlockId}
              reordering={reordering}
              onToggleVisibility={(blockId) => void handleToggleVisibility(blockId)}
              onDelete={(blockId) => void handleDeleteBlock(blockId)}
              onReorder={(orderedIds) => void handleReorder(orderedIds)}
            />
          </div>
        </div>

        <AddBlockModal
          open={isAddModalOpen}
          adding={addingBlockType}
          onClose={() => {
            if (!addingBlockType) {
              setIsAddModalOpen(false);
            }
          }}
          onSelect={(type) => void handleAddBlock(type)}
        />

        <aside className="editor-right-pane">
          <div className="editor-right-pane-shell">
            <div className="editor-domain-toolbar">
              <div className="editor-domain-stack">
                <p className="eyebrow">Selected domain</p>
                <div className="editor-domain-control">
                  <span className="editor-domain-prefix">/</span>
                  <button
                    type="button"
                    className="editor-domain-slug"
                    onClick={() => navigate('/dashboard/block/header')}
                    aria-label="Mở trang chỉnh sửa slug"
                  >
                    {slug}
                  </button>
                </div>
              </div>

              <div className="editor-preview-actions">
                <button
                  type="button"
                  className="btn btn-secondary editor-quick-btn"
                  aria-label="Chỉnh sửa slug"
                  title="Chỉnh sửa slug"
                  onClick={() => navigate('/dashboard/block/header')}
                >
                  <PencilSquareIcon className="icon-18" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="btn btn-secondary editor-quick-btn"
                  aria-label="Xem trang công khai"
                  title="Xem trang công khai"
                  onClick={() => {
                    window.open(`/${slug}`, '_blank');
                  }}
                >
                  <EyeIcon className="icon-18" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="btn btn-dark editor-share-btn"
                  aria-label="Sao chép liên kết"
                  title="Sao chép liên kết"
                  onClick={() => {
                    const publicUrl = `${window.location.origin}/${slug}`;
                    void navigator.clipboard.writeText(publicUrl);
                  }}
                >
                  <ArrowTopRightOnSquareIcon className="icon-18" aria-hidden="true" />
                  Share
                </button>
              </div>
            </div>

            <div className="phone-preview">
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
                  titleStyle={{ color: headerColor }}
                  bioStyle={{ color: headerColor }}
                  socialItems={socialItems}
                  socialIconSize={socialIconSize}
                  socialLabelFontSize={previewMetrics.socialLabelFontSize}
                  socialDisplayMode={activeHeaderBlock?.fields.socials.displayMode}
                />

                {previewBlocks.map((block) => {
                  const typedBlock = block as Record<string, unknown>;
                  const blockKey = getBlockId(block as PageBlock);
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
                    });
                    return (
                      <ContactFormBlockPreview
                        key={blockKey}
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
                        key={blockKey}
                        block={typedBlock as PageBlock}
                        index={previewBlocks.indexOf(block as PageBlock)}
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
                      key={blockKey}
                      className={isLinkType ? 'phone-link-card' : 'phone-content-card'}
                      style={{
                        width: `${divWidth}%`,
                        marginInline: 'auto',
                        background: isLinkType ? socialBg : contentBg,
                        color: isLinkType ? socialText : contentText,
                        border: `${border.width}px ${border.style} ${border.color}`,
                        borderRadius: `${border.radius}px`,
                        boxShadow: shadow.enabled ? `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}` : 'none',
                      }}
                    >
                      {label ? <p style={{ fontSize: `${reviewFontSize}px` }}>{label}</p> : null}
                      {detail ? <p style={{ fontSize: `${reviewFontSize}px` }}>{detail}</p> : null}
                      {!isLinkType && hasText(buttonText) && hasText(buttonColor) ? (
                        <button type="button" style={{ background: buttonColor }}>
                          {buttonText}
                        </button>
                      ) : null}
                    </div>
                  );
                })}
                {loading ? <p className="muted-copy">Đang tải preview...</p> : null}
                {error ? <p className="field-error">{error}</p> : null}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </DashboardShell>
  );
}
