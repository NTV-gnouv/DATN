import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalyticsRepository {
  async list() {
    return [];
  }

  async get(id: string) {
    return { id };
  }

  async create(payload: Record<string, unknown>) {
    return { id: 'analytics-1', ...payload };
  }

  async update(id: string, payload: Record<string, unknown>) {
    return { id, ...payload };
  }
}
