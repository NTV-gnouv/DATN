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
exports.ContactFormsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../../shared/decorators/public.decorator");
const contact_forms_service_1 = require("./contact-forms.service");
let ContactFormsController = class ContactFormsController {
    constructor(service) {
        this.service = service;
    }
    listForms() {
        return this.service.listForms();
    }
    listSubmissions(formId) {
        return this.service.listSubmissions(formId);
    }
    clearSubmissions(formId) {
        return this.service.clearSubmissions(formId);
    }
    getSubmission(id) {
        return this.service.getSubmission(id);
    }
    deleteSubmission(id) {
        return this.service.deleteSubmission(id);
    }
    getForm(id) {
        return this.service.getForm(id);
    }
    createForm(body) {
        return this.service.createForm(body);
    }
    updateForm(id, body) {
        return this.service.updateForm(id, body);
    }
    submit(id, body, request) {
        const ip = request.ip ?? '';
        const userAgent = request.headers['user-agent'] ?? '';
        const pageUrlHeader = request.headers['x-page-url'];
        const pageUrl = Array.isArray(pageUrlHeader) ? pageUrlHeader[0] ?? '' : pageUrlHeader ?? '';
        return this.service.submitForm(id, body, {
            ip: String(ip),
            userAgent: String(userAgent),
            pageUrl: String(pageUrl),
        });
    }
};
exports.ContactFormsController = ContactFormsController;
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'List forms', description: 'Return all contact forms for admin management.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContactFormsController.prototype, "listForms", null);
__decorate([
    (0, common_1.Get)('submissions/all'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'List submissions', description: 'Admin endpoint to list all submissions, optionally filtered by form.' }),
    __param(0, (0, common_1.Query)('formId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContactFormsController.prototype, "listSubmissions", null);
__decorate([
    (0, common_1.Delete)('submissions/all'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Clear submissions', description: 'Delete all submissions for a form.' }),
    __param(0, (0, common_1.Query)('formId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContactFormsController.prototype, "clearSubmissions", null);
__decorate([
    (0, common_1.Get)('submissions/:id'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get submission', description: 'Admin endpoint to get one submission detail.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContactFormsController.prototype, "getSubmission", null);
__decorate([
    (0, common_1.Delete)('submissions/:id'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete submission', description: 'Delete one form submission record.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContactFormsController.prototype, "deleteSubmission", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get form', description: 'Return one contact form definition.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContactFormsController.prototype, "getForm", null);
__decorate([
    (0, common_1.Post)(),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create form', description: 'Create a new contact form with dynamic field schema.' }),
    (0, swagger_1.ApiBody)({ description: 'Contact form payload' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContactFormsController.prototype, "createForm", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update form', description: 'Update contact form metadata or fields.' }),
    (0, swagger_1.ApiBody)({ description: 'Contact form update payload' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ContactFormsController.prototype, "updateForm", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Submit form', description: 'Public endpoint for end users to submit a contact form.' }),
    (0, swagger_1.ApiBody)({ description: 'Form submission payload where keys match field ids.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], ContactFormsController.prototype, "submit", null);
exports.ContactFormsController = ContactFormsController = __decorate([
    (0, swagger_1.ApiTags)('Contact Forms'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('contact-forms'),
    __metadata("design:paramtypes", [contact_forms_service_1.ContactFormsService])
], ContactFormsController);
