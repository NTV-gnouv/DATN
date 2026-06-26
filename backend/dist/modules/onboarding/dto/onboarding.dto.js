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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartOnboardingDto = exports.GetOnboardingSessionDto = exports.SubmitStep4Dto = exports.SubmitStep3Dto = exports.SubmitStep2Dto = exports.SubmitStep1Dto = exports.SocialLinkDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class SocialLinkDto {
}
exports.SocialLinkDto = SocialLinkDto;
__decorate([
    (0, class_validator_1.IsEnum)(['instagram', 'tiktok', 'youtube', 'behance', 'x', 'snapchat', 'linkedin']),
    __metadata("design:type", String)
], SocialLinkDto.prototype, "platform", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SocialLinkDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], SocialLinkDto.prototype, "url", void 0);
class SubmitStep1Dto {
}
exports.SubmitStep1Dto = SubmitStep1Dto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SocialLinkDto),
    __metadata("design:type", Array)
], SubmitStep1Dto.prototype, "socialLinks", void 0);
class SubmitStep2Dto {
}
exports.SubmitStep2Dto = SubmitStep2Dto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SubmitStep2Dto.prototype, "isConfirmed", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitStep2Dto.prototype, "avatar", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitStep2Dto.prototype, "bio", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitStep2Dto.prototype, "displayName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], SubmitStep2Dto.prototype, "interests", void 0);
class SubmitStep3Dto {
}
exports.SubmitStep3Dto = SubmitStep3Dto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitStep3Dto.prototype, "editedPrompt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], SubmitStep3Dto.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitStep3Dto.prototype, "selectedTemplate", void 0);
class SubmitStep4Dto {
}
exports.SubmitStep4Dto = SubmitStep4Dto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SubmitStep4Dto.prototype, "confirmFinal", void 0);
class GetOnboardingSessionDto {
}
exports.GetOnboardingSessionDto = GetOnboardingSessionDto;
class StartOnboardingDto {
}
exports.StartOnboardingDto = StartOnboardingDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StartOnboardingDto.prototype, "pageId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StartOnboardingDto.prototype, "userId", void 0);
