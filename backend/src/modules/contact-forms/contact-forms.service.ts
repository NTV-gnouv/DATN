import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { ContactFormsRepository } from './contact-forms.repository';
import {
  CONTACT_FORM_FIELD_TYPES,
  ContactFormField,
  ContactFormNumberMode,
  ContactFormRecord,
  ContactFormSubmissionRecord,
} from './contact-forms.types';

@Injectable()
export class ContactFormsService {
  constructor(private readonly repository: ContactFormsRepository) {}

  private slugify(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private parseNumber(value: unknown): number | null {
    if (value == null || value === '') {
      return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private toArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }
    return value
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0);
  }

  private normalizeField(raw: Record<string, unknown>, index: number): ContactFormField {
    const typeCandidate = String(raw.type ?? 'text') as ContactFormField['type'];
    const type = CONTACT_FORM_FIELD_TYPES.includes(typeCandidate) ? typeCandidate : 'text';

    const label = String(raw.label ?? '').trim();

    const keySeed = String(raw.id ?? (this.slugify(label) || `field-${index + 1}`));
    const id = this.slugify(keySeed) || `field-${index + 1}`;

    const options =
      type === 'select' || type === 'radio' || type === 'checkbox'
        ? this.toArray(raw.options)
        : [];

    if ((type === 'select' || type === 'radio' || type === 'checkbox') && options.length === 0) {
      throw new BadRequestException(`Field "${id}" requires at least 1 option.`);
    }

    const numberModeCandidate = String(raw.numberMode ?? 'number') as ContactFormNumberMode;
    const numberMode: ContactFormNumberMode = numberModeCandidate === 'phone' ? 'phone' : 'number';

    const maxLength = Math.max(0, Number(raw.maxLength ?? 0) || 0);
    const maxFiles = Math.max(1, Number(raw.maxFiles ?? 1) || 1);
    const maxFileSizeMB = Math.max(1, Number(raw.maxFileSizeMB ?? 5) || 5);

    return {
      id,
      type,
      label,
      placeholder: String(raw.placeholder ?? ''),
      defaultValue: String(raw.defaultValue ?? ''),
      required: Boolean(raw.required ?? false),
      maxLength,
      options,
      numberMode,
      min: this.parseNumber(raw.min),
      max: this.parseNumber(raw.max),
      step: this.parseNumber(raw.step),
      accept: String(raw.accept ?? ''),
      multiple: Boolean(raw.multiple ?? false),
      maxFiles,
      maxFileSizeMB,
    };
  }

  private normalizeFields(value: unknown): ContactFormField[] {
    if (!Array.isArray(value)) {
      throw new BadRequestException('fields must be an array.');
    }

    const fields = value.map((item, index) => {
      if (!item || typeof item !== 'object') {
        throw new BadRequestException(`Field at index ${index} is invalid.`);
      }
      return this.normalizeField(item as Record<string, unknown>, index);
    });

    if (fields.length === 0) {
      throw new BadRequestException('At least 1 field is required.');
    }

    const idSet = new Set<string>();
    fields.forEach((field) => {
      if (idSet.has(field.id)) {
        throw new BadRequestException(`Duplicate field key "${field.id}".`);
      }
      idSet.add(field.id);
    });

    return fields;
  }

  private validateScalar(field: ContactFormField, value: string): string | null {
    if (field.maxLength > 0 && value.length > field.maxLength) {
      return `Field "${field.id}" exceeds max length ${field.maxLength}.`;
    }

    if (field.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return `Field "${field.id}" is not a valid email.`;
      }
    }

    if (field.type === 'url') {
      try {
        const url = new URL(value);
        if (!['http:', 'https:'].includes(url.protocol)) {
          return `Field "${field.id}" must be http/https URL.`;
        }
      } catch {
        return `Field "${field.id}" is not a valid URL.`;
      }
    }

