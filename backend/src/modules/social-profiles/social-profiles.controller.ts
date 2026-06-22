import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '@/shared/decorators/public.decorator';

import { LookupSocialProfileDto, LookupSocialProfilesBatchDto } from './dto/lookup-social-profile.dto';
import { SocialProfilesService } from './social-profiles.service';
import type { SupportedSocialPlatform } from './social-profiles.types';

@ApiTags('Social Profiles')
@ApiBearerAuth()
@Controller('social-profiles')
export class SocialProfilesController {
  constructor(private readonly socialProfilesService: SocialProfilesService) {}

  @Get(':platform/:username')
  @Public()
  @ApiOperation({
    summary: 'Lookup social profile avatar',
    description: 'Verify whether a social account exists and return avatar URL for instagram, tiktok, youtube, or x.',
  })
  lookupByPath(@Param('platform') platform: SupportedSocialPlatform, @Param('username') username: string) {
    return this.socialProfilesService.lookup(platform, username);
  }

  @Post('lookup')
  @Public()
  @ApiOperation({
    summary: 'Lookup social profile avatar (POST)',
    description: 'Verify whether a social account exists and return avatar URL from @username.',
  })
  lookup(@Body() body: LookupSocialProfileDto) {
    return this.socialProfilesService.lookup(body.platform, body.username);
  }

  @Post('lookup/batch')
  @Public()
  @ApiOperation({
    summary: 'Lookup multiple social profiles',
    description: 'Batch lookup up to 10 social profiles.',
  })
  lookupBatch(@Body() body: LookupSocialProfilesBatchDto) {
    return this.socialProfilesService.lookupBatch(body.profiles);
  }
}
