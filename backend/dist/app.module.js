"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_module_1 = require("./core/core.module");
const shared_module_1 = require("./shared/shared.module");
const admin_module_1 = require("./modules/admin/admin.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const auth_module_1 = require("./modules/auth/auth.module");
const blocks_module_1 = require("./modules/blocks/blocks.module");
const contact_forms_module_1 = require("./modules/contact-forms/contact-forms.module");
const link_preview_module_1 = require("./modules/link-preview/link-preview.module");
const social_profiles_module_1 = require("./modules/social-profiles/social-profiles.module");
const media_module_1 = require("./modules/media/media.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const pages_module_1 = require("./modules/pages/pages.module");
const plugins_module_1 = require("./modules/plugins/plugins.module");
const themes_module_1 = require("./modules/themes/themes.module");
const onboarding_module_1 = require("./modules/onboarding/onboarding.module");
const ai_module_1 = require("./modules/ai/ai.module");
const users_module_1 = require("./modules/users/users.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            shared_module_1.SharedModule,
            core_module_1.CoreModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            pages_module_1.PagesModule,
            blocks_module_1.BlocksModule,
            contact_forms_module_1.ContactFormsModule,
            link_preview_module_1.LinkPreviewModule,
            social_profiles_module_1.SocialProfilesModule,
            themes_module_1.ThemesModule,
            onboarding_module_1.OnboardingModule,
            plugins_module_1.PluginsModule,
            media_module_1.MediaModule,
            notifications_module_1.NotificationsModule,
            analytics_module_1.AnalyticsModule,
            ai_module_1.AiModule,
            admin_module_1.AdminModule,
        ],
    })
], AppModule);
