import type { CSSProperties, ReactNode } from 'react';

import type { SocialItem } from '@/models/editor.model';
import type { AvatarDisplayStyle } from '@/models/avatar-display.model';
import { resolveAvatarLayoutStyle } from '@/models/avatar-display.model';
import {
  formatSocialPlatformLabel,
  normalizeSocialDisplayMode,
  shouldShowSocialButtons,
  shouldShowSocialIcons,
  type SocialDisplayMode,
} from '@/models/social-display.model';
import { getSocialPlatformIcon } from '@/utils/social-icons';
import {
  buildSocialButtonLabelStyle,
  buildSocialButtonSurfaceStyle,
  buildSocialButtonsShellStyle,
  type SocialBlockStyleInput,
} from '@/utils/social-surface';

type ProfileHeaderSectionProps = {
  avatarUrl: string;
  avatarDisplayStyle: AvatarDisplayStyle;
  avatarWidthPercent: number;
  previewTitle: string;
  previewBio: string;
  headerColor: string;
  titleStyle?: CSSProperties;
  bioStyle?: CSSProperties;
  socialItems: SocialItem[];
  socialIconSize: number;
  socialLabelFontSize?: number;
  socialDisplayMode?: SocialDisplayMode | 'icon-only' | 'icon-and-name';
  socialBlockStyle?: SocialBlockStyleInput;
  placeholder?: string;
  alwaysShowAvatar?: boolean;
  renderSocialIcon?: (item: SocialItem, index: number, icon: ReactNode) => ReactNode;
  renderSocialLink?: (item: SocialItem, index: number, children: ReactNode) => ReactNode;
};

function ProfileAvatar({
  avatarUrl,
  avatarDisplayStyle,
  avatarWidthPercent,
  previewTitle,
  placeholder = '',
}: {
  avatarUrl: string;
  avatarDisplayStyle: AvatarDisplayStyle;
  avatarWidthPercent: number;
  previewTitle: string;
  placeholder?: string;
}) {
  return (
    <div
      className={`profile-avatar is-style-${avatarDisplayStyle}`}
      style={{ width: `${avatarWidthPercent}%` }}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt={previewTitle || 'Ảnh đại diện'} />
      ) : (
        <span>{placeholder}</span>
      )}
    </div>
  );
}

function buildSocialIconNode(item: SocialItem, iconColor: string, socialIconSize: number) {
  const svgIcon = getSocialPlatformIcon(item.platform, iconColor);
  if (!svgIcon) {
    return null;
  }

  return (
    <svg
      viewBox="0 0 24 24"
      width={socialIconSize}
      height={socialIconSize}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svgIcon }}
    />
  );
}

function resolveSocialBlockStyle(
  socialBlockStyle: SocialBlockStyleInput | undefined,
  socialLabelFontSize: number,
): SocialBlockStyleInput {
  return {
    background: socialBlockStyle?.background ?? '#111111',
    color: socialBlockStyle?.color ?? '#ffffff',
    widthPercent: socialBlockStyle?.widthPercent ?? 100,
    border: socialBlockStyle?.border ?? { width: 0, style: 'solid', color: 'transparent', radius: 12 },
    shadow: socialBlockStyle?.shadow ?? { enabled: false, x: 0, y: 0, blur: 0, spread: 0, color: 'transparent' },
    cardSurfaceStyle: socialBlockStyle?.cardSurfaceStyle,
    bodyFontStack: socialBlockStyle?.bodyFontStack,
    labelFontSize: socialBlockStyle?.labelFontSize ?? socialLabelFontSize + 1,
    labelFontWeight: socialBlockStyle?.labelFontWeight ?? 700,
  };
}

