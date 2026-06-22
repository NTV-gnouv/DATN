import { useEffect } from 'react';

import { buildGoogleFontsHref } from '@/utils/fonts';

export function useGoogleFonts(families: string[]) {
  useEffect(() => {
    const href = buildGoogleFontsHref(families);
    if (!href) {
      return;
    }

    const id = 'landing-google-fonts';
    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    if (link.href !== href) {
      link.href = href;
    }
  }, [families.join('|')]);
}
