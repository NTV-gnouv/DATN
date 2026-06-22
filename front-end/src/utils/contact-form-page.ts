import type { LandingPage } from '@/models/page.model';

export function getContactFormIdFromPage(page: LandingPage | null | undefined) {
  const block = (page?.blocks ?? []).find((item) => String(item.type ?? '') === 'contact-form');
  const formId = (block as { formId?: unknown } | undefined)?.formId;
  return typeof formId === 'string' ? formId : '';
}
