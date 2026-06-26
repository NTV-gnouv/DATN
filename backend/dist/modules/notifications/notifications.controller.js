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
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const email_service_1 = require("./email.service");
let NotificationsController = class NotificationsController {
    constructor(emailService) {
        this.emailService = emailService;
    }
    listEmailLogs() {
        return this.emailService.listLogs();
    }
    sendWelcome(body) {
        return this.emailService.sendWelcomeEmail(body.to, body.name);
    }
    sendEmail(body) {
        return this.emailService.sendTransactionalEmail(body);
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Get)('email/logs'),
    (0, swagger_1.ApiOperation)({ summary: 'List email logs', description: 'Return transactional email delivery logs.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "listEmailLogs", null);
__decorate([
    (0, common_1.Post)('email/welcome'),
    (0, swagger_1.ApiOperation)({ summary: 'Send welcome email', description: 'Send a welcome email to a user.' }),
    (0, swagger_1.ApiBody)({ description: 'Email recipient and display name' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "sendWelcome", null);
__decorate([
    (0, common_1.Post)('email/send'),
    (0, swagger_1.ApiOperation)({ summary: 'Send transactional email', description: 'Send an arbitrary transactional email.' }),
    (0, swagger_1.ApiBody)({ description: 'Transactional email payload' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "sendEmail", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, swagger_1.ApiTags)('Notifications'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('notifications'),
    __metadata("design:paramtypes", [email_service_1.EmailService])
], NotificationsController);
