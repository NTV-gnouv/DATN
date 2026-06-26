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
exports.PlatformInsightsContextService = void 0;
const common_1 = require("@nestjs/common");
const contact_forms_service_1 = require("../contact-forms/contact-forms.service");
const pages_service_1 = require("../pages/pages.service");
const page_views_service_1 = require("./page-views.service");
function readBlockLabel(block) {
    const candidates = [block.title, block.label, block.headline, block.type];
    for (const candidate of candidates) {
        const value = String(candidate ?? '').trim();
        if (value) {
            return value;
        }
    }
    return String(block.type ?? 'block');
}
function extractContactFormIds(blocks) {
    const ids = new Set();
    for (const raw of blocks) {
        if (!raw || typeof raw !== 'object') {
            continue;
        }
        const block = raw;
        if (String(block.type ?? '') !== 'contact-form') {
            continue;
        }
        const formId = String(block.formId ?? '').trim();
        if (formId) {
            ids.add(formId);
        }
    }
    return Array.from(ids);
}
let PlatformInsightsContextService = class PlatformInsightsContextService {
    constructor(pagesService, pageViewsService, contactFormsService) {
        this.pagesService = pagesService;
        this.pageViewsService = pageViewsService;
        this.contactFormsService = contactFormsService;
    }
    async buildContext(input) {
        const page = await this.pagesService.get(input.pageId);
        if (!page) {
            throw new common_1.NotFoundException('Không tìm thấy landing page.');
        }
        const pageRecord = page;
        const blocks = Array.isArray(pageRecord.blocks) ? pageRecord.blocks : [];
        const slug = String(input.slug ?? pageRecord.slug ?? pageRecord.title ?? '').trim();
        const overview = await this.pageViewsService.getOverview(input.pageId, slug, input.startDate, input.endDate, input.granularity ?? 'day');
        const formIds = extractContactFormIds(blocks);
        const forms = [];
        const recentSubmissions = [];
        let totalSubmissions = 0;
        for (const formId of formIds) {
            try {
                const form = await this.contactFormsService.getForm(formId);
                const submissions = await this.contactFormsService.listSubmissions(formId);
                totalSubmissions += submissions.length;
                forms.push({
                    formId,
                    name: form.name,
                    fieldCount: form.fields.length,
                    submissionCount: submissions.length,
                });
                for (const submission of submissions.slice(0, 5)) {
                    recentSubmissions.push({
                        formId,
                        submittedAt: submission.metadata.submittedAt,
                        fields: submission.payload,
                    });
                }
            }
            catch {
            }
        }
        const totalViews = overview.totalViews;
        const viewsToSubmissionRate = totalViews > 0 && totalSubmissions > 0 ? Number(((totalSubmissions / totalViews) * 100).toFixed(2)) : null;
        return {
            platform: {
                name: 'ShotVN',
                description: 'Nền tảng tạo landing page Link in Bio với block nội dung, form liên hệ và analytics.',
            },
            landingPage: {
                id: input.pageId,
                slug,
                title: String(pageRecord.title ?? slug),
                status: String(pageRecord.status ?? 'unknown'),
                blockSummary: blocks
                    .filter((item) => item && typeof item === 'object')
                    .map((item) => {
                    const block = item;
                    return {
                        type: String(block.type ?? 'unknown'),
                        visible: block.visible !== false,
                        label: readBlockLabel(block),
                    };
                }),
            },
            dateRange: {
                startDate: overview.startDate,
                endDate: overview.endDate,
                granularity: overview.seriesGranularity,
            },
            pageViews: {
                totalViews: overview.totalViews,
                seriesGranularity: overview.seriesGranularity,
                series: overview.series,
                countries: overview.countries.map((row) => ({ label: row.label, views: row.views })),
                devices: overview.devices.map((row) => ({ label: row.label, views: row.views })),
            },
            contactForms: {
                formCount: forms.length,
                totalSubmissions,
                forms,
                recentSubmissions: recentSubmissions.slice(0, 10),
            },
            conversionHints: {
                viewsToSubmissionRate,
                hasContactForm: forms.length > 0,
            },
        };
    }
};
exports.PlatformInsightsContextService = PlatformInsightsContextService;
exports.PlatformInsightsContextService = PlatformInsightsContextService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [pages_service_1.PagesService,
        page_views_service_1.PageViewsService,
        contact_forms_service_1.ContactFormsService])
], PlatformInsightsContextService);
