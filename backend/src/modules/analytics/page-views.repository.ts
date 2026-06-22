import { Injectable } from '@nestjs/common';

import { DatabaseService } from '@/core/database/database.service';

import type { PageViewEvent } from './page-views.types';

@Injectable()
export class PageViewsRepository {
  private readonly entityName = 'page-view-events';

  constructor(private readonly databaseService: DatabaseService) {}

  async save(event: PageViewEvent): Promise<PageViewEvent> {
    await this.databaseService.writeRecord(this.entityName, event.id, event as unknown as Record<string, unknown>);
    return event;
  }

  async listByPageId(pageId: string): Promise<PageViewEvent[]> {
    const records = await this.databaseService.readEntity(this.entityName);
    return records
      .map((record) => record.data as PageViewEvent)
      .filter((event) => event.pageId === pageId);
  }
}
