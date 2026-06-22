import { useEffect, useMemo, useState } from 'react';

import {
  MOBILE_REFERENCE_WIDTH,
  PHONE_PREVIEW_WIDTH,
  resolveThemePreviewMetrics,
  type ThemePreviewCanvasMode,
  type ThemePreviewMetrics,
} from '@/utils/theme-preview-metrics';

type UseThemePreviewMetricsOptions = {
  canvasMode: ThemePreviewCanvasMode;
  typographyFontSize?: number;
  typographyHeadingSize?: number;
  themeReviewFontSize?: number;
  divWidthPercent?: number;
  avatarSize?: number;
  displayNameSize?: number;
  socialIconSize?: number;
};

export function useThemePreviewMetrics(options: UseThemePreviewMetricsOptions): ThemePreviewMetrics {
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : MOBILE_REFERENCE_WIDTH,
  );

  useEffect(() => {
    if (options.canvasMode !== 'public-page') {
      return;
    }

    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [options.canvasMode]);

  const effectiveWidth = options.canvasMode === 'phone-frame' ? PHONE_PREVIEW_WIDTH : viewportWidth;

  return useMemo(
    () =>
      resolveThemePreviewMetrics({
        viewportWidth: effectiveWidth,
        canvasMode: options.canvasMode,
        typographyFontSize: options.typographyFontSize,
        typographyHeadingSize: options.typographyHeadingSize,
        themeReviewFontSize: options.themeReviewFontSize,
        divWidthPercent: options.divWidthPercent,
        avatarSize: options.avatarSize,
        displayNameSize: options.displayNameSize,
        socialIconSize: options.socialIconSize,
      }),
    [
      effectiveWidth,
      options.canvasMode,
      options.typographyFontSize,
      options.typographyHeadingSize,
      options.themeReviewFontSize,
      options.divWidthPercent,
      options.avatarSize,
      options.displayNameSize,
      options.socialIconSize,
    ],
  );
}
