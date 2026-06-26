import { ForbiddenException, Injectable } from '@nestjs/common';

import { isPageOwnedBy } from './page-ownership.util';
import { PagesRepository } from './pages.repository';

@Injectable()
export class PagesService {
  constructor(private readonly pagesRepository: PagesRepository) {}

  async create(payload: Record<string, unknown>) {
    return this.pagesRepository.create(payload);
  }

  checkSlug(slug: string, excludeId?: string) {
    return this.pagesRepository.isSlugAvailable(slug, excludeId).then((available) => ({ slug, available }));
  }

  checkUsername(username: string, excludeId?: string) {
    return this.pagesRepository
      .isUsernameAvailable(username, excludeId)
      .then((available) => ({ username, available }));
  }

  suggestDomain(ownerId: string, base?: string) {
    return this.pagesRepository.suggestUniqueSlug(base ?? 'creator', ownerId);
  }

  getBySlug(slug: string) {
    return this.pagesRepository.getBySlug(slug);
  }

  getByUsername(username: string) {
    return this.pagesRepository.getByUsername(username);
  }

  createTemplate(payload: Record<string, unknown>) {
    return this.pagesRepository.createTemplate(payload);
  }

  listForOwner(ownerId: string) {
    return this.pagesRepository.findByOwnerId(ownerId).then((page) => (page ? [page] : []));
  }

  getMyPage(ownerId: string) {
    return this.pagesRepository.findByOwnerId(ownerId);
  }

  get(id: string) {
    return this.pagesRepository.get(id);
  }

  getOwned(id: string, ownerId: string) {
    return this.pagesRepository.getOwned(id, ownerId);
  }

  async update(id: string, payload: Record<string, unknown>, ownerId?: string) {
    if (ownerId) {
      const current = await this.pagesRepository.getOwned(id, ownerId);
      const nextOwnerId = payload.ownerId ? String(payload.ownerId) : undefined;
      if (nextOwnerId && nextOwnerId !== ownerId) {
        throw new ForbiddenException('Không thể chuyển quyền sở hữu trang.');
      }
      return this.pagesRepository.update(String(current.id), {
        ...payload,
        ownerId,
      });
    }
    return this.pagesRepository.update(id, payload);
  }

  async updateSlug(id: string, slug: string, ownerId?: string) {
    if (ownerId) {
      await this.pagesRepository.getOwned(id, ownerId);
    }
    return this.pagesRepository.updateSlug(id, slug);
  }

  updateSlugByUsername(username: string, slug: string, ownerId: string) {
    return this.pagesRepository.updateSlugByUsername(username, slug, ownerId);
  }

  findForAccount(user: { id?: string; name: string; email: string }) {
    return this.pagesRepository.findForAccount(user);
  }

  findByOwnerId(ownerId: string) {
    return this.pagesRepository.findByOwnerId(ownerId);
  }

  async getEditorConfig(id: string, ownerId?: string) {
    if (ownerId) {
      await this.pagesRepository.getOwned(id, ownerId);
    }
    return this.pagesRepository.getEditorConfig(id);
  }

  async updateEditorConfig(id: string, payload: Record<string, unknown>, ownerId?: string) {
    if (ownerId) {
      await this.pagesRepository.getOwned(id, ownerId);
    }
    return this.pagesRepository.updateEditorConfig(id, payload);
  }

  async remove(id: string, ownerId?: string) {
    if (ownerId) {
      await this.pagesRepository.getOwned(id, ownerId);
    }
    return this.pagesRepository.remove(id);
  }

  assertPageOwnedBy(page: Record<string, unknown> | null | undefined, ownerId: string) {
    if (!isPageOwnedBy(page, ownerId)) {
      throw new ForbiddenException('Bạn không có quyền truy cập trang này.');
    }
    return page;
  }
}
