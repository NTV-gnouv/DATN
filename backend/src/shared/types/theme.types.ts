/**
 * Comprehensive theme type definitions for the landing page customization system
 */

export type ThemeSocialLink = {
  platform: string;
  url: string;
  icon?: string;
};

export type ThemeProfileData = {
  username: string;
  displayName: string;
  description: string;
  industry: string;
  socialLinks: ThemeSocialLink[];
  avatar?: string;
};

export type ThemeColors = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  textLight: string;
  border: string;
  success?: string;
  warning?: string;
  error?: string;
};

export type ThemeTypography = {
  fontFamily: string;
  headingSize: number;
  bodySize: number;
  headingWeight: number;
  bodyWeight: number;
  lineHeight: number;
  letterSpacing?: number;
};

export type ThemeLayout = {
  maxWidth: number;
  padding: number;
  gap: number;
  alignment: 'center' | 'left' | 'right';
  borderRadius?: number;
};

export type ThemeBorders = {
  radius: number;
  width: number;
  style: 'solid' | 'dashed' | 'dotted';
  color: string;
};

export type EffectIntensity = 'light' | 'medium' | 'heavy';

export type ThemeEffects = {
  shadowEnabled: boolean;
  shadowIntensity: EffectIntensity;
  shadowColor?: string;
  transitionDuration: number;
  hoverScale: number;
  borderAnimation?: string;
  fadeInOnLoad?: boolean;
  parallaxEnabled?: boolean;
};

export type ComponentStyle = 'flat' | 'elevated' | 'outlined';
export type AvatarShape = 'circle' | 'square' | 'rounded';

export type ThemeComponents = {
  cardStyle: ComponentStyle;
  buttonStyle: ComponentStyle;
  avatarShape: AvatarShape;
  headerStyle?: 'minimal' | 'bold' | 'gradient';
};

export type ThemeConfig = {
  id: string;
  pageId: string;
  name: string;
  description?: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  isDefault: boolean;
  isActive: boolean;
  
  profileData: ThemeProfileData;
  
  theme: {
    colors: ThemeColors;
    typography: ThemeTypography;
    layout: ThemeLayout;
    borders: ThemeBorders;
    effects: ThemeEffects;
    components: ThemeComponents;
  };
  
  customCss?: string;
  metadata?: Record<string, unknown>;
};

export type ThemeTemplate = {
  id: string;
  name: string;
  description?: string;
  category: 'professional' | 'creative' | 'minimal' | 'bold' | 'playful';
  preview?: string;
  config: Omit<ThemeConfig, 'id' | 'pageId' | 'createdAt' | 'updatedAt'>;
};

export type ColorPalette = {
  id: string;
  name: string;
  industry: string;
  colors: ThemeColors;
  description?: string;
};

export type ThemeGenerationInput = {
  username: string;
  displayName: string;
  description: string;
  industry: string;
  socialLinks?: ThemeSocialLink[];
  tone?: string;
  preferredStyle?: string;
};

export type ThemeGenerationResult = {
  profileData: ThemeProfileData;
  suggestedTheme: Omit<ThemeConfig, 'id' | 'pageId' | 'createdAt' | 'updatedAt'>;
  alternativePalettes?: ColorPalette[];
  suggestedTemplates?: ThemeTemplate[];
};

export type ThemeCustomizationRequest = {
  profileData?: Partial<ThemeProfileData>;
  colors?: Partial<ThemeColors>;
  typography?: Partial<ThemeTypography>;
  layout?: Partial<ThemeLayout>;
  borders?: Partial<ThemeBorders>;
  effects?: Partial<ThemeEffects>;
  components?: Partial<ThemeComponents>;
  customCss?: string;
};
