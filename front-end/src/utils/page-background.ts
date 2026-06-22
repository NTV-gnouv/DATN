import type { CSSProperties } from 'react';

import type { PageBackground } from '@/models/editor.model';

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '');
  if (normalized.length === 3) {
    return {
      r: parseInt(normalized[0] + normalized[0], 16),
      g: parseInt(normalized[1] + normalized[1], 16),
      b: parseInt(normalized[2] + normalized[2], 16),
    };
  }
  return normalized.length === 6
    ? {
        r: parseInt(normalized.slice(0, 2), 16),
        g: parseInt(normalized.slice(2, 4), 16),
        b: parseInt(normalized.slice(4, 6), 16),
      }
    : { r: 0, g: 0, b: 0 };
}

export function isImageLikeBackgroundMode(mode: PageBackground['mode']) {
  return mode === 'image' || mode === 'ai';
}

export function buildPageBackgroundStyle(pageBackground: PageBackground): CSSProperties {
  if (pageBackground.mode === 'gradient') {
    const angle = pageBackground.gradient.type === 'diagonal' ? '135deg' : '180deg';
    const gradientValue =
      pageBackground.gradient.type === 'radial'
        ? `radial-gradient(circle, ${pageBackground.gradient.start} 0%, ${pageBackground.gradient.end} 100%)`
        : `linear-gradient(${angle}, ${pageBackground.gradient.start} 0%, ${pageBackground.gradient.end} 100%)`;

    return {
      background: gradientValue,
    };
  }

  if (isImageLikeBackgroundMode(pageBackground.mode) && pageBackground.imageUrl) {
    const overlayOpacity = pageBackground.overlayOpacity ?? 0;
    const overlayColor = pageBackground.overlayColor ?? '#000000';

    let backgroundImage = `url(${pageBackground.imageUrl})`;

    if (overlayOpacity > 0) {
      const rgbColor = hexToRgb(overlayColor);
      const overlayGradient = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${overlayOpacity / 100})`;
      backgroundImage = `linear-gradient(${overlayGradient}, ${overlayGradient}), ${backgroundImage}`;
    }

    return {
      backgroundColor: '#ffffff',
      backgroundImage,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    };
  }

  return {
    background: pageBackground.solid,
  };
}
