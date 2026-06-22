import { useEffect, useMemo, useState } from 'react';
import { ChevronDownIcon, TrashIcon } from '@heroicons/react/24/outline';

import type { SocialItem } from '@/models/editor.model';
import type { SocialDisplayMode } from '@/models/social-display.model';
import { normalizeSocialDisplayMode } from '@/models/social-display.model';
import { SocialDisplayModePicker } from '@/components/editor/SocialDisplayModePicker';
import { clampSocialIconSize } from '@/utils/social-icon-size';
import {
  addExtraSocialItem,
  compactSocialItems,
  FEATURED_SOCIAL_PLATFORMS,
  getExtraSocialItems,
  getFeaturedSocialItems,
  getFilledExtraSocialItems,
  mergeEditorSocialItems,
  removeExtraSocialItem,
  resolveEditorSocialItems,
  shouldExpandExtraSocialItems,
  upsertSocialItem,
} from '@/utils/social-editor-items';
import { getSocialPlatformIcon } from '@/utils/social-icons';
import type { SocialBlockStyleInput } from '@/utils/social-surface';

const SOCIAL_PLATFORM_OPTIONS = [
  'TikTok',
  'Instagram',
  'Facebook',
  'YouTube',
  'X',
  'Mail',
  'Website',
  'LinkedIn',
  'Threads',
  'Discord',
  'WhatsApp',
  'Telegram',
  'Spotify',
  'Twitch',
  'Pinterest',
  'Snapchat',
  'Bluesky',
];

type SocialLinksEditorProps = {
  items: SocialItem[];
  socialIconSize: number;
  displayMode: SocialDisplayMode | 'icon-only';
  headerColor: string;
  blockStyle: SocialBlockStyleInput;
  onDisplayModeChange: (mode: SocialDisplayMode) => void;
  onIconSizeChange: (size: number) => void;
  onItemsChange: (items: SocialItem[]) => void;
};

function detectSocialPlatform(value: string) {
  const normalizedValue = value.trim().toLowerCase();
  if (!normalizedValue) {
    return '';
  }
  if (normalizedValue.includes('tiktok.com')) return 'TikTok';
  if (normalizedValue.includes('instagram.com')) return 'Instagram';
  if (normalizedValue.includes('facebook.com') || normalizedValue.includes('fb.com')) return 'Facebook';
  if (normalizedValue.includes('youtube.com') || normalizedValue.includes('youtu.be')) return 'YouTube';
  if (normalizedValue.includes('twitter.com') || normalizedValue.includes('x.com')) return 'X';
  if (normalizedValue.includes('linkedin.com')) return 'LinkedIn';
  if (normalizedValue.includes('threads.net')) return 'Threads';
  if (normalizedValue.startsWith('mailto:')) return 'Mail';
  return '';
}

