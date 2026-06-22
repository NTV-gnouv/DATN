import type { CSSProperties } from 'react';

import {
  SOCIAL_DISPLAY_MODE_OPTIONS,
  type SocialDisplayMode,
} from '@/models/social-display.model';
import type { SocialBlockStyleInput } from '@/utils/social-surface';
import { buildSocialButtonSurfaceStyle } from '@/utils/social-surface';

type SocialDisplayModePickerProps = {
  value: SocialDisplayMode;
  headerColor: string;
  blockStyle: SocialBlockStyleInput;
  onChange: (mode: SocialDisplayMode) => void;
};

function IconsPreview({ headerColor }: { headerColor: string }) {
  return (
    <div className="editor-social-style-live-preview is-icons" style={{ color: headerColor }}>
      <span className="editor-social-style-live-icon" />
      <span className="editor-social-style-live-icon" />
    </div>
  );
}

function ButtonsPreview({ blockStyle }: { blockStyle: SocialBlockStyleInput }) {
  const buttonStyle = buildSocialButtonSurfaceStyle(blockStyle);

  return (
    <div className="editor-social-style-live-preview is-buttons">
      <span className="editor-social-style-live-button" style={buttonStyle} />
      <span className="editor-social-style-live-button" style={buttonStyle} />
    </div>
  );
}

function BothPreview({ headerColor, blockStyle }: { headerColor: string; blockStyle: SocialBlockStyleInput }) {
  const buttonStyle = buildSocialButtonSurfaceStyle(blockStyle);

  return (
    <div className="editor-social-style-live-preview is-both">
      <div className="editor-social-style-live-icons-row" style={{ color: headerColor }}>
        <span className="editor-social-style-live-icon" />
        <span className="editor-social-style-live-icon" />
      </div>
      <span className="editor-social-style-live-button" style={buttonStyle} />
    </div>
  );
}

function StylePreview({
  mode,
  headerColor,
  blockStyle,
}: {
  mode: SocialDisplayMode;
  headerColor: string;
  blockStyle: SocialBlockStyleInput;
}) {
  if (mode === 'icons') {
    return <IconsPreview headerColor={headerColor} />;
  }
  if (mode === 'buttons') {
    return <ButtonsPreview blockStyle={blockStyle} />;
  }
  return <BothPreview headerColor={headerColor} blockStyle={blockStyle} />;
}

export function SocialDisplayModePicker({ value, headerColor, blockStyle, onChange }: SocialDisplayModePickerProps) {
  const shellWidth = Math.min(100, Math.max(72, blockStyle.widthPercent)) as number;
  const previewShellStyle = {
    width: `${shellWidth}%`,
    marginInline: 'auto',
  } satisfies CSSProperties;

  return (
    <section className="editor-modal-section editor-social-display-section">
      <p className="editor-modal-section-title">Kiểu hiển thị mạng xã hội</p>
      <div className="editor-social-style-picker" role="radiogroup" aria-label="Kiểu hiển thị mạng xã hội">
        {SOCIAL_DISPLAY_MODE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`editor-social-style-option ${value === option.value ? 'is-active' : ''}`}
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
            title={option.description}
          >
            <div className="editor-social-style-preview-shell" style={previewShellStyle}>
              <StylePreview mode={option.value} headerColor={headerColor} blockStyle={blockStyle} />
            </div>
            <span className="editor-social-style-label">{option.label}</span>
          </button>
        ))}
      </div>
      <p className="muted-copy editor-social-style-hint">
        Nút social dùng màu khối social, viền và bóng từ cài đặt theme hiện tại.
      </p>
    </section>
  );
}
