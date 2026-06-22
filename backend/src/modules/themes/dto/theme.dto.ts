import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  IsBoolean,
  IsIn,
  Min,
  Max,
  IsHexColor,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ThemeSocialLink,
  ThemeColors,
  ThemeTypography,
  ThemeLayout,
  ThemeBorders,
  ThemeEffects,
  ThemeComponents,
} from '@/shared/types/theme.types';

class SocialLinkDto implements ThemeSocialLink {
  @IsString()
  platform!: string;

  @IsString()
  url!: string;

  @IsOptional()
  @IsString()
  icon?: string;
}

class ColorsDto implements Partial<ThemeColors> {
  @IsHexColor()
  primary!: string;

  @IsHexColor()
  secondary!: string;

  @IsHexColor()
  accent!: string;

  @IsHexColor()
  background!: string;

  @IsHexColor()
  text!: string;

  @IsHexColor()
  textLight!: string;

  @IsHexColor()
  border!: string;

  @IsOptional()
  @IsHexColor()
  success?: string;

  @IsOptional()
  @IsHexColor()
  warning?: string;

  @IsOptional()
  @IsHexColor()
  error?: string;
}

class TypographyDto implements Partial<ThemeTypography> {
  @IsString()
  fontFamily!: string;

  @IsNumber()
  @Min(8)
  @Max(96)
  headingSize!: number;

  @IsNumber()
  @Min(8)
  @Max(48)
  bodySize!: number;

  @IsNumber()
  @Min(100)
  @Max(900)
  headingWeight!: number;

  @IsNumber()
  @Min(100)
  @Max(900)
  bodyWeight!: number;

  @IsNumber()
  @Min(1)
  @Max(3)
  lineHeight!: number;

  @IsOptional()
  @IsNumber()
  letterSpacing?: number;
}

class LayoutDto implements Partial<ThemeLayout> {
  @IsNumber()
  @Min(200)
  @Max(1400)
  maxWidth!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  padding!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  gap!: number;

  @IsIn(['center', 'left', 'right'])
  alignment!: 'center' | 'left' | 'right';

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  borderRadius?: number;
}

class BordersDto implements Partial<ThemeBorders> {
  @IsNumber()
  @Min(0)
  @Max(50)
  radius!: number;

  @IsNumber()
  @Min(0)
  @Max(10)
  width!: number;

  @IsIn(['solid', 'dashed', 'dotted'])
  style!: 'solid' | 'dashed' | 'dotted';

  @IsHexColor()
  color!: string;
}

class EffectsDto implements Partial<ThemeEffects> {
  @IsBoolean()
  shadowEnabled!: boolean;

  @IsIn(['light', 'medium', 'heavy'])
  shadowIntensity!: 'light' | 'medium' | 'heavy';

  @IsOptional()
  @IsHexColor()
  shadowColor?: string;

  @IsNumber()
  @Min(0)
  @Max(1000)
  transitionDuration!: number;

  @IsNumber()
  @Min(0)
  @Max(2)
  hoverScale!: number;

  @IsOptional()
  @IsString()
  borderAnimation?: string;

  @IsOptional()
  @IsBoolean()
  fadeInOnLoad?: boolean;

  @IsOptional()
  @IsBoolean()
  parallaxEnabled?: boolean;
}

class ComponentsDto implements Partial<ThemeComponents> {
  @IsIn(['flat', 'elevated', 'outlined'])
  cardStyle!: 'flat' | 'elevated' | 'outlined';

  @IsIn(['flat', 'elevated', 'outlined'])
  buttonStyle!: 'flat' | 'elevated' | 'outlined';

  @IsIn(['circle', 'square', 'rounded'])
  avatarShape!: 'circle' | 'square' | 'rounded';

  @IsOptional()
  @IsIn(['minimal', 'bold', 'gradient'])
  headerStyle?: 'minimal' | 'bold' | 'gradient';
}

export class CreateThemeDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  pageId!: string;

  @IsString()
  username!: string;

  @IsString()
  displayName!: string;

  @IsString()
  description_text!: string;

  @IsString()
  industry!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialLinkDto)
  socialLinks?: SocialLinkDto[];

  @IsOptional()
  @IsString()
  avatar?: string;

  @ValidateNested()
  @Type(() => ColorsDto)
  colors!: ColorsDto;

  @ValidateNested()
  @Type(() => TypographyDto)
  typography!: TypographyDto;

  @ValidateNested()
  @Type(() => LayoutDto)
  layout!: LayoutDto;

  @ValidateNested()
  @Type(() => BordersDto)
  borders!: BordersDto;

  @ValidateNested()
  @Type(() => EffectsDto)
  effects!: EffectsDto;

  @ValidateNested()
  @Type(() => ComponentsDto)
  components!: ComponentsDto;

  @IsOptional()
  @IsString()
  customCss?: string;

  @IsOptional()
  @IsString()
  tone?: string;

  @IsOptional()
  @IsString()
  preferredStyle?: string;
}

export class UpdateThemeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ColorsDto)
  colors?: Partial<ColorsDto>;

  @IsOptional()
  @ValidateNested()
  @Type(() => TypographyDto)
  typography?: Partial<TypographyDto>;

  @IsOptional()
  @ValidateNested()
  @Type(() => LayoutDto)
  layout?: Partial<LayoutDto>;

  @IsOptional()
  @ValidateNested()
  @Type(() => BordersDto)
  borders?: Partial<BordersDto>;

  @IsOptional()
  @ValidateNested()
  @Type(() => EffectsDto)
  effects?: Partial<EffectsDto>;

  @IsOptional()
  @ValidateNested()
  @Type(() => ComponentsDto)
  components?: Partial<ComponentsDto>;

  @IsOptional()
  @IsString()
  customCss?: string;
}

export class GenerateThemeDto {
  @IsString()
  username!: string;

  @IsString()
  displayName!: string;

  @IsString()
  description!: string;

  @IsString()
  industry!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialLinkDto)
  socialLinks?: SocialLinkDto[];

  @IsOptional()
  @IsString()
  tone?: string;

  @IsOptional()
  @IsString()
  preferredStyle?: string;
}
