import type { CSSProperties, FormEvent, ReactNode } from 'react';

import type { ContactFormField } from '@/services/contact-forms.service';
import { resolveShowFieldLabels } from '@/models/contact-form-block.model';

export type ContactFormBlockPreviewProps = {
  title?: string;
  submitLabel?: string;
  fields?: ContactFormField[];
  showFieldLabels?: boolean;
  buttonColor: string;
  contentText: string;
  surfaceStyle?: CSSProperties;
  className?: string;
  titleStyle?: CSSProperties;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  renderFieldValue?: (field: ContactFormField) => unknown;
  onFieldChange?: (field: ContactFormField, value: unknown) => void;
  nativeForm?: boolean;
  submitting?: boolean;
  errorMessage?: string;
  successMessage?: string;
  footer?: ReactNode;
  formKey?: string;
};

function getInputType(field: ContactFormField): string {
  if (field.type === 'email') return 'email';
  if (field.type === 'url') return 'url';
  if (field.type === 'number' && field.numberMode === 'phone') return 'tel';
  if (field.type === 'number') return 'number';
  return 'text';
}

function renderFieldControl(
  field: ContactFormField,
  options: {
    value?: unknown;
    onChange?: (value: unknown) => void;
    nativeForm?: boolean;
  },
) {
  const placeholder = field.placeholder || '';
  const controlled = !options.nativeForm && options.onChange != null;
  const value = options.value;
  const autoComplete =
    field.type === 'email' ? 'email' : field.type === 'name' ? 'name' : field.type === 'number' && field.numberMode === 'phone' ? 'tel' : undefined;

  if (field.type === 'textarea') {
    return (
      <textarea
        className="input landing-contact-form-control"
        name={field.id}
        data-contact-field={field.id}
        rows={3}
        placeholder={placeholder}
        maxLength={field.maxLength || undefined}
        required={field.required || undefined}
        autoComplete={autoComplete}
        value={controlled ? String(value ?? '') : undefined}
        defaultValue={controlled ? undefined : String(field.defaultValue ?? '')}
        onChange={controlled ? (event) => options.onChange?.(event.target.value) : undefined}
      />
    );
  }

  if (field.type === 'select') {
    if (!Array.isArray(field.options) || field.options.length === 0) {
      return null;
    }

    return (
      <select
        className="input landing-contact-form-control"
        name={field.id}
        data-contact-field={field.id}
        required={field.required || undefined}
        value={controlled ? String(value ?? '') : undefined}
        defaultValue={controlled ? undefined : String(field.defaultValue ?? '')}
        onChange={controlled ? (event) => options.onChange?.(event.target.value) : undefined}
      >
        <option value="">{placeholder || 'Chọn giá trị'}</option>
        {field.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === 'radio' || field.type === 'checkbox') {
    if (!Array.isArray(field.options) || field.options.length === 0) {
      return null;
    }

    const selected = Array.isArray(value)
      ? value.map((item) => String(item))
      : String(value ?? '')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);

    return (
      <div className="landing-contact-form-choice-list" role={field.type === 'radio' ? 'radiogroup' : 'group'}>
        {field.options.map((option) => (
          <label key={option} className="landing-contact-form-choice">
            <input
              type={field.type}
              name={field.id}
              data-contact-field={field.id}
              value={option}
              required={field.required || undefined}
              checked={selected.includes(option)}
              onChange={(event) => {
                if (!controlled) {
                  return;
                }
                if (field.type === 'radio') {
                  options.onChange?.(option);
                  return;
                }
                const next = event.target.checked
                  ? [...selected, option]
                  : selected.filter((item) => item !== option);
                options.onChange?.(next);
              }}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    );
  }

  if (field.type === 'file') {
    return (
      <input
        className="input landing-contact-form-control"
        type="file"
        name={field.id}
        data-contact-field={field.id}
        accept={field.accept || undefined}
        multiple={field.multiple}
        required={field.required || undefined}
        onChange={
          controlled
            ? (event) => {
                const files = Array.from(event.target.files ?? []).map((file) => ({
                  name: file.name,
                  sizeMB: Number((file.size / 1024 / 1024).toFixed(2)),
                  mimeType: file.type,
                }));
                options.onChange?.(field.multiple ? files : files[0] ?? null);
              }
            : undefined
        }
      />
    );
  }

  return (
    <input
      className="input landing-contact-form-control"
      type={getInputType(field)}
      name={field.id}
      data-contact-field={field.id}
      placeholder={placeholder}
      maxLength={field.maxLength || undefined}
      required={field.required || undefined}
      autoComplete={autoComplete}
      value={controlled ? String(value ?? '') : undefined}
      defaultValue={controlled ? undefined : String(field.defaultValue ?? '')}
      onChange={controlled ? (event) => options.onChange?.(event.target.value) : undefined}
    />
  );
}

export function ContactFormBlockPreview({
  title,
  submitLabel,
  fields = [],
  showFieldLabels,
  buttonColor,
  contentText,
  surfaceStyle,
  className = 'landing-contact-form',
  titleStyle,
  onSubmit,
  renderFieldValue,
  onFieldChange,
  nativeForm = false,
  submitting = false,
  errorMessage,
  successMessage,
  footer,
  formKey,
}: ContactFormBlockPreviewProps) {
  const labelsVisible = showFieldLabels === true;

  return (
    <form
      className={`${className}${labelsVisible ? ' is-labels-visible' : ' is-labels-hidden'}`}
      onSubmit={onSubmit}
      style={surfaceStyle}
    >
      {title ? (
        <h5 className="landing-contact-form-title" style={titleStyle}>
          {title}
        </h5>
      ) : null}

      {fields.map((field) => {
        if (!String(field.id ?? '').trim()) {
          return null;
        }

        const labelText = String(field.label ?? '').trim();
        const control = renderFieldControl(field, {
          value: nativeForm ? undefined : renderFieldValue?.(field),
          onChange: nativeForm ? undefined : onFieldChange ? (value) => onFieldChange(field, value) : undefined,
          nativeForm,
        });

        if (!control) {
          return null;
        }

        const isChoiceField = field.type === 'radio' || field.type === 'checkbox';

        if (isChoiceField) {
          return (
            <fieldset key={field.id} className="landing-contact-form-field">
              {labelsVisible && labelText ? (
                <legend className="landing-contact-form-field-label">
                  {labelText}
                  {field.required ? ' *' : ''}
                </legend>
              ) : null}
              {control}
            </fieldset>
          );
        }

        return (
          <label key={field.id} className="landing-contact-form-field">
            {labelsVisible && labelText ? (
              <span className="landing-contact-form-field-label">
                {labelText}
                {field.required ? ' *' : ''}
              </span>
            ) : null}
            {control}
          </label>
        );
      })}

      {errorMessage ? <p className="landing-contact-form-error">{errorMessage}</p> : null}
      {successMessage ? <p className="landing-contact-form-success">{successMessage}</p> : null}

      <button
        type="submit"
        className="landing-contact-form-submit"
        disabled={submitting}
        style={{ background: buttonColor }}
      >
        {submitting ? 'Đang gửi...' : submitLabel || 'Gửi'}
      </button>

      {footer}
    </form>
  );
}

export function getContactFormBlockConfig(block: Record<string, unknown>) {
  return {
    title: String(block.title ?? '').trim(),
    submitLabel: String(block.submitLabel ?? '').trim(),
    fields: Array.isArray(block.fields) ? (block.fields as ContactFormField[]) : [],
    showFieldLabels: resolveShowFieldLabels({ showFieldLabels: block.showFieldLabels as boolean | undefined }),
  };
}
