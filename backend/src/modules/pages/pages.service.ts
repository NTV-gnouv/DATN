import { Injectable } from '@nestjs/common';

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

  getBySlug(slug: string) {
    return this.pagesRepository.getBySlug(slug);
  }

  getByUsername(username: string) {
    return this.pagesRepository.getByUsername(username);
  }

  createTemplate(payload: Record<string, unknown>) {
    return this.pagesRepository.createTemplate(payload);
  }

  list() {
    return this.pagesRepository.list();
  }

  get(id: string) {
    return this.pagesRepository.get(id);
  }

  update(id: string, payload: Record<string, unknown>) {
    return this.pagesRepository.update(id, payload);
  }

  updateSlug(id: string, slug: string) {
    return this.pagesRepository.updateSlug(id, slug);
  }

  updateSlugByUsername(username: string, slug: string) {
    return this.pagesRepository.updateSlugByUsername(username, slug);
  }

  findForAccount(user: { id?: string; name: string; email: string }) {
    return this.pagesRepository.findForAccount(user);
  }

  getEditorConfig(id: string) {
    return this.pagesRepository.getEditorConfig(id);
  }

  updateEditorConfig(id: string, payload: Record<string, unknown>) {
    return this.pagesRepository.updateEditorConfig(id, payload);
  }

  remove(id: string) {
    return this.pagesRepository.remove(id);
  }
}
