import { FormEvent, useEffect, useState } from 'react';

export type SocialFormValues = {
  tiktok: string;
  instagram: string;
  youtube: string;
  x: string;
};

export type SocialFormErrors = Partial<Record<keyof SocialFormValues, string>>;

type AiChatSocialFormProps = {
  disabled?: boolean;
  submitting?: boolean;
  errors?: SocialFormErrors;
  formError?: string;
  initialValues?: SocialFormValues;
  onSubmit: (values: SocialFormValues) => void;
};

const SOCIAL_FIELDS: Array<{
  key: keyof SocialFormValues;
  label: string;
  placeholder: string;
}> = [
  { key: 'tiktok', label: 'TikTok', placeholder: 'username' },
  { key: 'instagram', label: 'Instagram', placeholder: 'username' },
  { key: 'youtube', label: 'YouTube', placeholder: 'username' },
  { key: 'x', label: 'X', placeholder: 'username' },
];

function stripAt(value: string): string {
  return value.trim().replace(/^@+/, '');
}

function formatWithAt(value: string): string {
  const stripped = stripAt(value);
  return stripped ? `@${stripped}` : '';
}

function isValidUsername(value: string): boolean {
  const stripped = stripAt(value);
  if (!stripped) {
    return true;
  }
  return /^[a-zA-Z0-9._-]{1,50}$/.test(stripped);
}

export function AiChatSocialForm({
  disabled = false,
  submitting = false,
  errors = {},
  formError = '',
  initialValues,
  onSubmit,
}: AiChatSocialFormProps) {
  const [values, setValues] = useState<SocialFormValues>(
    initialValues ?? {
      tiktok: '',
      instagram: '',
      youtube: '',
      x: '',
    },
  );
  const [localErrors, setLocalErrors] = useState<SocialFormErrors>({});
  const [localFormError, setLocalFormError] = useState('');

  useEffect(() => {
    if (initialValues) {
      setValues(initialValues);
      setLocalErrors({});
      setLocalFormError('');
    }
  }, [initialValues]);

  function updateField(key: keyof SocialFormValues, rawValue: string) {
    setValues((current) => ({
      ...current,
      [key]: rawValue,
    }));
    setLocalErrors((current) => ({
      ...current,
      [key]: undefined,
    }));
    setLocalFormError('');
  }

  function normalizeOnBlur(key: keyof SocialFormValues) {
    setValues((current) => ({
      ...current,
      [key]: formatWithAt(current[key]),
    }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (disabled || submitting) {
      return;
    }

    const nextLocalErrors: SocialFormErrors = {};
    for (const field of SOCIAL_FIELDS) {
      if (!isValidUsername(values[field.key])) {
        nextLocalErrors[field.key] = 'Username chỉ gồm chữ, số, dấu chấm, gạch dưới hoặc gạch ngang.';
      }
    }

    if (Object.keys(nextLocalErrors).length > 0) {
      setLocalErrors(nextLocalErrors);
      return;
    }

    const normalized: SocialFormValues = {
      tiktok: formatWithAt(values.tiktok),
      instagram: formatWithAt(values.instagram),
      youtube: formatWithAt(values.youtube),
      x: formatWithAt(values.x),
    };

    const hasAtLeastOne = Object.values(normalized).some(Boolean);
    if (!hasAtLeastOne) {
      setLocalFormError('Vui lòng điền ít nhất một nền tảng mạng xã hội.');
      return;
    }

    setValues(normalized);
    onSubmit(normalized);
  }

  const mergedErrors = { ...localErrors, ...errors };
  const mergedFormError = localFormError || formError;

  return (
    <div className="ai-chat-row is-assistant">
      <div className="ai-chat-avatar" aria-hidden="true">
        <span className="ai-chat-social-badge">@</span>
      </div>
      <form className="ai-chat-bubble ai-chat-bubble-assistant ai-chat-social-form" onSubmit={handleSubmit}>
        <p className="ai-chat-label">Mạng xã hội</p>
        <p className="ai-chat-social-hint">Điền tối thiểu một nền tảng. Hệ thống sẽ tự thêm @ nếu bạn chưa điền.</p>
        {mergedFormError ? <p className="ai-chat-social-form-error">{mergedFormError}</p> : null}

        <div className="ai-chat-social-fields">
          {SOCIAL_FIELDS.map((field) => (
            <label key={field.key} className="ai-chat-social-field">
              <span className="ai-chat-social-field-label">{field.label}</span>
              <span className="ai-chat-social-input-wrap">
                <span className="ai-chat-social-at" aria-hidden="true">
                  @
                </span>
                <input
                  className="input ai-chat-social-input"
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder={field.placeholder}
                  value={stripAt(values[field.key])}
                  disabled={disabled || submitting}
                  onChange={(event) => updateField(field.key, event.target.value)}
                  onBlur={() => normalizeOnBlur(field.key)}
                />
              </span>
              {mergedErrors[field.key] ? <span className="ai-chat-social-field-error">{mergedErrors[field.key]}</span> : null}
            </label>
          ))}
        </div>

        <div className="ai-chat-social-actions">
          <button type="submit" className="btn btn-dark" disabled={disabled || submitting}>
            {submitting ? 'Đang kiểm tra...' : 'Xác nhận'}
          </button>
        </div>
      </form>
    </div>
  );
}
