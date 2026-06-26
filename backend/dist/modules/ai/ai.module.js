"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const blocks_module_1 = require("../blocks/blocks.module");
const contact_forms_module_1 = require("../contact-forms/contact-forms.module");
const media_module_1 = require("../media/media.module");
const pages_module_1 = require("../pages/pages.module");
const social_profiles_module_1 = require("../social-profiles/social-profiles.module");
const ai_background_controller_1 = require("./ai-background.controller");
const ai_background_service_1 = require("./ai-background.service");
const ai_chat_controller_1 = require("./ai-chat.controller");
const ai_chat_repository_1 = require("./ai-chat.repository");
const ai_chat_service_1 = require("./ai-chat.service");
const brand_profile_service_1 = require("./brand-profile.service");
const landing_builder_service_1 = require("./landing-builder.service");
const unsplash_service_1 = require("./unsplash.service");
const ux_design_service_1 = require("./ux-design.service");
let AiModule = class AiModule {
};
exports.AiModule = AiModule;
exports.AiModule = AiModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule, media_module_1.MediaModule, pages_module_1.PagesModule, contact_forms_module_1.ContactFormsModule, blocks_module_1.BlocksModule, social_profiles_module_1.SocialProfilesModule],
        controllers: [ai_background_controller_1.AiBackgroundController, ai_chat_controller_1.AiChatController],
        providers: [
            ai_background_service_1.AiBackgroundService,
            ai_chat_repository_1.AiChatRepository,
            ai_chat_service_1.AiChatService,
            brand_profile_service_1.BrandProfileService,
            landing_builder_service_1.LandingBuilderService,
            unsplash_service_1.UnsplashService,
            ux_design_service_1.UxDesignService,
        ],
        exports: [ai_background_service_1.AiBackgroundService, ai_chat_service_1.AiChatService, brand_profile_service_1.BrandProfileService, ux_design_service_1.UxDesignService],
    })
], AiModule);
