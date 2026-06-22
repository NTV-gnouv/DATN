import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, Matches } from 'class-validator';

const USERNAME_PATTERN = /^@?[a-zA-Z0-9._-]{1,50}$/;

function emptyToUndefined({ value }: { value: unknown }) {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export class SubmitAiChatSocialsDto {
  @ApiPropertyOptional({ example: '@charlidamelio' })
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  @Matches(USERNAME_PATTERN, { message: 'TikTok username không hợp lệ' })
  tiktok?: string;

  @ApiPropertyOptional({ example: '@nike' })
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  @Matches(USERNAME_PATTERN, { message: 'Instagram username không hợp lệ' })
  instagram?: string;

  @ApiPropertyOptional({ example: '@mrbeast' })
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  @Matches(USERNAME_PATTERN, { message: 'YouTube username không hợp lệ' })
  youtube?: string;

  @ApiPropertyOptional({ example: '@elonmusk' })
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  @Matches(USERNAME_PATTERN, { message: 'X username không hợp lệ' })
  x?: string;
}
