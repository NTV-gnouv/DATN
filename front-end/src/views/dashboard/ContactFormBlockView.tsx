import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

import { DashboardBuilderLayout } from '@/components/layout/DashboardBuilderLayout';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useAuth } from '@/hooks/useAuth';
import { loadSession } from '@/services/auth.service';
import {
  createContactForm,
  getContactForm,
  type ContactFormField,
  updateContactForm,
} from '@/services/contact-forms.service';
import { getPageById, getPageByUsername, updatePage } from '@/services/pages.service';
import type { LandingPage, PageBlock } from '@/models/page.model';

type FieldType = ContactFormField['type'];

type FormField = ContactFormField;

import type { ContactFormPageBlock } from '@/models/contact-form-block.model';
import { isContactFormPageBlock } from '@/models/contact-form-block.model';
import { createBlockId, findPageBlockById, getBlockId, upsertContentBlock } from '@/utils/page-blocks';
import { buildPreviewPage } from '@/utils/preview-page';

const FIELD_PRESETS: Array<{ type: FieldType; title: string }> = [
  { type: 'text', title: 'Văn bản một dòng' },
  { type: 'textarea', title: 'Văn bản đoạn văn' },
  { type: 'select', title: 'Danh sách thả xuống' },
  { type: 'radio', title: 'Nhiều tùy chọn' },
  { type: 'checkbox', title: 'Hộp kiểm' },
  { type: 'number', title: 'Số' },
  { type: 'name', title: 'Tên' },
  { type: 'email', title: 'Email' },
  { type: 'url', title: 'URL' },
  { type: 'file', title: 'Tải tệp tin' },
];

function createField(type: FieldType, order: number): FormField {
  const id = `${type}-${Date.now().toString(36)}-${order}`;
  return {
    id,
    type,
    label: FIELD_PRESETS.find((item) => item.type === type)?.title ?? `Trường ${order + 1}`,
    placeholder: '',
    defaultValue: '',
    required: false,
    maxLength: type === 'textarea' ? 500 : 120,
    options: type === 'select' || type === 'radio' || type === 'checkbox' ? ['Tùy chọn 1', 'Tùy chọn 2'] : [],
    numberMode: 'number',
    min: null,
    max: null,
    step: null,
    accept: type === 'file' ? '.pdf,.doc,.docx,image/*' : '',
    multiple: false,
    maxFiles: 1,
    maxFileSizeMB: 5,
  };
}

function normalizeSlug(value: string) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function isContactFormBlock(block: PageBlock): block is ContactFormPageBlock & PageBlock {
  return isContactFormPageBlock(block);
}