    if (field.type === 'number' && field.numberMode === 'number') {
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) {
        return `Field "${field.id}" must be a number.`;
      }
      if (field.min != null && parsed < field.min) {
        return `Field "${field.id}" must be >= ${field.min}.`;
      }
      if (field.max != null && parsed > field.max) {
        return `Field "${field.id}" must be <= ${field.max}.`;
      }
    }

    if (field.type === 'number' && field.numberMode === 'phone') {
      const phoneRegex = /^\+?[0-9()\-\s.]{7,20}$/;
      if (!phoneRegex.test(value)) {
        return `Field "${field.id}" is not a valid phone number.`;
      }
    }

    if ((field.type === 'select' || field.type === 'radio') && !field.options.includes(value)) {
      return `Field "${field.id}" has invalid option value.`;
    }

    return null;
  }

  private validateFileValue(field: ContactFormField, value: unknown): string | null {
    const files = Array.isArray(value) ? value : [value];
    const sanitizedFiles = files.filter((item) => item && typeof item === 'object') as Array<Record<string, unknown>>;

    if (field.required && sanitizedFiles.length === 0) {
      return `Field "${field.id}" is required.`;
    }

    if (!field.multiple && sanitizedFiles.length > 1) {
      return `Field "${field.id}" only allows one file.`;
    }

    if (sanitizedFiles.length > field.maxFiles) {
      return `Field "${field.id}" exceeds max files ${field.maxFiles}.`;
    }

    const allowedPatterns = field.accept
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    for (const file of sanitizedFiles) {
      const sizeMB = Number(file.sizeMB ?? file.size ?? 0);
      if (Number.isFinite(sizeMB) && sizeMB > field.maxFileSizeMB) {
        return `Field "${field.id}" has file larger than ${field.maxFileSizeMB}MB.`;
      }

      if (allowedPatterns.length > 0) {
        const name = String(file.name ?? '');
        const mimeType = String(file.mimeType ?? file.type ?? '');
        const accepted = allowedPatterns.some((pattern) => {
          if (pattern.endsWith('/*')) {
            return mimeType.startsWith(pattern.replace('*', ''));
          }
          if (pattern.startsWith('.')) {
            return name.toLowerCase().endsWith(pattern.toLowerCase());
          }
          return mimeType === pattern;
        });
        if (!accepted) {
          return `Field "${field.id}" has unsupported file type.`;
        }
      }
    }

    return null;
  }

  listForms() {
    return this.repository.listForms();
  }

  async getForm(id: string) {
    const record = await this.repository.getForm(id);
    if (!record) {
      throw new NotFoundException('Form not found.');
    }
    return record;
  }

  async createForm(payload: Record<string, unknown>) {
    const id = this.slugify(String(payload.id ?? payload.name ?? `form-${Date.now()}`)) || `form-${Date.now()}`;
    const now = new Date().toISOString();
    const fields = this.normalizeFields(payload.fields);
    const existing = await this.repository.getForm(id);
    if (existing) {
      throw new BadRequestException(`Form "${id}" already exists.`);
    }

    const record: ContactFormRecord = {
      id,
      name: String(payload.name ?? id),
      description: String(payload.description ?? ''),
      submitLabel: String(payload.submitLabel ?? 'Send'),
      successMessage: String(payload.successMessage ?? 'Submission received successfully.'),
      status: String(payload.status ?? 'active') === 'inactive' ? 'inactive' : 'active',
      fields,
      createdAt: now,
      updatedAt: now,
    };
    return this.repository.saveForm(record);
  }

  async updateForm(id: string, payload: Record<string, unknown>) {
    const current = await this.repository.getForm(id);
    if (!current) {
      throw new NotFoundException('Form not found.');
    }

    const next: ContactFormRecord = {
      ...current,
      name: payload.name == null ? current.name : String(payload.name),
      description: payload.description == null ? current.description : String(payload.description),
      submitLabel: payload.submitLabel == null ? current.submitLabel : String(payload.submitLabel),
      successMessage: payload.successMessage == null ? current.successMessage : String(payload.successMessage),
      status: payload.status == null ? current.status : (String(payload.status) === 'inactive' ? 'inactive' : 'active'),
      fields: payload.fields == null ? current.fields : this.normalizeFields(payload.fields),
      updatedAt: new Date().toISOString(),
    };
    return this.repository.saveForm(next);
  }

  async submitForm(
    formId: string,
    payload: Record<string, unknown>,
    requestMeta: { ip: string; userAgent: string; pageUrl: string },
  ) {
    const form = await this.repository.getForm(formId);
    if (!form || form.status !== 'active') {
      throw new NotFoundException('Form not found or inactive.');
    }

    const normalizedPayload: Record<string, unknown> = {};
    const errors: Record<string, string> = {};

    form.fields.forEach((field) => {
      const value = payload[field.id];

      if (field.type === 'checkbox') {
        const items = Array.isArray(value) ? value.map((item) => String(item)) : [];
        if (field.required && items.length === 0) {
          errors[field.id] = 'This field is required.';
          return;
        }
        const invalid = items.find((item) => !field.options.includes(item));
        if (invalid) {
          errors[field.id] = 'Contains invalid option.';
          return;
        }
        if (items.length > 0) {
          normalizedPayload[field.id] = items;
        }
        return;
      }

      if (field.type === 'file') {
        const fileError = this.validateFileValue(field, value);
        if (fileError) {
          errors[field.id] = fileError;
          return;
        }
        const files = Array.isArray(value) ? value : value != null ? [value] : [];
        const sanitizedFiles = files.filter((item) => item && typeof item === 'object');
        if (sanitizedFiles.length > 0) {
          normalizedPayload[field.id] = field.multiple ? sanitizedFiles : sanitizedFiles[0];
        }
        return;
      }

      const scalar = value == null ? '' : String(value).trim();
      if (field.required && scalar.length === 0) {
        errors[field.id] = 'This field is required.';
        return;
      }

      if (scalar.length === 0) {
        return;
      }

      const scalarError = this.validateScalar(field, scalar);
      if (scalarError) {
        errors[field.id] = scalarError;
        return;
      }

      normalizedPayload[field.id] = scalar;
    });

    if (Object.keys(errors).length > 0) {
      throw new BadRequestException({
        message: 'Invalid form payload.',
        errors,
      });
    }

    const submittedAt = new Date().toISOString();
    const submissionId = `submission-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const fieldLabels = Object.fromEntries(
      form.fields.map((field) => [field.id, field.label.trim() || field.id]),
    );
    const record: ContactFormSubmissionRecord = {
      id: submissionId,
      formId: form.id,
      payload: normalizedPayload,
      metadata: {
        ip: requestMeta.ip,
        userAgent: requestMeta.userAgent,
        submittedAt,
        pageUrl: requestMeta.pageUrl,
        fieldLabels,
      },
    };

    await this.repository.saveSubmission(record);

    return {
      message: form.successMessage,
      submissionId: record.id,
      submittedAt,
    };
  }

  async listSubmissions(formId?: string) {
    if (formId) {
      const form = await this.repository.getForm(formId);
      if (!form) {
        throw new NotFoundException('Form not found.');
      }
    }

    const rows = await this.repository.listSubmissions(formId);
    return rows.sort((a, b) => b.metadata.submittedAt.localeCompare(a.metadata.submittedAt));
  }

  async getSubmission(id: string) {
    const record = await this.repository.getSubmission(id);
    if (!record) {
      throw new NotFoundException('Submission not found.');
    }
    return record;
  }

  async deleteSubmission(id: string) {
    const record = await this.repository.getSubmission(id);
    if (!record) {
      throw new NotFoundException('Submission not found.');
    }

    await this.repository.deleteSubmission(id);
    return { message: 'Submission deleted.', id };
  }

  async clearSubmissions(formId: string) {
    const form = await this.repository.getForm(formId);
    if (!form) {
      throw new NotFoundException('Form not found.');
    }

    const deletedCount = await this.repository.deleteSubmissionsByFormId(formId);
    return { message: 'Submissions cleared.', formId, deletedCount };
  }
}
