import { Injectable } from '@nestjs/common';
import { ThemesRepository } from './themes.repository';
import { ThemeConfig, ThemeCustomizationRequest, ThemeGenerationInput, ThemeGenerationResult, ColorPalette } from '@/shared/types/theme.types';
import { getDefaultPaletteForIndustry, getAlternativePalettes, THEME_TEMPLATES } from './theme.presets';

@Injectable()
export class ThemeCustomizerService {
  constructor(private readonly themesRepository: ThemesRepository) {}

  /**
   * Generate a theme based on user profile data
   */
  async generateThemeFromProfile(input: ThemeGenerationInput): Promise<ThemeGenerationResult> {
    // Get default palette for industry
    const primaryPalette = getDefaultPaletteForIndustry(input.industry);
    const alternativePalettes = getAlternativePalettes(input.industry, primaryPalette.id);

    // Create theme configuration with generated data
    const suggestedTheme: Omit<ThemeConfig, 'id' | 'pageId' | 'createdAt' | 'updatedAt'> = {
      name: `${input.displayName}'s Theme`,
      description: `Auto-generated theme for ${input.displayName}`,
      version: '1.0.0',
      isDefault: false,
      isActive: true,
      profileData: {
        username: input.username,
        displayName: input.displayName,
        description: input.description,
        industry: input.industry,
        socialLinks: input.socialLinks || [],
      },
      theme: {
        colors: primaryPalette.colors,
        typography: {
          fontFamily: 'Inter, sans-serif',
          headingSize: 32,
          bodySize: 16,
          headingWeight: 700,
          bodyWeight: 400,
          lineHeight: 1.6,
        },
        layout: {
          maxWidth: 1100,
          padding: 24,
          gap: 16,
          alignment: 'center',
        },
        borders: {
          radius: 8,
          width: 1,
          style: 'solid',
          color: primaryPalette.colors.border,
        },
        effects: {
          shadowEnabled: true,
          shadowIntensity: 'medium',
          transitionDuration: 300,
          hoverScale: 1.03,
          fadeInOnLoad: true,
        },
        components: {
          cardStyle: 'elevated',
          buttonStyle: 'elevated',
          avatarShape: 'circle',
        },
      },
    };

    return {
      profileData: suggestedTheme.profileData,
      suggestedTheme,
      alternativePalettes,
      suggestedTemplates: this.getSuggestedTemplates(input.industry),
    };
  }

  /**
   * Get theme templates suitable for an industry
   */
  private getSuggestedTemplates(industry: string) {
    const categoryMap: Record<string, string> = {
      technology: 'professional',
      business: 'professional',
      creative: 'creative',
      health: 'professional',
      lifestyle: 'creative',
    };

    const category = categoryMap[industry.toLowerCase()] || 'professional';
    return THEME_TEMPLATES.filter((t) => t.category === category || t.category === 'minimal');
  }

  /**
   * Customize a theme with user overrides
   */
  async customizeTheme(theme: ThemeConfig, customization: ThemeCustomizationRequest): Promise<ThemeConfig> {
    const updated: ThemeConfig = {
      ...theme,
      updatedAt: new Date(),
    };

    if (customization.profileData) {
      updated.profileData = { ...updated.profileData, ...customization.profileData };
    }

    if (customization.colors) {
      updated.theme.colors = { ...updated.theme.colors, ...customization.colors };
    }

    if (customization.typography) {
      updated.theme.typography = { ...updated.theme.typography, ...customization.typography };
    }

    if (customization.layout) {
      updated.theme.layout = { ...updated.theme.layout, ...customization.layout };
    }

    if (customization.borders) {
      updated.theme.borders = { ...updated.theme.borders, ...customization.borders };
    }

    if (customization.effects) {
      updated.theme.effects = { ...updated.theme.effects, ...customization.effects };
    }

    if (customization.components) {
      updated.theme.components = { ...updated.theme.components, ...customization.components };
    }

    if (customization.customCss) {
      updated.customCss = customization.customCss;
    }

    return updated;
  }

