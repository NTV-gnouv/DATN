import { IsString, IsArray, ValidateNested, IsOptional, IsBoolean, IsEnum, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { SocialPlatform, SocialLink } from '@/shared/types/onboarding.types';

export class SocialLinkDto implements SocialLink {
  @IsEnum(['instagram', 'tiktok', 'youtube', 'behance', 'x', 'snapchat', 'linkedin'])
  platform!: SocialPlatform;

  @IsString()
  username!: string;

  @IsOptional()
  @IsUrl()
  url?: string;
}

export class SubmitStep1Dto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialLinkDto)
  socialLinks!: SocialLinkDto[];
}

export class SubmitStep2Dto {
  @IsBoolean()
  isConfirmed!: boolean;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsArray()
  interests?: string[];
}

export class SubmitStep3Dto {
  @IsOptional()
  @IsString()
  editedPrompt?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsString()
  selectedTemplate?: string;
}

export class SubmitStep4Dto {
  @IsBoolean()
  confirmFinal!: boolean;
}

export class GetOnboardingSessionDto {
  sessionId!: string;
}

export class StartOnboardingDto {
  @IsOptional()
  @IsString()
  pageId?: string;

  @IsString()
  userId!: string;
}
