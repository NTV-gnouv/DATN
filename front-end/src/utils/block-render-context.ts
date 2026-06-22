import type { BlockRenderContext } from '@/components/blocks/ContentBlockRenderer';

export function getBlockShellStyle(context: BlockRenderContext): React.CSSProperties {
  return {
    width: `${context.divWidth}%`,
    marginInline: 'auto',
  };
}

export function getBlockSurfaceStyle(context: BlockRenderContext): React.CSSProperties {
  return {
    background: context.contentBg,
    color: context.contentText,
    border: `${context.border.width}px ${context.border.style} ${context.border.color}`,
    borderRadius: `${context.border.radius}px`,
    boxShadow: context.shadow.enabled
      ? `${context.shadow.x}px ${context.shadow.y}px ${context.shadow.blur}px ${context.shadow.spread}px ${context.shadow.color}`
      : 'none',
    ...(context.cardSurfaceStyle ?? {}),
  };
}

export function getBlockItemStyle(context: BlockRenderContext): React.CSSProperties {
  return {
    ...getBlockSurfaceStyle(context),
    fontSize: `${context.reviewFontSize}px`,
  };
}

export function getBlockOverlayStyle(context: BlockRenderContext): React.CSSProperties {
  return {
    background: `linear-gradient(180deg, rgba(0, 0, 0, 0.12) 0%, color-mix(in srgb, ${context.contentBg} 88%, transparent) 100%)`,
  };
}

export function getBlockNavStyle(context: BlockRenderContext): React.CSSProperties {
  return {
    color: context.contentText,
  };
}

export function getBlockProgressTrackStyle(context: BlockRenderContext): React.CSSProperties {
  return {
    background: `color-mix(in srgb, ${context.contentText} 28%, transparent)`,
  };
}

export function getBlockProgressFillStyle(context: BlockRenderContext): React.CSSProperties {
  return {
    background: context.buttonColor,
  };
}
