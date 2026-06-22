import type { CSSProperties, ReactNode } from 'react';

import type { SocialItem } from '@/models/editor.model';
import type { AvatarDisplayStyle } from '@/models/avatar-display.model';
import { resolveAvatarLayoutStyle } from '@/models/avatar-display.model';
import { getSocialPlatformIcon } from '@/utils/social-icons';

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
  socialDisplayMode?: 'icon-only' | 'icon-and-name';
  placeholder?: string;
  alwaysShowAvatar?: boolean;
  renderSocialIcon?: (item: SocialItem, index: number, icon: ReactNode) => ReactNode;
};

function ProfileAvatar({
  avatarUrl,
  avatarDisplayStyle,
  avatarWidthPercent,
  previewTitle,
  placeholder = 'AV',
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
  socialDisplayMode = 'icon-only',
  placeholder = 'AV',
  alwaysShowAvatar = false,
  renderSocialIcon,
}: ProfileHeaderSectionProps) {
  const layout = resolveAvatarLayoutStyle(avatarDisplayStyle);
  const showAvatar = Boolean(avatarUrl) || alwaysShowAvatar;

  const socialIcons =
    socialItems.length > 0 ? (
      <div className="phone-social-icons">
        {socialItems.map((item, index) => {
          const svgIcon = getSocialPlatformIcon(item.platform, headerColor);
          const iconNode = svgIcon ? (
            <svg
              viewBox="0 0 24 24"
              width={socialIconSize}
              height={socialIconSize}
              xmlns="http://www.w3.org/2000/svg"
              dangerouslySetInnerHTML={{ __html: svgIcon }}
            />
          ) : null;

          const content = (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              {renderSocialIcon ? renderSocialIcon(item, index, iconNode) : iconNode}
              {socialDisplayMode === 'icon-and-name' ? (
                <span style={{ fontSize: `${socialLabelFontSize}px` }}>{item.platform}</span>
              ) : null}
            </span>
          );

          return <span key={`${item.platform}-${index}`}>{content}</span>;
        })}
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
            {socialIcons}
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
      {socialIcons}
    </div>
  );
}
