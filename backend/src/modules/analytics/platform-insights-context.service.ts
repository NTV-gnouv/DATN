import { Injectable, NotFoundException } from '@nestjs/common';

import { ContactFormsService } from '@/modules/contact-forms/contact-forms.service';
import { PagesService } from '@/modules/pages/pages.service';

import type { PlatformInsightsContext } from './platform-insights.types';
import { PageViewsService } from './page-views.service';

function readBlockLabel(block: Record<string, unknown>): string {
  const candidates = [block.title, block.label, block.headline, block.type];
  for (const candidate of candidates) {
    const value = String(candidate ?? '').trim();
    if (value) {
      return value;
    }
  }
  return String(block.type ?? 'block');
}

function extractContactFormIds(blocks: unknown[]): string[] {
  const ids = new Set<string>();
  for (const raw of blocks) {
    if (!raw || typeof raw !== 'object') {
      continue;
    }
    const block = raw as Record<string, unknown>;
    if (String(block.type ?? '') !== 'contact-form') {
      continue;
    }
    const formId = String(block.formId ?? '').trim();
    if (formId) {
      ids.add(formId);
    }
  }
  return Array.from(ids);
}

@Injectable()
export class PlatformInsightsContextService {
  constructor(
    private readonly pagesService: PagesService,
    private readonly pageViewsService: PageViewsService,
    private readonly contactFormsService: ContactFormsService,
  ) {}

  async buildContext(input: {
    pageId: string;
    slug?: string;
    startDate?: string;
    endDate?: string;
    granularity?: 'hour' | 'day' | 'week' | 'month';
  }): Promise<PlatformInsightsContext> {
    const page = await this.pagesService.get(input.pageId);
    if (!page) {
      throw new NotFoundException('Không tìm thấy landing page.');
    }

    const pageRecord = page as Record<string, unknown>;
    const blocks = Array.isArray(pageRecord.blocks) ? pageRecord.blocks : [];
    const slug = String(input.slug ?? pageRecord.slug ?? pageRecord.title ?? '').trim();
    const overview = await this.pageViewsService.getOverview(
      input.pageId,
      slug,
      input.startDate,
      input.endDate,
      input.granularity ?? 'day',
    );

    const formIds = extractContactFormIds(blocks);
    const forms = [];
    const recentSubmissions = [];
    let totalSubmissions = 0;

    for (const formId of formIds) {
      try {
        const form = await this.contactFormsService.getForm(formId);
        const submissions = await this.contactFormsService.listSubmissions(formId);
        totalSubmissions += submissions.length;
        forms.push({
          formId,
          name: form.name,
          fieldCount: form.fields.length,
          submissionCount: submissions.length,
        });
        for (const submission of submissions.slice(0, 5)) {
          recentSubmissions.push({
            formId,
            submittedAt: submission.metadata.submittedAt,
            fields: submission.payload,
          });
        }
      } catch {
        // skip missing forms
      }
    }

    const totalViews = overview.totalViews;
    const viewsToSubmissionRate =
      totalViews > 0 && totalSubmissions > 0 ? Number(((totalSubmissions / totalViews) * 100).toFixed(2)) : null;

    return {
      platform: {
        name: 'ShotVN',
        description: 'Nền tảng tạo landing page Link in Bio với block nội dung, form liên hệ và analytics.',
      },
      landingPage: {
        id: input.pageId,
        slug,
        title: String(pageRecord.title ?? slug),
        status: String(pageRecord.status ?? 'unknown'),
        blockSummary: blocks
          .filter((item) => item && typeof item === 'object')
          .map((item) => {
            const block = item as Record<string, unknown>;
            return {
              type: String(block.type ?? 'unknown'),
              visible: block.visible !== false,
              label: readBlockLabel(block),
            };
          }),
      },
      dateRange: {
        startDate: overview.startDate,
        endDate: overview.endDate,
        granularity: overview.seriesGranularity,
      },
      pageViews: {
        totalViews: overview.totalViews,
        seriesGranularity: overview.seriesGranularity,
        series: overview.series,
        countries: overview.countries.map((row) => ({ label: row.label, views: row.views })),
        devices: overview.devices.map((row) => ({ label: row.label, views: row.views })),
      },
      contactForms: {
        formCount: forms.length,
        totalSubmissions,
        forms,
        recentSubmissions: recentSubmissions.slice(0, 10),
      },
      conversionHints: {
        viewsToSubmissionRate,
        hasContactForm: forms.length > 0,
      },
    };
  }
}
