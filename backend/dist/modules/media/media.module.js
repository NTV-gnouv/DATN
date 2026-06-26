"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaModule = void 0;
const common_1 = require("@nestjs/common");
const media_controller_1 = require("./media.controller");
const media_repository_1 = require("./media.repository");
const media_service_1 = require("./media.service");
const image_processor_service_1 = require("./processors/image-processor.service");
const storage_service_1 = require("./processors/storage.service");
let MediaModule = class MediaModule {
};
exports.MediaModule = MediaModule;
exports.MediaModule = MediaModule = __decorate([
    (0, common_1.Module)({
        controllers: [media_controller_1.MediaController],
        providers: [media_service_1.MediaService, media_repository_1.MediaRepository, image_processor_service_1.ImageProcessorService, storage_service_1.StorageService],
        exports: [media_service_1.MediaService, image_processor_service_1.ImageProcessorService, storage_service_1.StorageService],
    })
], MediaModule);