export function SocialLinksEditor({
  items,
  socialIconSize,
  displayMode,
  headerColor,
  blockStyle,
  onDisplayModeChange,
  onIconSizeChange,
  onItemsChange,
}: SocialLinksEditorProps) {
  const sourceItems = useMemo(() => resolveEditorSocialItems(items), [items]);
  const featuredItems = useMemo(() => getFeaturedSocialItems(sourceItems), [sourceItems]);
  const extraItems = useMemo(() => getExtraSocialItems(sourceItems), [sourceItems]);
  const filledExtraItems = useMemo(() => getFilledExtraSocialItems(sourceItems), [sourceItems]);
  const [showExtraSocials, setShowExtraSocials] = useState(() => shouldExpandExtraSocialItems(sourceItems));

  useEffect(() => {
    if (shouldExpandExtraSocialItems(sourceItems)) {
      setShowExtraSocials(true);
    }
  }, [sourceItems]);

  function commit(nextItems: SocialItem[], keepEmptyExtras = false) {
    onItemsChange(keepEmptyExtras ? mergeEditorSocialItems(nextItems) : compactSocialItems(nextItems));
  }

  function updateFeatured(platform: (typeof FEATURED_SOCIAL_PLATFORMS)[number], url: string) {
    commit(upsertSocialItem(sourceItems, platform, { url, platform }));
  }

  function updateExtra(extraIndex: number, patch: Partial<SocialItem>) {
    const extras = getExtraSocialItems(sourceItems);
    const target = extras[extraIndex];
    if (!target) {
      return;
    }

    const next = sourceItems.map((item) =>
      item.platform === target.platform && item.url === target.url && item.iconUrl === target.iconUrl
        ? { ...item, ...patch }
        : item,
    );
    commit(next);
  }

  function removeExtra(extraIndex: number) {
    const extras = getExtraSocialItems(sourceItems);
    const target = extras[extraIndex];
    if (!target) {
      return;
    }
    commit(removeExtraSocialItem(sourceItems, target));
  }

  function handleAddExtra() {
    setShowExtraSocials(true);
    const usedPlatforms = new Set(sourceItems.map((item) => item.platform));
    const nextPlatform = SOCIAL_PLATFORM_OPTIONS.find((option) => !usedPlatforms.has(option)) ?? 'Website';
    commit(addExtraSocialItem(sourceItems, nextPlatform), true);
  }

  return (
    <>
      <SocialDisplayModePicker
        value={normalizeSocialDisplayMode(displayMode)}
        headerColor={headerColor}
        blockStyle={blockStyle}
        onChange={onDisplayModeChange}
      />

      <div className="editor-social-icon-size">
        <p className="editor-modal-section-title">Kích thước icon</p>
        <div className="editor-avatar-size-row">
          <input
            className="editor-avatar-size-slider"
            type="range"
            min={20}
            max={50}
            step={1}
            value={socialIconSize}
            onChange={(event) => onIconSizeChange(clampSocialIconSize(event.target.value))}
          />
          <div className="editor-avatar-size-value">
            <span>{socialIconSize}</span>
            <span>px</span>
          </div>
        </div>
      </div>

      <p className="muted-copy social-links-hint">4 nền tảng phổ biến nhất. Các liên kết khác nằm ở mục bên dưới.</p>

      <div className="social-links-list social-links-list-featured">
        {featuredItems.map((item) => {
          const svgIcon = getSocialPlatformIcon(item.platform, 'currentColor');
          return (
            <div className="social-link-row social-link-row-featured" key={item.platform}>
              <span className="social-link-platform-label">
                {svgIcon ? (
                  <svg
                    viewBox="0 0 24 24"
                    width={16}
                    height={16}
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    dangerouslySetInnerHTML={{ __html: svgIcon }}
                  />
                ) : null}
                {item.platform}
              </span>
              <input
                className="input social-link-input"
                placeholder="Dán link hoặc @username"
                value={item.url}
                onChange={(event) => updateFeatured(item.platform as (typeof FEATURED_SOCIAL_PLATFORMS)[number], event.target.value)}
              />
            </div>
          );
        })}
      </div>

      {filledExtraItems.length > 0 || showExtraSocials ? (
        <div className="social-links-extra">
          <button
            type="button"
            className="social-links-toggle"
            onClick={() => setShowExtraSocials((current) => !current)}
          >
            <ChevronDownIcon className={`icon-16 social-links-toggle-icon${showExtraSocials ? ' is-open' : ''}`} aria-hidden="true" />
            {showExtraSocials ? 'Ẩn nền tảng khác' : `Hiện thêm ${filledExtraItems.length || extraItems.length} nền tảng khác`}
          </button>

          {showExtraSocials ? (
            <div className="social-links-list">
              {extraItems.map((item, index) => (
                <div className="social-link-row" key={`${item.platform}-${index}`}>
                  <select
                    className="input social-platform-select"
                    value={item.platform}
                    onChange={(event) => updateExtra(index, { platform: event.target.value })}
                  >
                    {SOCIAL_PLATFORM_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>

                  <input
                    className="input social-link-input"
                    placeholder="Dán link"
                    value={item.url}
                    onChange={(event) => {
                      const detectedPlatform = detectSocialPlatform(event.target.value);
                      updateExtra(index, {
                        url: event.target.value,
                        platform: detectedPlatform || item.platform,
                      });
                    }}
                  />

                  <button
                    type="button"
                    className="btn btn-secondary social-row-remove"
                    aria-label="Xóa mạng xã hội"
                    onClick={() => removeExtra(index)}
                  >
                    <TrashIcon className="icon-18" aria-hidden="true" />
                  </button>
                </div>
              ))}

              <button type="button" className="btn btn-secondary social-add-button" onClick={handleAddExtra}>
                + Thêm nền tảng khác
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <button type="button" className="btn btn-secondary social-add-button" onClick={handleAddExtra}>
          + Thêm nền tảng khác
        </button>
      )}
    </>
  );
}
