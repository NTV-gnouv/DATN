import type { FormEvent } from 'react';

import type { ContactFormField, ContactFormRecord } from '@/services/contact-forms.service';
import { ApiRequestError } from '@/services/api';
import type { LandingPage } from '@/models/page.model';

function escapeFieldName(fieldId: string): string {
  return typeof CSS !== 'undefined' && typeof CSS.escape === 'function' ? CSS.escape(fieldId) : fieldId;
}

function readScalarFromForm(form: HTMLFormElement, fieldId: string): string {
  const escaped = escapeFieldName(fieldId);
  const selector = `[data-contact-field="${escaped}"], input[name="${escaped}"], textarea[name="${escaped}"], select[name="${escaped}"]`;
  const controls = form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(selector);

  for (const control of controls) {
    if (control instanceof HTMLInputElement) {
      if (control.type === 'checkbox' || control.type === 'file') {
        continue;
      }
      if (control.type === 'radio') {
        if (control.checked && control.value.trim().length > 0) {
          return control.value.trim();
        }
        continue;
      }
    }

    const value = control.value.trim();
    if (value.length > 0) {
      return value;
    }
  }

  const formDataValue = new FormData(form).get(fieldId);
  return formDataValue != null ? String(formDataValue).trim() : '';
}

function readCheckboxValues(form: HTMLFormElement, fieldId: string): string[] {
  const escaped = escapeFieldName(fieldId);
  const selector = `input[type="checkbox"][data-contact-field="${escaped}"]:checked, input[type="checkbox"][name="${escaped}"]:checked`;
  return Array.from(form.querySelectorAll<HTMLInputElement>(selector)).map((input) => input.value);
}

function readFileValues(form: HTMLFormElement, fieldId: string, multiple: boolean) {
  const escaped = escapeFieldName(fieldId);
  const element =
    form.querySelector<HTMLInputElement>(`input[type="file"][data-contact-field="${escaped}"]`) ??
    form.querySelector<HTMLInputElement>(`input[type="file"][name="${escaped}"]`);
  if (!element) {
    return multiple ? [] : null;
  }

  const files = Array.from(element.files ?? []).map((file) => ({
    name: file.name,
    sizeMB: Number((file.size / 1024 / 1024).toFixed(2)),
    mimeType: file.type,
  }));

  if (files.length === 0) {
    return multiple ? [] : null;
  }

  return multiple ? files : files[0];
}

export function collectContactFormPayload(
  form: HTMLFormElement,
  fields: ContactFormField[],
  stateValues: Record<string, unknown> = {},
): Record<string, unknown> {
  const formData = new FormData(form);
  const payload: Record<string, unknown> = {};

  for (const field of fields) {
    const fieldId = String(field.id ?? '').trim();
    if (!fieldId) {
      continue;
    }

    if (field.type === 'checkbox') {
      const values = readCheckboxValues(form, fieldId);
      if (values.length > 0) {
        payload[fieldId] = values;
        continue;
      }
      const formDataValues = formData.getAll(fieldId).map((item) => String(item)).filter(Boolean);
      if (formDataValues.length > 0) {
        payload[fieldId] = formDataValues;
        continue;
      }
      if (Array.isArray(stateValues[fieldId]) && stateValues[fieldId].length > 0) {
        payload[fieldId] = stateValues[fieldId];
      }
      continue;
    }

    if (field.type === 'file') {
      const files = readFileValues(form, fieldId, field.multiple);
      if (files != null && (!Array.isArray(files) || files.length > 0)) {
        payload[fieldId] = files;
        continue;
      }
      if (stateValues[fieldId] != null) {
        payload[fieldId] = stateValues[fieldId];
      }
      continue;
    }

    const domValue = readScalarFromForm(form, fieldId);
    if (domValue.length > 0) {
      payload[fieldId] = domValue;
      continue;
    }

    const formDataValue = formData.get(fieldId);
    if (formDataValue != null && String(formDataValue).trim().length > 0) {
      payload[fieldId] = String(formDataValue).trim();
      continue;
    }

    const stateValue = stateValues[fieldId];
    if (stateValue == null) {
      continue;
    }

    if (Array.isArray(stateValue)) {
      if (stateValue.length > 0) {
        payload[fieldId] = stateValue.map((item) => String(item));
      }
      continue;
    }

    const scalar = String(stateValue).trim();
    if (scalar.length > 0) {
      payload[fieldId] = scalar;
    }
  }

  return payload;
}

export function resolveContactFormId(formBlock: { formId?: string }, fallbackIndex: number): string {
  const explicit = String(formBlock.formId ?? '').trim();
  return explicit || `contact-form-${fallbackIndex}`;
}

export function collectContactFormIdsFromPage(page: LandingPage | null | undefined): string[] {
  const ids = new Set<string>();
  (page?.blocks ?? []).forEach((block, index) => {
    if (String((block as { type?: unknown }).type ?? '') !== 'contact-form') {
      return;
    }
    ids.add(resolveContactFormId(block as { formId?: string }, index));
  });
  return [...ids];
}

export function resolvePublicContactFormDisplay(
  formBlock: { successMessage?: string },
  blockConfig: {
    title: string;
    submitLabel: string;
    fields: ContactFormField[];
    showFieldLabels: boolean;
  },
  apiForm?: ContactFormRecord | null,
) {
  return {
    title: apiForm?.name?.trim() || blockConfig.title,
    submitLabel: apiForm?.submitLabel?.trim() || blockConfig.submitLabel,
    successMessage: apiForm?.successMessage?.trim() || String(formBlock.successMessage ?? '').trim(),
    fields: apiForm?.fields?.length ? apiForm.fields : blockConfig.fields,
    showFieldLabels: blockConfig.showFieldLabels,
  };
}

function translateFieldError(message: string, label: string): string {
  if (message === 'This field is required.') {
    return `${label} là bắt buộc.`;
  }
  if (message.includes('not a valid email')) {
    return `${label} không hợp lệ.`;
  }
  if (message.includes('not a valid URL')) {
    return `${label} phải là URL hợp lệ.`;
  }
  if (message.includes('not a valid phone number')) {
    return `${label} không hợp lệ.`;
  }
  if (message.includes('invalid option')) {
    return `${label} có giá trị không hợp lệ.`;
  }
  return `${label}: ${message}`;
}

export function formatContactFormSubmitError(error: unknown, fields: ContactFormField[] = []): string {
  if (!(error instanceof Error)) {
    return 'Không thể gửi form.';
  }

  const labelById = new Map(fields.map((field) => [field.id, field.label.trim() || field.id]));

  if (error instanceof ApiRequestError && error.fieldErrors) {
    const messages = Object.entries(error.fieldErrors).map(([fieldId, message]) =>
      translateFieldError(message, labelById.get(fieldId) ?? fieldId),
    );
    if (messages.length > 0) {
      return messages.join(' ');
    }
  }

  return error.message || 'Không thể gửi form.';
}

export type ContactFormSubmitEvent = FormEvent<HTMLFormElement>;
