import type { ContactFormField } from '@/services/contact-forms.service';

export type ContactFormPageBlock = {
  type: 'contact-form';
  id?: string;
  visible?: boolean;
  formId: string;
  title?: string;
  submitLabel?: string;
  successMessage?: string;
  showFieldLabels?: boolean;
  fields?: ContactFormField[];
};

export function isContactFormPageBlock(block: unknown): block is ContactFormPageBlock {
  return (
    typeof block === 'object' &&
    block !== null &&
    String((block as Record<string, unknown>).type ?? '') === 'contact-form' &&
    typeof (block as Record<string, unknown>).formId === 'string'
  );
}

export function resolveShowFieldLabels(block: Pick<ContactFormPageBlock, 'showFieldLabels'> | null | undefined): boolean {
  return block?.showFieldLabels === true;
}
