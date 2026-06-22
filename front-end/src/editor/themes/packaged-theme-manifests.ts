import handrawnCream from '@/data/themes/handrawn-cream.json';
import type { ThemeManifest } from '@/services/themes.service';

/** Themes bundled with the frontend — shown even before backend rescan picks them up. */
export const PACKAGED_THEME_MANIFESTS: ThemeManifest[] = [handrawnCream as ThemeManifest];
