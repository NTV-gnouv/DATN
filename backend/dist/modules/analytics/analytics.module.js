"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsModule = void 0;
const common_1 = require("@nestjs/common");
const contact_forms_module_1 = require("../contact-forms/contact-forms.module");
const pages_module_1 = require("../pages/pages.module");
const analytics_controller_1 = require("./analytics.controller");
const analytics_repository_1 = require("./analytics.repository");
const analytics_service_1 = require("./analytics.service");
const page_views_repository_1 = require("./page-views.repository");
const page_views_service_1 = require("./page-views.service");
const platform_insights_chat_service_1 = require("./platform-insights-chat.service");
const platform_insights_context_service_1 = require("./platform-insights-context.service");
let AnalyticsModule = class AnalyticsModule {
};
exports.AnalyticsModule = AnalyticsModule;
exports.AnalyticsModule = AnalyticsModule = __decorate([
    (0, common_1.Module)({
        imports: [pages_module_1.PagesModule, contact_forms_module_1.ContactFormsModule],
        controllers: [analytics_controller_1.AnalyticsController],
        providers: [
            analytics_service_1.AnalyticsService,
            analytics_repository_1.AnalyticsRepository,
            page_views_service_1.PageViewsService,
            page_views_repository_1.PageViewsRepository,
            platform_insights_context_service_1.PlatformInsightsContextService,
            platform_insights_chat_service_1.PlatformInsightsChatService,
        ],
        exports: [page_views_service_1.PageViewsService, platform_insights_chat_service_1.PlatformInsightsChatService],
    })
], AnalyticsModule);
