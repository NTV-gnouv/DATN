export const CONTACT_FORM_FIELD_TYPES = [
  'text',
  'textarea',
  'select',
  'radio',
  'checkbox',
  'number',
  'name',
  'email',
  'url',
  'file',
] as const;

export type ContactFormFieldType = (typeof CONTACT_FORM_FIELD_TYPES)[number];
export type ContactFormNumberMode = 'number' | 'phone';

export type ContactFormField = {
  id: string;
  type: ContactFormFieldType;
  label: string;
  placeholder: string;
  defaultValue: string;
  required: boolean;
  maxLength: number;
  options: string[];
  numberMode: ContactFormNumberMode;
  min: number | null;
  max: number | null;
  step: number | null;
  accept: string;
  multiple: boolean;
  maxFiles: number;
  maxFileSizeMB: number;
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
