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
exports.ApplyAiChatDto = exports.SendAiChatMessageDto = exports.StartAiChatDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class StartAiChatDto {
}
exports.StartAiChatDto = StartAiChatDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'p-demo' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], StartAiChatDto.prototype, "pageId", void 0);
class SendAiChatMessageDto {
}
exports.SendAiChatMessageDto = SendAiChatMessageDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ai-chat-abc123' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SendAiChatMessageDto.prototype, "sessionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Tôi là Thanh Vương' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SendAiChatMessageDto.prototype, "message", void 0);
class ApplyAiChatDto {
}
exports.ApplyAiChatDto = ApplyAiChatDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ai-chat-abc123' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ApplyAiChatDto.prototype, "sessionId", void 0);
