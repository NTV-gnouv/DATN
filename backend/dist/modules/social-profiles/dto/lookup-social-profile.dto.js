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
exports.LookupSocialProfilesBatchDto = exports.LookupSocialProfileDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const PLATFORMS = ['instagram', 'tiktok', 'youtube', 'x'];
class LookupSocialProfileDto {
}
exports.LookupSocialProfileDto = LookupSocialProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: PLATFORMS, example: 'instagram' }),
    (0, class_validator_1.IsIn)(PLATFORMS),
    __metadata("design:type", String)
], LookupSocialProfileDto.prototype, "platform", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'nike', description: 'Username without @ prefix' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^[a-zA-Z0-9._-]{1,50}$/, {
        message: 'username chỉ được chứa chữ, số, dấu chấm, gạch dưới hoặc gạch ngang',
    }),
    __metadata("design:type", String)
], LookupSocialProfileDto.prototype, "username", void 0);
class LookupSocialProfilesBatchDto {
}
exports.LookupSocialProfilesBatchDto = LookupSocialProfilesBatchDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [LookupSocialProfileDto] }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => LookupSocialProfileDto),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ArrayMaxSize)(10),
    __metadata("design:type", Array)
], LookupSocialProfilesBatchDto.prototype, "profiles", void 0);
