import { useCallback, useEffect, useMemo, useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';

import {
  clearContactFormSubmissions,
  deleteContactFormSubmission,
  getContactForm,
  listContactFormSubmissions,
  type ContactFormField,
  type ContactFormSubmissionRecord,
} from '@/services/contact-forms.service';

type ContactFormSubmissionsPanelProps = {
  formId: string;
  refreshKey?: string | number;
};

type FieldColumn = {
  id: string;
  label: string;
};

function formatSubmittedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCellValue(value: unknown): string {
  if (value == null) {
    return '';
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '';
    }
    return value
      .map((item) => {
        if (item && typeof item === 'object' && 'name' in item) {
          return String((item as { name?: string }).name ?? '').trim();
        }
        return String(item ?? '').trim();
      })
      .filter(Boolean)
      .join(', ');
  }

  if (typeof value === 'object' && 'name' in value) {
    return String((value as { name?: string }).name ?? '').trim();
  }

  return String(value).trim();
}

function buildFieldColumns(fields: ContactFormField[], submissions: ContactFormSubmissionRecord[]): FieldColumn[] {
  const labelById = new Map<string, string>();

  for (const field of fields) {
    if (!field.id) {
      continue;
    }
    labelById.set(field.id, field.label.trim() || field.id);
  }

  for (const submission of submissions) {
    const snapshot = submission.metadata?.fieldLabels ?? {};
    for (const [id, label] of Object.entries(snapshot)) {
      if (!labelById.has(id)) {
        labelById.set(id, String(label).trim() || id);
      }
    }
    for (const key of Object.keys(submission.payload ?? {})) {
      if (!labelById.has(key)) {
        labelById.set(key, key);
      }
    }
  }

  const orderedIds: string[] = [];
  const seen = new Set<string>();

  for (const field of fields) {
    if (!field.id || seen.has(field.id)) {
      continue;
    }
    seen.add(field.id);
    orderedIds.push(field.id);
  }

  const legacyIds = Array.from(labelById.keys())
    .filter((id) => !seen.has(id))
    .sort((a, b) => a.localeCompare(b, 'vi'));

  for (const id of legacyIds) {
    seen.add(id);
    orderedIds.push(id);
  }

  return orderedIds.map((id) => ({
    id,
    label: labelById.get(id) ?? id,
  }));
}

export function ContactFormSubmissionsPanel({ formId, refreshKey = 0 }: ContactFormSubmissionsPanelProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submissions, setSubmissions] = useState<ContactFormSubmissionRecord[]>([]);
  const [formFields, setFormFields] = useState<ContactFormField[]>([]);
  const [deletingId, setDeletingId] = useState('');
  const [clearing, setClearing] = useState(false);

  const loadData = useCallback(async () => {
    if (!formId) {
      setSubmissions([]);
      setFormFields([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [rows, form] = await Promise.all([
        listContactFormSubmissions(formId),
        getContactForm(formId).catch(() => null),
      ]);

      setSubmissions(rows);
      setFormFields(form?.fields ?? []);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Không thể tải dữ liệu form');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    void loadData();
  }, [loadData, refreshKey]);

  const columns = useMemo(() => buildFieldColumns(formFields, submissions), [formFields, submissions]);

  async function handleDeleteSubmission(submissionId: string) {
    const confirmed = window.confirm('Xóa bản ghi này? Hành động không thể hoàn tác.');
    if (!confirmed) {
      return;
    }

    setDeletingId(submissionId);
    setError('');

    try {
      await deleteContactFormSubmission(submissionId);
      setSubmissions((current) => current.filter((item) => item.id !== submissionId));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Không thể xóa bản ghi');
    } finally {
      setDeletingId('');
    }
  }

  async function handleClearAll() {
    const confirmed = window.confirm(
      'Dọn dẹp toàn bộ dữ liệu form? Bảng sẽ được reset và chỉ hiện các trường hiện tại khi có dữ liệu mới.',
    );
    if (!confirmed) {
      return;
    }

    setClearing(true);
    setError('');

    try {
      await clearContactFormSubmissions(formId);
      setSubmissions([]);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Không thể dọn dẹp dữ liệu');
    } finally {
      setClearing(false);
    }
  }

  if (!formId) {
    return <p className="muted-copy">Chưa có form liên hệ trên trang. Hãy tạo và lưu form trước.</p>;
  }

  if (loading) {
    return <p className="muted-copy">Đang tải dữ liệu khách hàng...</p>;
  }

  return (
    <div className="analytics-submissions-panel">
      <div className="analytics-submissions-head">
        <div>
          <h3>Dữ liệu form</h3>
          <p className="muted-copy">{submissions.length} bản ghi</p>
        </div>
        {submissions.length > 0 ? (
          <button
            type="button"
            className="btn btn-secondary analytics-submissions-clear-btn"
            disabled={clearing || Boolean(deletingId)}
            onClick={() => void handleClearAll()}
          >
            {clearing ? 'Đang dọn...' : 'Dọn dẹp & reset bảng'}
          </button>
        ) : null}
      </div>

      {error ? <p className="field-error">{error}</p> : null}

      {submissions.length === 0 ? (
        <p className="muted-copy">Chưa có dữ liệu gửi form.</p>
      ) : (
        <div className="analytics-submissions-table-wrap">
          <table className="analytics-submissions-table">
            <thead>
              <tr>
                <th className="analytics-submissions-col-time">Thời gian</th>
                {columns.map((column) => (
                  <th key={column.id} title={column.id !== column.label ? column.id : undefined}>
                    {column.label}
                  </th>
                ))}
                <th className="analytics-submissions-col-actions" aria-label="Thao tác" />
              </tr>
            </thead>
            <tbody>
              {submissions.map((item) => (
                <tr key={item.id}>
                  <td className="analytics-submissions-col-time">{formatSubmittedAt(item.metadata.submittedAt)}</td>
                  {columns.map((column) => {
                    const value = formatCellValue(item.payload?.[column.id]);
                    return (
                      <td key={`${item.id}-${column.id}`} title={value}>
                        {value || <span className="analytics-submissions-empty">—</span>}
                      </td>
                    );
                  })}
                  <td className="analytics-submissions-col-actions">
                    <button
                      type="button"
                      className="analytics-submissions-row-delete"
                      aria-label="Xóa bản ghi"
                      disabled={deletingId === item.id || clearing}
                      onClick={() => void handleDeleteSubmission(item.id)}
                    >
                      <TrashIcon className="icon-18" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
