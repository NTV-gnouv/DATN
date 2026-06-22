import {
  AVATAR_DISPLAY_STYLE_OPTIONS,
  buildAvatarProfilePatch,
  type AvatarDisplayStyle,
} from '@/models/avatar-display.model';
import {
  clampAvatarWidthPercent,
  MAX_AVATAR_WIDTH_PERCENT,
  MIN_AVATAR_WIDTH_PERCENT,
  normalizeAvatarWidthPercent,
} from '@/utils/avatar-size';

type AvatarDisplayStylePickerProps = {
  value: AvatarDisplayStyle;
  avatarSize: number;
  onStyleChange: (patch: ReturnType<typeof buildAvatarProfilePatch>) => void;
  onSizeChange: (size: number) => void;
};

function StylePreviewIcon({ style }: { style: AvatarDisplayStyle }) {
  return <span className={`editor-avatar-style-icon is-style-${style}`} aria-hidden="true" />;
}

export function AvatarDisplayStylePicker({
  value,
  avatarSize,
  onStyleChange,
  onSizeChange,
}: AvatarDisplayStylePickerProps) {
  const avatarWidthPercent = normalizeAvatarWidthPercent(avatarSize);

  return (
    <section className="editor-modal-section">
      <p className="editor-modal-section-title">Kiểu hiển thị avatar</p>
      <div className="editor-avatar-style-picker" role="radiogroup" aria-label="Kiểu hiển thị avatar">
        {AVATAR_DISPLAY_STYLE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`editor-avatar-style-option ${value === option.value ? 'is-active' : ''}`}
            onClick={() => onStyleChange(buildAvatarProfilePatch(option.value))}
            aria-pressed={value === option.value}
            title={option.description}
          >
            <StylePreviewIcon style={option.value} />
            <span className="editor-avatar-style-label">{option.label}</span>
          </button>
        ))}
      </div>

      <div className="editor-avatar-size-row editor-avatar-size-row-inline">
        <span className="editor-avatar-size-label">Chiều ngang</span>
        <input
          className="editor-avatar-size-slider"
          type="range"
          min={MIN_AVATAR_WIDTH_PERCENT}
          max={MAX_AVATAR_WIDTH_PERCENT}
          step={1}
          value={avatarWidthPercent}
          onChange={(event) => {
            const nextSize = clampAvatarWidthPercent(Number(event.target.value || avatarWidthPercent));
            onSizeChange(nextSize);
          }}
        />
        <div className="editor-avatar-size-value">
          <span>{avatarWidthPercent}</span>
          <span>%</span>
        </div>
      </div>
      <p className="muted-copy editor-avatar-size-hint">Tỉ lệ chiều ngang avatar so với khung trang.</p>
    </section>
  );
}
