import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsIn, IsNotEmpty, IsString, Matches, ValidateNested } from 'class-validator';

import type { SupportedSocialPlatform } from '../social-profiles.types';

const PLATFORMS: SupportedSocialPlatform[] = ['instagram', 'tiktok', 'youtube', 'x'];

export class LookupSocialProfileDto {
  @ApiProperty({ enum: PLATFORMS, example: 'instagram' })
  @IsIn(PLATFORMS)
  platform!: SupportedSocialPlatform;

  @ApiProperty({ example: 'nike', description: 'Username without @ prefix' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9._-]{1,50}$/, {
    message: 'username chỉ được chứa chữ, số, dấu chấm, gạch dưới hoặc gạch ngang',
  })
  username!: string;
}

export class LookupSocialProfilesBatchDto {
  @ApiProperty({ type: [LookupSocialProfileDto] })
  @ValidateNested({ each: true })
  @Type(() => LookupSocialProfileDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  profiles!: LookupSocialProfileDto[];
}
