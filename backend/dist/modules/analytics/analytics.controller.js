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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../../shared/decorators/public.decorator");
const analytics_service_1 = require("./analytics.service");
const page_views_service_1 = require("./page-views.service");
const platform_insights_chat_service_1 = require("./platform-insights-chat.service");
let AnalyticsController = class AnalyticsController {
    constructor(analyticsService, pageViewsService, platformInsightsChatService) {
        this.analyticsService = analyticsService;
        this.pageViewsService = pageViewsService;
        this.platformInsightsChatService = platformInsightsChatService;
    }
    trackPageView(body, request) {
        const userAgent = String(request.headers['user-agent'] ?? '');
        const referrerHeader = request.headers.referer ?? request.headers.referrer;
        const referrer = Array.isArray(referrerHeader) ? referrerHeader[0] ?? '' : String(referrerHeader ?? '');
        return this.pageViewsService.recordView({
            pageId: String(body.pageId ?? ''),
            slug: String(body.slug ?? ''),
            userAgent,
            referrer,
            clientIp: request.ip ?? '',
            countryCodeHint: body.countryCode,
            headers: request.headers,
        });
    }
    getPageViewsOverview(pageId, slug, startDate, endDate, granularity) {
        const resolvedGranularity = granularity === 'hour' ? 'hour' : 'day';
        return this.pageViewsService.getOverview(pageId, slug, startDate, endDate, resolvedGranularity);
    }
    chatPlatformInsights(body) {
        const granularityRaw = String(body.granularity ?? 'day');
        const granularity = granularityRaw === 'hour' || granularityRaw === 'week' || granularityRaw === 'month'
            ? granularityRaw
            : 'day';
        return this.platformInsightsChatService.chat({
            pageId: String(body.pageId ?? ''),
            slug: body.slug ? String(body.slug) : undefined,
            startDate: body.startDate ? String(body.startDate) : undefined,
            endDate: body.endDate ? String(body.endDate) : undefined,
            granularity,
            messages: Array.isArray(body.messages)
                ? body.messages
                    .map((item) => {
                    const record = item;
                    const role = String(record.role ?? '') === 'assistant' ? 'assistant' : 'user';
                    return {
                        role: role,
                        content: String(record.content ?? '').trim(),
                    };
                })
                    .filter((item) => item.content)
                : [],
        });
    }
    list() {
        return this.analyticsService.list();
    }
    get(id) {
        return this.analyticsService.get(id);
    }
    create(body) {
        return this.analyticsService.create(body);
    }
    update(id, body) {
        return this.analyticsService.update(id, body);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Post)('page-views'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Track page view', description: 'Record a landing page view event.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "trackPageView", null);
__decorate([
    (0, common_1.Get)('page-views/overview'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Page analytics overview', description: 'Aggregated views by date, country and device.' }),
    __param(0, (0, common_1.Query)('pageId')),
    __param(1, (0, common_1.Query)('slug')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __param(4, (0, common_1.Query)('granularity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getPageViewsOverview", null);
__decorate([
    (0, common_1.Post)('insights/chat'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Platform insights chat',
        description: 'Grounded analytics chat for landing page performance and conversion.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "chatPlatformInsights", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List analytics records', description: 'Return analytics entries or aggregated metrics.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get analytics record', description: 'Return a single analytics record by ID.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create analytics record', description: 'Store a new analytics event or snapshot.' }),
    (0, swagger_1.ApiBody)({ description: 'Analytics payload' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update analytics record', description: 'Update an analytics record by ID.' }),
    (0, swagger_1.ApiBody)({ description: 'Analytics update payload' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "update", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, swagger_1.ApiTags)('Analytics'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('analytics'),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService,
        page_views_service_1.PageViewsService,
        platform_insights_chat_service_1.PlatformInsightsChatService])
], AnalyticsController);
