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
exports.SubmitAiChatSocialsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const USERNAME_PATTERN = /^@?[a-zA-Z0-9._-]{1,50}$/;
function emptyToUndefined({ value }) {
    if (typeof value !== 'string') {
        return value;
    }
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
}
class SubmitAiChatSocialsDto {
}
exports.SubmitAiChatSocialsDto = SubmitAiChatSocialsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '@charlidamelio' }),
    (0, class_transformer_1.Transform)(emptyToUndefined),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(USERNAME_PATTERN, { message: 'TikTok username không hợp lệ' }),
    __metadata("design:type", String)
], SubmitAiChatSocialsDto.prototype, "tiktok", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '@nike' }),
    (0, class_transformer_1.Transform)(emptyToUndefined),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(USERNAME_PATTERN, { message: 'Instagram username không hợp lệ' }),
    __metadata("design:type", String)
], SubmitAiChatSocialsDto.prototype, "instagram", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '@mrbeast' }),
    (0, class_transformer_1.Transform)(emptyToUndefined),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(USERNAME_PATTERN, { message: 'YouTube username không hợp lệ' }),
    __metadata("design:type", String)
], SubmitAiChatSocialsDto.prototype, "youtube", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '@elonmusk' }),
    (0, class_transformer_1.Transform)(emptyToUndefined),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(USERNAME_PATTERN, { message: 'X username không hợp lệ' }),
    __metadata("design:type", String)
], SubmitAiChatSocialsDto.prototype, "x", void 0);
