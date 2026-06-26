"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactFormsModule = void 0;
const common_1 = require("@nestjs/common");
const contact_forms_controller_1 = require("./contact-forms.controller");
const contact_forms_repository_1 = require("./contact-forms.repository");
const contact_forms_service_1 = require("./contact-forms.service");
let ContactFormsModule = class ContactFormsModule {
};
exports.ContactFormsModule = ContactFormsModule;
exports.ContactFormsModule = ContactFormsModule = __decorate([
    (0, common_1.Module)({
        controllers: [contact_forms_controller_1.ContactFormsController],
        providers: [contact_forms_service_1.ContactFormsService, contact_forms_repository_1.ContactFormsRepository],
        exports: [contact_forms_service_1.ContactFormsService],
    })
], ContactFormsModule);
