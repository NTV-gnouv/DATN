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
exports.ApplyAiThemeDto = exports.AiAnswersDto = exports.SocialLinkDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class SocialLinkDto {
}
exports.SocialLinkDto = SocialLinkDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'TikTok' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SocialLinkDto.prototype, "platform", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://tiktok.com/@creator' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SocialLinkDto.prototype, "url", void 0);
class AiAnswersDto {
}
exports.AiAnswersDto = AiAnswersDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ngô Thanh Vương' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AiAnswersDto.prototype, "displayName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Creator focused on design and growth.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AiAnswersDto.prototype, "bio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Creator Economy' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AiAnswersDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Gen Z creators in Vietnam' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AiAnswersDto.prototype, "targetAudience", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Modern' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AiAnswersDto.prototype, "tone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Inter' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AiAnswersDto.prototype, "preferredFont", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Clean yellow with strong contrast' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AiAnswersDto.prototype, "colorStyle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '#d4a800' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#([0-9a-fA-F]{6})$/),
    __metadata("design:type", String)
], AiAnswersDto.prototype, "primaryColor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '#876200' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#([0-9a-fA-F]{6})$/),
    __metadata("design:type", String)
], AiAnswersDto.prototype, "accentColor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AiAnswersDto.prototype, "includeSocials", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [SocialLinkDto] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SocialLinkDto),
    __metadata("design:type", Array)
], AiAnswersDto.prototype, "socials", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AiAnswersDto.prototype, "includeBackgroundImage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'yellow abstract portrait studio light' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AiAnswersDto.prototype, "backgroundQuery", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Ưu tiên dễ đọc trên mobile.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AiAnswersDto.prototype, "notes", void 0);
class ApplyAiThemeDto {
}
exports.ApplyAiThemeDto = ApplyAiThemeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'p-demo' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ApplyAiThemeDto.prototype, "pageId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: AiAnswersDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AiAnswersDto),
    __metadata("design:type", AiAnswersDto)
], ApplyAiThemeDto.prototype, "answers", void 0);
