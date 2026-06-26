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
exports.PagesService = void 0;
const common_1 = require("@nestjs/common");
const page_ownership_util_1 = require("./page-ownership.util");
const pages_repository_1 = require("./pages.repository");
let PagesService = class PagesService {
    constructor(pagesRepository) {
        this.pagesRepository = pagesRepository;
    }
    async create(payload) {
        return this.pagesRepository.create(payload);
    }
    checkSlug(slug, excludeId) {
        return this.pagesRepository.isSlugAvailable(slug, excludeId).then((available) => ({ slug, available }));
    }
    checkUsername(username, excludeId) {
        return this.pagesRepository
            .isUsernameAvailable(username, excludeId)
            .then((available) => ({ username, available }));
    }
    suggestDomain(ownerId, base) {
        return this.pagesRepository.suggestUniqueSlug(base ?? 'creator', ownerId);
    }
    getBySlug(slug) {
        return this.pagesRepository.getBySlug(slug);
    }
    getByUsername(username) {
        return this.pagesRepository.getByUsername(username);
    }
    createTemplate(payload) {
        return this.pagesRepository.createTemplate(payload);
    }
    listForOwner(ownerId) {
        return this.pagesRepository.findByOwnerId(ownerId).then((page) => (page ? [page] : []));
    }
    getMyPage(ownerId) {
        return this.pagesRepository.findByOwnerId(ownerId);
    }
    get(id) {
        return this.pagesRepository.get(id);
    }
    getOwned(id, ownerId) {
        return this.pagesRepository.getOwned(id, ownerId);
    }
    async update(id, payload, ownerId) {
        if (ownerId) {
            const current = await this.pagesRepository.getOwned(id, ownerId);
            const nextOwnerId = payload.ownerId ? String(payload.ownerId) : undefined;
            if (nextOwnerId && nextOwnerId !== ownerId) {
                throw new common_1.ForbiddenException('Không thể chuyển quyền sở hữu trang.');
            }
            return this.pagesRepository.update(String(current.id), {
                ...payload,
                ownerId,
            });
        }
        return this.pagesRepository.update(id, payload);
    }
    async updateSlug(id, slug, ownerId) {
        if (ownerId) {
            await this.pagesRepository.getOwned(id, ownerId);
        }
        return this.pagesRepository.updateSlug(id, slug);
    }
    updateSlugByUsername(username, slug, ownerId) {
        return this.pagesRepository.updateSlugByUsername(username, slug, ownerId);
    }
    findForAccount(user) {
        return this.pagesRepository.findForAccount(user);
    }
    findByOwnerId(ownerId) {
        return this.pagesRepository.findByOwnerId(ownerId);
    }
    async getEditorConfig(id, ownerId) {
        if (ownerId) {
            await this.pagesRepository.getOwned(id, ownerId);
        }
        return this.pagesRepository.getEditorConfig(id);
    }
    async updateEditorConfig(id, payload, ownerId) {
        if (ownerId) {
            await this.pagesRepository.getOwned(id, ownerId);
        }
        return this.pagesRepository.updateEditorConfig(id, payload);
    }
    async remove(id, ownerId) {
        if (ownerId) {
            await this.pagesRepository.getOwned(id, ownerId);
        }
        return this.pagesRepository.remove(id);
    }
    assertPageOwnedBy(page, ownerId) {
        if (!(0, page_ownership_util_1.isPageOwnedBy)(page, ownerId)) {
            throw new common_1.ForbiddenException('Bạn không có quyền truy cập trang này.');
        }
        return page;
    }
};
exports.PagesService = PagesService;
exports.PagesService = PagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [pages_repository_1.PagesRepository])
], PagesService);
