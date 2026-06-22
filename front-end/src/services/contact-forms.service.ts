import { apiRequest } from './api';

export type ContactFormField = {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number' | 'name' | 'email' | 'url' | 'file';
  label: string;
  placeholder: string;
  defaultValue: string;
  required: boolean;
  maxLength: number;
  options: string[];
  numberMode: 'number' | 'phone';
  min?: number | null;
  max?: number | null;
  step?: number | null;
  accept: string;
  multiple: boolean;
  maxFiles?: number;
  maxFileSizeMB?: number;
};

export type ContactFormRecord = {
  id: string;
  name: string;
  description: string;
  submitLabel: string;
  successMessage: string;
  status: 'active' | 'inactive';
  fields: ContactFormField[];
  createdAt: string;
  updatedAt: string;
};

export type ContactFormSubmissionRecord = {
  id: string;
  formId: string;
  payload: Record<string, unknown>;
  metadata: {
    ip: string;
    userAgent: string;
    submittedAt: string;
    pageUrl: string;
    fieldLabels?: Record<string, string>;
  };
};

export function createContactForm(payload: Record<string, unknown>) {
  return apiRequest<ContactFormRecord>('/contact-forms', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateContactForm(id: string, payload: Record<string, unknown>) {
  return apiRequest<ContactFormRecord>(`/contact-forms/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function getContactForm(id: string) {
  return apiRequest<ContactFormRecord>(`/contact-forms/${encodeURIComponent(id)}`);
}

export function listContactFormSubmissions(formId?: string) {
  const query = formId ? `?formId=${encodeURIComponent(formId)}` : '';
  return apiRequest<ContactFormSubmissionRecord[]>(`/contact-forms/submissions/all${query}`);
}

export function deleteContactFormSubmission(id: string) {
  return apiRequest<{ message: string; id: string }>(`/contact-forms/submissions/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export function clearContactFormSubmissions(formId: string) {
  return apiRequest<{ message: string; formId: string; deletedCount: number }>(
    `/contact-forms/submissions/all?formId=${encodeURIComponent(formId)}`,
    { method: 'DELETE' },
  );
}

export function submitContactForm(id: string, payload: Record<string, unknown>, pageUrl: string) {
  return apiRequest<{ message: string; submissionId: string; submittedAt: string }>(`/contact-forms/${encodeURIComponent(id)}/submit`, {
    method: 'POST',
    headers: {
      'x-page-url': pageUrl,
    },
    body: JSON.stringify(payload),
  });
}
