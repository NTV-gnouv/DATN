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
exports.LinkPreviewController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../../shared/decorators/public.decorator");
const link_preview_service_1 = require("./link-preview.service");
let LinkPreviewController = class LinkPreviewController {
    constructor(service) {
        this.service = service;
    }
    preview(body) {
        if (!body.url?.trim()) {
            throw new common_1.BadRequestException('URL là bắt buộc.');
        }
        return this.service.preview(body.url);
    }
};
exports.LinkPreviewController = LinkPreviewController;
__decorate([
    (0, common_1.Post)(),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Fetch link metadata', description: 'Extract title, description and thumbnail from a URL.' }),
    (0, swagger_1.ApiBody)({ schema: { properties: { url: { type: 'string' } } } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LinkPreviewController.prototype, "preview", null);
exports.LinkPreviewController = LinkPreviewController = __decorate([
    (0, swagger_1.ApiTags)('Link Preview'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('link-preview'),
    __metadata("design:paramtypes", [link_preview_service_1.LinkPreviewService])
], LinkPreviewController);