  /**
   * Generate CSS from theme configuration
   */
  generateThemeCSS(theme: ThemeConfig): string {
    const { colors, typography, layout, borders, effects, components } = theme.theme;
    const shadowIntensityMap = {
      light: '0 2px 8px rgba(0, 0, 0, 0.1)',
      medium: '0 4px 16px rgba(0, 0, 0, 0.15)',
      heavy: '0 8px 24px rgba(0, 0, 0, 0.25)',
    };

    const css = `
/* Generated Theme CSS */
:root {
  --color-primary: ${colors.primary};
  --color-secondary: ${colors.secondary};
  --color-accent: ${colors.accent};
  --color-background: ${colors.background};
  --color-text: ${colors.text};
  --color-text-light: ${colors.textLight};
  --color-border: ${colors.border};
  --color-success: ${colors.success || '#10b981'};
  --color-warning: ${colors.warning || '#f59e0b'};
  --color-error: ${colors.error || '#ef4444'};

  --font-family: ${typography.fontFamily};
  --font-heading-size: ${typography.headingSize}px;
  --font-body-size: ${typography.bodySize}px;
  --font-heading-weight: ${typography.headingWeight};
  --font-body-weight: ${typography.bodyWeight};
  --font-line-height: ${typography.lineHeight};
  --font-letter-spacing: ${typography.letterSpacing || '0'}px;

  --layout-max-width: ${layout.maxWidth}px;
  --layout-padding: ${layout.padding}px;
  --layout-gap: ${layout.gap}px;

  --border-radius: ${borders.radius}px;
  --border-width: ${borders.width}px;
  --border-style: ${borders.style};
  --border-color: ${borders.color};

  --shadow: ${shadowIntensityMap[effects.shadowIntensity]};
  --transition-duration: ${effects.transitionDuration}ms;
  --hover-scale: ${effects.hoverScale};
}

body {
  font-family: var(--font-family);
  font-size: var(--font-body-size);
  font-weight: var(--font-body-weight);
  line-height: var(--font-line-height);
  color: var(--color-text);
  background-color: var(--color-background);
}

h1, h2, h3, h4, h5, h6 {
  font-weight: var(--font-heading-weight);
  color: var(--color-text);
}

h1 { font-size: calc(var(--font-heading-size) * 1.5); }
h2 { font-size: calc(var(--font-heading-size) * 1.3); }
h3 { font-size: calc(var(--font-heading-size) * 1.1); }

a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color var(--transition-duration);
}

a:hover {
  color: var(--color-accent);
}

button, .btn {
  font-family: var(--font-family);
  font-size: var(--font-body-size);
  padding: 12px 24px;
  border-radius: var(--border-radius);
  border: var(--border-width) solid var(--border-color);
  transition: all var(--transition-duration);
  cursor: pointer;
}

button:hover, .btn:hover {
  transform: scale(var(--hover-scale));
}

${components.cardStyle === 'elevated' ? `
.card {
  background-color: var(--color-background);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
}
` : components.cardStyle === 'outlined' ? `
.card {
  background-color: var(--color-background);
  border: var(--border-width) solid var(--border-color);
  border-radius: var(--border-radius);
}
` : `
.card {
  background-color: var(--color-background);
  border-radius: var(--border-radius);
}
`}

${components.avatarShape === 'circle' ? `
.avatar {
  border-radius: 50%;
}
` : components.avatarShape === 'square' ? `
.avatar {
  border-radius: 0;
}
` : `
.avatar {
  border-radius: calc(var(--border-radius) * 2);
}
`}

${effects.fadeInOnLoad ? `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

body {
  animation: fadeIn 0.5s ease-in;
}
` : ''}

${theme.customCss || ''}
    `.trim();

    return css;
  }

  /**
   * Save a custom theme to database
   */
  async saveTheme(pageId: string, themeConfig: ThemeConfig): Promise<ThemeConfig> {
    const theme: ThemeConfig = {
      ...themeConfig,
      pageId,
      id: themeConfig.id || `theme-${Date.now()}`,
      createdAt: themeConfig.createdAt || new Date(),
      updatedAt: new Date(),
    };

    return await this.themesRepository.createCustomTheme(theme);
  }

  /**
   * Update an existing custom theme
   */
  async updateTheme(id: string, updates: Partial<ThemeConfig>): Promise<ThemeConfig | null> {
    return await this.themesRepository.updateCustomTheme(id, updates);
  }

  /**
   * Get a custom theme
   */
  async getTheme(id: string): Promise<ThemeConfig | null> {
    return await this.themesRepository.getCustomTheme(id);
  }

  /**
   * List all themes for a page
   */
  async listThemesForPage(pageId: string): Promise<ThemeConfig[]> {
    return await this.themesRepository.listCustomThemesByPage(pageId);
  }

  /**
   * Delete a theme
   */
  async deleteTheme(id: string): Promise<boolean> {
    return await this.themesRepository.deleteCustomTheme(id);
  }
}
