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
exports.ThemeEnginePipelineDto = exports.ThemeEngineApplyDto = exports.ThemeEngineMapDto = exports.ThemeEngineProfileInputDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class EngineSocialLinkDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EngineSocialLinkDto.prototype, "platform", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EngineSocialLinkDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EngineSocialLinkDto.prototype, "url", void 0);
class ThemeEngineCustomizationsDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ThemeEngineCustomizationsDto.prototype, "mainBackgroundColor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ThemeEngineCustomizationsDto.prototype, "mainTextColor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(12),
    (0, class_validator_1.Max)(48),
    __metadata("design:type", Number)
], ThemeEngineCustomizationsDto.prototype, "reviewFontSize", void 0);
class ThemeEngineProfileInputDto {
}
exports.ThemeEngineProfileInputDto = ThemeEngineProfileInputDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ThemeEngineProfileInputDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ThemeEngineProfileInputDto.prototype, "displayName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ThemeEngineProfileInputDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ThemeEngineProfileInputDto.prototype, "industry", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ThemeEngineProfileInputDto.prototype, "tone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => EngineSocialLinkDto),
    __metadata("design:type", Array)
], ThemeEngineProfileInputDto.prototype, "socialLinks", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ThemeEngineCustomizationsDto),
    __metadata("design:type", ThemeEngineCustomizationsDto)
], ThemeEngineProfileInputDto.prototype, "customizations", void 0);
class ThemeEngineMapDto {
}
exports.ThemeEngineMapDto = ThemeEngineMapDto;
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ThemeEngineProfileInputDto),
    __metadata("design:type", ThemeEngineProfileInputDto)
], ThemeEngineMapDto.prototype, "profile", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ThemeEngineMapDto.prototype, "designProfile", void 0);
class ThemeEngineApplyDto extends ThemeEngineMapDto {
}
exports.ThemeEngineApplyDto = ThemeEngineApplyDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ThemeEngineApplyDto.prototype, "pageId", void 0);
class ThemeEnginePipelineDto {
}
exports.ThemeEnginePipelineDto = ThemeEnginePipelineDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ThemeEnginePipelineDto.prototype, "pageId", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ThemeEngineProfileInputDto),
    __metadata("design:type", ThemeEngineProfileInputDto)
], ThemeEnginePipelineDto.prototype, "profile", void 0);
