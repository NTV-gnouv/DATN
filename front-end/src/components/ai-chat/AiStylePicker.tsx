import type { AiChatStyleOption } from '@/services/ai-chat.service';
import {
  getStyleOptionAvatarStyle,
  getStyleOptionBackgroundStyle,
  getStyleOptionBlockBackground,
  getStyleOptionBlockBorder,
  getStyleOptionBlockShadow,
} from '@/utils/ai-style-preview';

type AiStylePickerProps = {
  options: AiChatStyleOption[];
  selectedId?: string;
  hoveredId?: string;
  applying?: boolean;
  disabled?: boolean;
  onSelect: (optionId: string) => void;
  onHover?: (optionId: string | null) => void;
};

export function AiStylePicker({
  options,
  selectedId,
  hoveredId,
  applying = false,
  disabled = false,
  onSelect,
  onHover,
}: AiStylePickerProps) {
  return (
    <div className="ai-style-picker" role="listbox" aria-label="Chọn kiểu giao diện">
      <p className="ai-style-picker-title">
        Chọn 1 trong {options.length} phong cách — cuộn để xem thêm
      </p>
      <div className="ai-style-picker-grid">
        {options.map((option) => {
          const isActive = selectedId === option.id;
          const isHovered = hoveredId === option.id;
          const backgroundStyle = getStyleOptionBackgroundStyle(option);
          const avatarStyle = getStyleOptionAvatarStyle(option);
          const blockShadow = getStyleOptionBlockShadow(option);
          const blockBackground = getStyleOptionBlockBackground(option);
          const blockBorder = getStyleOptionBlockBorder(option);

          return (
            <button
              key={option.id}
              type="button"
              role="option"
              aria-selected={isActive}
              className={`ai-style-card${isActive ? ' is-selected' : ''}${isHovered ? ' is-hovered' : ''}`}
              disabled={disabled || applying}
              onClick={() => onSelect(option.id)}
              onMouseEnter={() => onHover?.(option.id)}
              onMouseLeave={() => onHover?.(null)}
              onFocus={() => onHover?.(option.id)}
              onBlur={() => onHover?.(null)}
            >
              <div className="ai-style-card-preview" style={backgroundStyle}>
                <div className={`ai-style-card-avatar is-style-${avatarStyle}`} aria-hidden="true" />
                <div
                  className="ai-style-card-block"
                  style={{ background: blockBackground, boxShadow: blockShadow, ...blockBorder }}
                  aria-hidden="true"
                />
              </div>
              <div className="ai-style-card-copy">
                <strong>{option.label}</strong>
                <span>{option.description}</span>
              </div>
              {isActive && applying ? <span className="ai-style-card-status">Đang áp dụng...</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
