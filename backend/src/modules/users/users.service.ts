import { Injectable } from '@nestjs/common';

import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  getMe(userId: string) {
    return this.usersRepository.findById(userId);
  }

  updateMe(payload: Record<string, unknown>) {
    return this.usersRepository.update('current-user', payload);
  }

  deleteMe() {
    return this.usersRepository.softDelete('current-user');
  }

  getById(id: string) {
    return this.usersRepository.findById(id);
  }

  getAll() {
    return this.usersRepository.findAll();
  }
}
