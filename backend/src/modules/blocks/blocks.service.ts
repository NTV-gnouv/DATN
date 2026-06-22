import { Injectable } from '@nestjs/common';

import { BlocksRepository } from './blocks.repository';

@Injectable()
export class BlocksService {
  constructor(private readonly blocksRepository: BlocksRepository) {}

  list() {
    return this.blocksRepository.list();
  }

  get(id: string) {
    return this.blocksRepository.get(id);
  }

  getDefaultId() {
    return this.blocksRepository.getDefaultId();
  }

  getDefaultHeaderBlock() {
    return this.blocksRepository.getDefaultHeaderBlock();
  }

  create(payload: Record<string, unknown>) {
    return this.blocksRepository.create(payload);
  }

  importDefinition(payload: Record<string, unknown>) {
    return this.blocksRepository.importDefinition(payload);
  }

  update(id: string, payload: Record<string, unknown>) {
    return this.blocksRepository.update(id, payload);
  }
}
