"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialProfilesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../../shared/decorators/public.decorator");
const lookup_social_profile_dto_1 = require("./dto/lookup-social-profile.dto");
const social_profiles_service_1 = require("./social-profiles.service");
let SocialProfilesController = class SocialProfilesController {
    constructor(socialProfilesService) {
        this.socialProfilesService = socialProfilesService;
    }
    lookupByPath(platform, username) {
        return this.socialProfilesService.lookup(platform, username);
    }
    lookup(body) {
        return this.socialProfilesService.lookup(body.platform, body.username);
    }
    lookupBatch(body) {
        return this.socialProfilesService.lookupBatch(body.profiles);
    }
};
exports.SocialProfilesController = SocialProfilesController;
__decorate([
    (0, common_1.Get)(':platform/:username'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Lookup social profile avatar',
        description: 'Verify whether a social account exists and return avatar URL for instagram, tiktok, youtube, or x.',
    }),
    __param(0, (0, common_1.Param)('platform')),
    __param(1, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SocialProfilesController.prototype, "lookupByPath", null);
__decorate([
    (0, common_1.Post)('lookup'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Lookup social profile avatar (POST)',
        description: 'Verify whether a social account exists and return avatar URL from @username.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lookup_social_profile_dto_1.LookupSocialProfileDto]),
    __metadata("design:returntype", void 0)
], SocialProfilesController.prototype, "lookup", null);
__decorate([
    (0, common_1.Post)('lookup/batch'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Lookup multiple social profiles',
        description: 'Batch lookup up to 10 social profiles.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lookup_social_profile_dto_1.LookupSocialProfilesBatchDto]),
    __metadata("design:returntype", void 0)
], SocialProfilesController.prototype, "lookupBatch", null);
exports.SocialProfilesController = SocialProfilesController = __decorate([
    (0, swagger_1.ApiTags)('Social Profiles'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('social-profiles'),
    __metadata("design:paramtypes", [social_profiles_service_1.SocialProfilesService])
], SocialProfilesController);