export default function ContactFormBlockView() {
  const { signOut } = useAuth();
  const session = loadSession();
  const [searchParams] = useSearchParams();
  const blockIdParam = searchParams.get('blockId');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'add' | 'settings'>('add');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState<LandingPage | null>(null);
  const [blockId, setBlockId] = useState('');
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('Form liên hệ');
  const [formDescription, setFormDescription] = useState('');
  const [submitLabel, setSubmitLabel] = useState('Gửi biểu mẫu');
  const [successMessage, setSuccessMessage] = useState('Đã gửi thành công.');
  const [showFieldLabels, setShowFieldLabels] = useState(false);
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const selectedField = fields.find((item) => item.id === selectedFieldId) ?? null;

  const filteredPresets = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return FIELD_PRESETS;
    }
    return FIELD_PRESETS.filter((item) => item.title.toLowerCase().includes(keyword));
  }, [search]);

  const previewPage = useMemo(() => {
    if (!page) {
      return null;
    }

    const draftBlock: ContactFormPageBlock & PageBlock = {
      type: 'contact-form',
      id: blockId || createBlockId('contact-form'),
      visible: true,
      formId: formId || `contact-form-${page.id}`,
      title: formName,
      submitLabel,
      successMessage,
      showFieldLabels,
      fields,
    };

    return buildPreviewPage(page, draftBlock);
  }, [blockId, fields, formId, formName, page, showFieldLabels, submitLabel, successMessage]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const usernameFromName = normalizeSlug(session?.user?.name || '');
        const usernameFromEmail = normalizeSlug(session?.user?.email?.split('@')[0] || '');
        const accountUsernames = [usernameFromName, usernameFromEmail].filter(
          (value, index, all) => Boolean(value) && all.indexOf(value) === index,
        );

        let loadedPage: LandingPage | null = null;
        for (const username of accountUsernames) {
          const byUsername = await getPageByUsername(username);
          if (byUsername && byUsername.status !== 'missing') {
            loadedPage = byUsername;
            break;
          }
        }
        if (!loadedPage || loadedPage.status === 'missing') {
          if (!cancelled) {
            setPage(null);
          }
          return;
        }

        if (cancelled) {
          return;
        }
        setPage(loadedPage);

        const contactBlock = blockIdParam
          ? findPageBlockById<ContactFormPageBlock & PageBlock>(loadedPage, blockIdParam)
          : ((loadedPage.blocks ?? []).find((block) => isContactFormBlock(block)) ?? null);

        if (!contactBlock || !isContactFormBlock(contactBlock)) {
          return;
        }

        setBlockId(getBlockId(contactBlock));
        setFormId(contactBlock.formId);
        setShowFieldLabels(contactBlock.showFieldLabels === true);
        try {
          const existingForm = await getContactForm(contactBlock.formId);
          if (cancelled) {
            return;
          }
          setFormName(existingForm.name);
          setFormDescription(existingForm.description);
          setSubmitLabel(existingForm.submitLabel);
          setSuccessMessage(existingForm.successMessage);
          setFields(existingForm.fields);
          setSelectedFieldId(existingForm.fields[0]?.id ?? '');
        } catch {
          const blockFields = Array.isArray(contactBlock.fields) ? contactBlock.fields : [];
          setFormName(String(contactBlock.title ?? 'Form liên hệ'));
          setSubmitLabel(String(contactBlock.submitLabel ?? 'Gửi biểu mẫu'));
          setSuccessMessage(String(contactBlock.successMessage ?? 'Đã gửi thành công.'));
          setFields(blockFields);
          setSelectedFieldId(blockFields[0]?.id ?? '');
        }
      } catch (caughtError) {
        if (!cancelled) {
          setError(caughtError instanceof Error ? caughtError.message : 'Không thể tải cấu hình form');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [blockIdParam, session?.user?.email, session?.user?.name]);

  function addField(type: FieldType) {
    setFields((current) => {
      const next = [...current, createField(type, current.length)];
      setSelectedFieldId(next[next.length - 1]?.id ?? '');
      setActiveTab('settings');
      return next;
    });
  }

  function updateField(id: string, patch: Partial<FormField>) {
    setFields((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function removeField(id: string) {
    setFields((current) => {
      const next = current.filter((item) => item.id !== id);
      if (selectedFieldId === id) {
        setSelectedFieldId(next[0]?.id ?? '');
      }
      return next;
    });
  }

  async function saveForm() {
    if (!page?.id) {
      setError('Không tìm thấy page để gắn form.');
      return;
    }
    if (fields.length === 0) {
      setError('Bạn cần thêm ít nhất 1 trường.');
      return;
    }

    setSaving(true);
    setError('');
    setNotice('');

    try {
      const payload = {
        id: formId || `contact-form-${page.id}`,
        name: formName,
        description: formDescription,
        submitLabel,
        successMessage,
        status: 'active',
        fields,
      };

      const saved = formId ? await updateContactForm(formId, payload) : await createContactForm(payload);
      const nextFormId = saved.id;
      setFormId(nextFormId);

      const currentBlocks = Array.isArray(page.blocks) ? [...page.blocks] : [];
      const existingBlock = blockIdParam
        ? findPageBlockById<ContactFormPageBlock & PageBlock>(page, blockIdParam)
        : currentBlocks.find((block) => isContactFormBlock(block));
      const nextBlock: ContactFormPageBlock = {
        type: 'contact-form',
        id: blockId || getBlockId(existingBlock ?? { type: 'contact-form', formId: nextFormId }) || createBlockId('contact-form'),
        visible: existingBlock?.visible !== false,
        formId: nextFormId,
        title: saved.name,
        submitLabel: saved.submitLabel,
        successMessage: saved.successMessage,
        showFieldLabels,
        fields: saved.fields,
      };

      const updatedPage = await updatePage(page.id, {
        blocks: upsertContentBlock(page, nextBlock as PageBlock),
      });

      setFields(saved.fields);
      setSelectedFieldId(saved.fields[0]?.id ?? '');
      setPage(updatedPage);
      setNotice('Đã lưu form và gắn vào giao diện theme.');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Không thể lưu form');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <DashboardShell onSignOut={signOut}>
        <p>Đang tải form block...</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell onSignOut={signOut}>
      <DashboardBuilderLayout page={page} previewPage={previewPage} loading={loading} error={error}>
        <div className="contact-form-block-layout">
        <aside className="contact-form-block-sidebar">
          <div className="contact-form-block-tabs">
            <button
              type="button"
              className={`contact-form-block-tab ${activeTab === 'add' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('add')}
            >
              Thêm trường
            </button>
            <button
              type="button"
              className={`contact-form-block-tab ${activeTab === 'settings' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              Tùy chọn trường
            </button>
          </div>

          {activeTab === 'add' ? (
            <>
              <label className="contact-form-search">
                <MagnifyingGlassIcon className="icon-18" />
                <input
                  type="text"
                  className="input"
                  placeholder="Tìm kiếm trường..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <p className="contact-form-sidebar-title">Các trường tiêu chuẩn</p>
              <div className="contact-form-preset-grid">
                {filteredPresets.map((preset) => (
                  <button
                    type="button"
                    key={preset.type}
                    className="contact-form-preset"
                    onClick={() => addField(preset.type)}
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="contact-form-field-settings">
              {!selectedField ? (
                <p className="muted-copy">Chọn một trường ở giữa để chỉnh tùy chọn.</p>
              ) : (
                <>
                  <label>
                    <span>Tên nhãn</span>
                    <input
                      className="input"
                      value={selectedField.label}
                      onChange={(event) => updateField(selectedField.id, { label: event.target.value })}
                    />
                  </label>
                  <label>
                    <span>Văn bản placeholder</span>
                    <input
                      className="input"
                      value={selectedField.placeholder}
                      onChange={(event) => updateField(selectedField.id, { placeholder: event.target.value })}
                    />
                  </label>
                  <label>
                    <span>Giá trị mặc định</span>
                    <input
                      className="input"
                      value={selectedField.defaultValue}
                      onChange={(event) => updateField(selectedField.id, { defaultValue: event.target.value })}
                    />
                  </label>
                  <label className="contact-form-toggle">
                    <input
                      type="checkbox"
                      checked={selectedField.required}
                      onChange={(event) => updateField(selectedField.id, { required: event.target.checked })}
                    />
                    <span>Bắt buộc nhập</span>
                  </label>

                  {(selectedField.type === 'text' ||
                    selectedField.type === 'textarea' ||
                    selectedField.type === 'name' ||
                    selectedField.type === 'email' ||
                    selectedField.type === 'url') ? (
                    <label>
                      <span>Giới hạn độ dài</span>
                      <input
                        type="number"
                        className="input"
                        value={selectedField.maxLength}
                        onChange={(event) => updateField(selectedField.id, { maxLength: Math.max(0, Number(event.target.value) || 0) })}
                      />
                    </label>
                  ) : null}

                  {(selectedField.type === 'select' || selectedField.type === 'radio' || selectedField.type === 'checkbox') ? (
                    <label>
                      <span>Danh sách tùy chọn (mỗi dòng 1 mục)</span>
                      <textarea
                        className="input"
                        rows={5}
                        value={selectedField.options.join('\n')}
                        onChange={(event) =>
                          updateField(selectedField.id, {
                            options: event.target.value.split('\n').map((item) => item.trim()).filter(Boolean),
                          })
                        }
                      />
                    </label>
                  ) : null}

                  {selectedField.type === 'number' ? (
                    <label>
                      <span>Kiểu số</span>
                      <select
                        className="input"
                        value={selectedField.numberMode}
                        onChange={(event) => updateField(selectedField.id, { numberMode: event.target.value as 'number' | 'phone' })}
                      >
                        <option value="number">Số thường</option>
                        <option value="phone">Số điện thoại</option>
                      </select>
                    </label>
                  ) : null}

                  {selectedField.type === 'file' ? (
                    <>
                      <label>
                        <span>Accept (định dạng tệp)</span>
                        <input
                          className="input"
                          value={selectedField.accept}
                          onChange={(event) => updateField(selectedField.id, { accept: event.target.value })}
                        />
                      </label>
                      <label className="contact-form-toggle">
                        <input
                          type="checkbox"
                          checked={selectedField.multiple}
                          onChange={(event) => updateField(selectedField.id, { multiple: event.target.checked })}
                        />
                        <span>Cho phép nhiều tệp</span>
                      </label>
                    </>
                  ) : null}

                  <button type="button" className="btn btn-secondary" onClick={() => removeField(selectedField.id)}>
                    Xóa trường
                  </button>
                </>
              )}
            </div>
          )}
        </aside>

        <section className="contact-form-block-main">
          <div className="contact-form-builder-card">
            <h2>Form liên hệ</h2>
            <div className="contact-form-builder-divider" />
            <div className="contact-form-meta-grid">
              <label>
                <span>Tên form</span>
                <input className="input" value={formName} onChange={(event) => setFormName(event.target.value)} />
              </label>
              <label>
                <span>Nhãn nút gửi</span>
                <input className="input" value={submitLabel} onChange={(event) => setSubmitLabel(event.target.value)} />
              </label>
              <label>
                <span>Mô tả</span>
                <input className="input" value={formDescription} onChange={(event) => setFormDescription(event.target.value)} />
              </label>
              <label>
                <span>Thông báo thành công</span>
                <input className="input" value={successMessage} onChange={(event) => setSuccessMessage(event.target.value)} />
              </label>
              <label className="contact-form-toggle contact-form-toggle-block">
                <input
                  type="checkbox"
                  checked={showFieldLabels}
                  onChange={(event) => setShowFieldLabels(event.target.checked)}
                />
                <span>Hiển thị nhãn trường (căn trái)</span>
              </label>
            </div>

            {fields.length === 0 ? (
              <div className="contact-form-empty-state">
                <div className="contact-form-empty-illustration">📝</div>
                <p className="contact-form-empty-title">Bạn chưa có trường nào. Hãy thêm một số trường!</p>
                <p className="muted-copy">Hãy lựa chọn từ nhiều loại trường ở khung bên trái để bắt đầu xây dựng Form của bạn.</p>
              </div>
            ) : (
              <div className="contact-form-canvas">
                {fields.map((field) => (
                  <button
                    type="button"
                    key={field.id}
                    className={`contact-form-canvas-field ${selectedFieldId === field.id ? 'is-selected' : ''}`}
                    onClick={() => {
                      setSelectedFieldId(field.id);
                      setActiveTab('settings');
                    }}
                  >
                    <div className="contact-form-canvas-field-label">
                      {showFieldLabels ? (
                        <>
                          {field.label.trim() ? field.label : <span className="muted-copy">Chưa đặt nhãn</span>}
                          {field.required ? <span>*</span> : null}
                        </>
                      ) : (
                        <span className="muted-copy">{field.placeholder || field.label || 'Placeholder'}</span>
                      )}
                    </div>
                    <div className="contact-form-canvas-field-input">
                      {field.type === 'textarea' ? (
                        <textarea className="input" rows={3} placeholder={field.placeholder} disabled />
                      ) : field.type === 'select' ? (
                        <select className="input" disabled>
                          <option>{field.placeholder || 'Chọn giá trị'}</option>
                        </select>
                      ) : field.type === 'radio' || field.type === 'checkbox' ? (
                        <div className="contact-form-choice-list">
                          {field.options.map((option) => (
                            <span key={option}>{option}</span>
                          ))}
                        </div>
                      ) : field.type === 'file' ? (
                        <input className="input" type="file" disabled />
                      ) : (
                        <input className="input" placeholder={field.placeholder} disabled />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="contact-form-actions-row">
              <button type="button" className="btn btn-dark" onClick={() => void saveForm()} disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu form'}
              </button>
              {notice ? <span className="field-success">{notice}</span> : null}
              {error ? <span className="field-error">{error}</span> : null}
            </div>

            {formId ? (
              <div className="contact-form-analytics-note">
                <p className="muted-copy">Dữ liệu khách hàng gửi form được lưu trong Analytics.</p>
                <Link className="btn btn-secondary" to="/dashboard/analytics/contact-form">
                  Xem dữ liệu Analytics
                </Link>
              </div>
            ) : null}
          </div>
        </section>
        </div>
      </DashboardBuilderLayout>
    </DashboardShell>
  );
}
