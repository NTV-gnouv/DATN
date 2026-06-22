import { PACKAGED_THEME_MANIFESTS } from '@/editor/themes/packaged-theme-manifests';
import type { ThemeManifest } from '@/services/themes.service';

export function isSelectableTheme(item: ThemeManifest | null | undefined): item is ThemeManifest {
  return Boolean(item?.id && item.enabled !== false && Array.isArray(item.fields) && item.fields.length > 0);
}

export function mergeThemeCatalog(apiThemes: ThemeManifest[] | null | undefined): ThemeManifest[] {
  const catalog = new Map<string, ThemeManifest>();

  PACKAGED_THEME_MANIFESTS.filter(isSelectableTheme).forEach((item) => {
    catalog.set(item.id, item);
  });

  (apiThemes ?? []).filter(isSelectableTheme).forEach((item) => {
    catalog.set(item.id, item);
  });

  return Array.from(catalog.values()).sort((a, b) => a.name.localeCompare(b.name, 'vi'));
}
