import { Injectable } from '@nestjs/common';

import { AdminRepository } from './admin.repository';

@Injectable()
export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  list() {
    return this.adminRepository.list();
  }

  get(id: string) {
    return this.adminRepository.get(id);
  }

  create(payload: Record<string, unknown>) {
    return this.adminRepository.create(payload);
  }

  update(id: string, payload: Record<string, unknown>) {
    return this.adminRepository.update(id, payload);
  }
}
