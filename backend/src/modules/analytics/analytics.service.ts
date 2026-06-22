import { Injectable } from '@nestjs/common';

import { AnalyticsRepository } from './analytics.repository';

@Injectable()
export class AnalyticsService {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  list() {
    return this.analyticsRepository.list();
  }

  get(id: string) {
    return this.analyticsRepository.get(id);
  }

  create(payload: Record<string, unknown>) {
    return this.analyticsRepository.create(payload);
  }

  update(id: string, payload: Record<string, unknown>) {
    return this.analyticsRepository.update(id, payload);
  }
}