export function ProfileHeaderSection({
  avatarUrl,
  avatarDisplayStyle,
  avatarWidthPercent,
  previewTitle,
  previewBio,
  headerColor,
  titleStyle,
  bioStyle,
  socialItems,
  socialIconSize,
  socialLabelFontSize = 11,
  socialDisplayMode = 'icons',
  socialBlockStyle,
  placeholder = '',
  alwaysShowAvatar = false,
  renderSocialIcon,
  renderSocialLink,
}: ProfileHeaderSectionProps) {
  const layout = resolveAvatarLayoutStyle(avatarDisplayStyle);
  const showAvatar = Boolean(avatarUrl) || alwaysShowAvatar;
  const displayMode = normalizeSocialDisplayMode(socialDisplayMode);
  const showIcons = shouldShowSocialIcons(displayMode);
  const showButtons = shouldShowSocialButtons(displayMode);
  const blockStyle = resolveSocialBlockStyle(socialBlockStyle, socialLabelFontSize);
  const buttonSurfaceStyle = buildSocialButtonSurfaceStyle(blockStyle);
  const buttonLabelStyle = buildSocialButtonLabelStyle(blockStyle);
  const buttonsShellStyle = buildSocialButtonsShellStyle(blockStyle);

  const wrapSocialLink = (item: SocialItem, index: number, children: ReactNode) => {
    if (renderSocialLink) {
      return renderSocialLink(item, index, children);
    }
    if (!item.url?.trim()) {
      return children;
    }
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={formatSocialPlatformLabel(item.platform)}
        style={{ color: 'inherit', textDecoration: 'none' }}
      >
        {children}
      </a>
    );
  };

  const iconRow =
    showIcons && socialItems.length > 0 ? (
      <div className="phone-social-icons" style={showButtons ? undefined : buttonsShellStyle}>
        {socialItems.map((item, index) => {
          const iconNode = buildSocialIconNode(item, headerColor, socialIconSize);
          const renderedIcon = renderSocialIcon ? renderSocialIcon(item, index, iconNode) : iconNode;

          return (
            <span key={`${item.platform}-${index}`} className="phone-social-icon-wrap">
              {wrapSocialLink(
                item,
                index,
                <span className="phone-social-icon-item">{renderedIcon}</span>,
              )}
            </span>
          );
        })}
      </div>
    ) : null;

  const buttonList =
    showButtons && socialItems.length > 0 ? (
      <div className="phone-social-buttons" style={buttonsShellStyle}>
        {socialItems.map((item, index) => {
          const iconNode = buildSocialIconNode(item, blockStyle.color, Math.max(18, socialIconSize - 4));

          return (
            <span key={`${item.platform}-button-${index}`} className="phone-social-button-wrap">
              {wrapSocialLink(
                item,
                index,
                <span className="phone-social-button phone-content-card" style={buttonSurfaceStyle}>
                  <span className="phone-social-button-icon">{iconNode}</span>
                  <span className="phone-social-button-label" style={buttonLabelStyle}>
                    {formatSocialPlatformLabel(item.platform)}
                  </span>
                  <span className="phone-social-button-spacer" aria-hidden="true" />
                </span>,
              )}
            </span>
          );
        })}
      </div>
    ) : null;

  const socialSection =
    iconRow || buttonList ? (
      <div className={`profile-social-section${showIcons && showButtons ? ' is-both' : ''}`}>
        {iconRow}
        {buttonList}
      </div>
    ) : null;

  const titleNode = previewTitle ? <h4 style={titleStyle}>{previewTitle}</h4> : null;
  const bioNode = previewBio ? <p style={bioStyle}>{previewBio}</p> : null;

  if (layout === 'horizontal') {
    return (
      <div className="profile-header is-layout-horizontal">
        <div className="profile-header-row">
          {showAvatar ? (
            <ProfileAvatar
              avatarUrl={avatarUrl}
              avatarDisplayStyle={avatarDisplayStyle}
              avatarWidthPercent={avatarWidthPercent}
              previewTitle={previewTitle}
              placeholder={placeholder}
            />
          ) : null}
          <div className="profile-header-copy">
            {titleNode}
            {socialSection}
          </div>
        </div>
        {bioNode ? <div className="profile-header-bio">{bioNode}</div> : null}
      </div>
    );
  }

  return (
    <div className="profile-header is-layout-stacked">
      {showAvatar ? (
        <ProfileAvatar
          avatarUrl={avatarUrl}
          avatarDisplayStyle={avatarDisplayStyle}
          avatarWidthPercent={avatarWidthPercent}
          previewTitle={previewTitle}
          placeholder={placeholder}
        />
      ) : null}
      {titleNode}
      {bioNode}
      {socialSection}
    </div>
  );
}
