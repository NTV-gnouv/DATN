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
exports.GenerateThemeDto = exports.UpdateThemeDto = exports.CreateThemeDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class SocialLinkDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SocialLinkDto.prototype, "platform", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SocialLinkDto.prototype, "url", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SocialLinkDto.prototype, "icon", void 0);
class ColorsDto {
}
__decorate([
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ColorsDto.prototype, "primary", void 0);
__decorate([
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ColorsDto.prototype, "secondary", void 0);
__decorate([
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ColorsDto.prototype, "accent", void 0);
__decorate([
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ColorsDto.prototype, "background", void 0);
__decorate([
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ColorsDto.prototype, "text", void 0);
__decorate([
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ColorsDto.prototype, "textLight", void 0);
__decorate([
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ColorsDto.prototype, "border", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ColorsDto.prototype, "success", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ColorsDto.prototype, "warning", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], ColorsDto.prototype, "error", void 0);
class TypographyDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TypographyDto.prototype, "fontFamily", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(8),
    (0, class_validator_1.Max)(96),
    __metadata("design:type", Number)
], TypographyDto.prototype, "headingSize", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(8),
    (0, class_validator_1.Max)(48),
    __metadata("design:type", Number)
], TypographyDto.prototype, "bodySize", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(100),
    (0, class_validator_1.Max)(900),
    __metadata("design:type", Number)
], TypographyDto.prototype, "headingWeight", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(100),
    (0, class_validator_1.Max)(900),
    __metadata("design:type", Number)
], TypographyDto.prototype, "bodyWeight", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(3),
    __metadata("design:type", Number)
], TypographyDto.prototype, "lineHeight", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TypographyDto.prototype, "letterSpacing", void 0);
class LayoutDto {
}
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(200),
    (0, class_validator_1.Max)(1400),
    __metadata("design:type", Number)
], LayoutDto.prototype, "maxWidth", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], LayoutDto.prototype, "padding", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], LayoutDto.prototype, "gap", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['center', 'left', 'right']),
    __metadata("design:type", String)
], LayoutDto.prototype, "alignment", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], LayoutDto.prototype, "borderRadius", void 0);
class BordersDto {
}
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], BordersDto.prototype, "radius", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], BordersDto.prototype, "width", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['solid', 'dashed', 'dotted']),
    __metadata("design:type", String)
], BordersDto.prototype, "style", void 0);
__decorate([
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], BordersDto.prototype, "color", void 0);
class EffectsDto {
}
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], EffectsDto.prototype, "shadowEnabled", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['light', 'medium', 'heavy']),
    __metadata("design:type", String)
], EffectsDto.prototype, "shadowIntensity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], EffectsDto.prototype, "shadowColor", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1000),
    __metadata("design:type", Number)
], EffectsDto.prototype, "transitionDuration", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(2),
    __metadata("design:type", Number)
], EffectsDto.prototype, "hoverScale", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EffectsDto.prototype, "borderAnimation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], EffectsDto.prototype, "fadeInOnLoad", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], EffectsDto.prototype, "parallaxEnabled", void 0);
class ComponentsDto {
}
__decorate([
    (0, class_validator_1.IsIn)(['flat', 'elevated', 'outlined']),
    __metadata("design:type", String)
], ComponentsDto.prototype, "cardStyle", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['flat', 'elevated', 'outlined']),
    __metadata("design:type", String)
], ComponentsDto.prototype, "buttonStyle", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['circle', 'square', 'rounded']),
    __metadata("design:type", String)
], ComponentsDto.prototype, "avatarShape", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['minimal', 'bold', 'gradient']),
    __metadata("design:type", String)
], ComponentsDto.prototype, "headerStyle", void 0);
class CreateThemeDto {
}
exports.CreateThemeDto = CreateThemeDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "pageId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "displayName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "description_text", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "industry", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SocialLinkDto),
    __metadata("design:type", Array)
], CreateThemeDto.prototype, "socialLinks", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "avatar", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ColorsDto),
    __metadata("design:type", ColorsDto)
], CreateThemeDto.prototype, "colors", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => TypographyDto),
    __metadata("design:type", TypographyDto)
], CreateThemeDto.prototype, "typography", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => LayoutDto),
    __metadata("design:type", LayoutDto)
], CreateThemeDto.prototype, "layout", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => BordersDto),
    __metadata("design:type", BordersDto)
], CreateThemeDto.prototype, "borders", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => EffectsDto),
    __metadata("design:type", EffectsDto)
], CreateThemeDto.prototype, "effects", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ComponentsDto),
    __metadata("design:type", ComponentsDto)
], CreateThemeDto.prototype, "components", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "customCss", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "tone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateThemeDto.prototype, "preferredStyle", void 0);
class UpdateThemeDto {
}
exports.UpdateThemeDto = UpdateThemeDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ColorsDto),
    __metadata("design:type", Object)
], UpdateThemeDto.prototype, "colors", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => TypographyDto),
    __metadata("design:type", Object)
], UpdateThemeDto.prototype, "typography", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => LayoutDto),
    __metadata("design:type", Object)
], UpdateThemeDto.prototype, "layout", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => BordersDto),
    __metadata("design:type", Object)
], UpdateThemeDto.prototype, "borders", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => EffectsDto),
    __metadata("design:type", Object)
], UpdateThemeDto.prototype, "effects", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ComponentsDto),
    __metadata("design:type", Object)
], UpdateThemeDto.prototype, "components", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "customCss", void 0);
class GenerateThemeDto {
}
exports.GenerateThemeDto = GenerateThemeDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateThemeDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateThemeDto.prototype, "displayName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateThemeDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateThemeDto.prototype, "industry", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SocialLinkDto),
    __metadata("design:type", Array)
], GenerateThemeDto.prototype, "socialLinks", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateThemeDto.prototype, "tone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateThemeDto.prototype, "preferredStyle", void 0);
