import { useEffect, useMemo, useState } from 'react';
import { ArrowPathIcon, LinkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

import { DashboardBuilderLayout } from '@/components/layout/DashboardBuilderLayout';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useAuth } from '@/hooks/useAuth';
import { useBlockEditorRoute } from '@/hooks/useBlockEditorRoute';
import type { LinkBlockLayout, LinkItem, LinkPageBlock } from '@/models/content-blocks.model';
import { createBlockId, upsertContentBlock } from '@/utils/page-blocks';
import { buildPreviewPage } from '@/utils/preview-page';
import { fetchLinkPreview } from '@/services/link-preview.service';
import { updatePage } from '@/services/pages.service';

const LAYOUT_OPTIONS: Array<{ value: LinkBlockLayout; label: string }> = [
  { value: 'classic', label: 'Classic' },
  { value: 'carousel', label: 'Carousel' },
  { value: 'image-grid', label: 'Image grid' },
  { value: 'card', label: 'Card' },
];

function createEmptyLink(): LinkItem {
  return {
    id: `link-${Date.now().toString(36)}`,
    url: '',
    title: '',
    description: '',
    thumbnailUrl: '',
  };
}

export default function LinkBlockView() {
  const { signOut } = useAuth();
  const { page, setPage, loading, error, setError, activeBlock, blockId } = useBlockEditorRoute<LinkPageBlock>('link-block');
  const [layout, setLayout] = useState<LinkBlockLayout>('classic');
  const [links, setLinks] = useState<LinkItem[]>([createEmptyLink()]);
  const [fetchingId, setFetchingId] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!activeBlock) {
      return;
    }
    setLayout(activeBlock.layout ?? 'classic');
    setLinks(Array.isArray(activeBlock.links) && activeBlock.links.length > 0 ? activeBlock.links : [createEmptyLink()]);
  }, [activeBlock]);

  const previewPage = useMemo(() => {
    if (!page) {
      return null;
    }

    const draftBlock: LinkPageBlock = {
      type: 'link-block',
      id: blockId || activeBlock?.id || createBlockId('link'),
      visible: activeBlock?.visible !== false,
      layout,
      links: links.filter((item) => item.url.trim()),
    };

    return buildPreviewPage(page, draftBlock);
  }, [activeBlock?.id, activeBlock?.visible, blockId, layout, links, page]);

  function updateLink(id: string, patch: Partial<LinkItem>) {
    setLinks((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function addLink() {
    setLinks((current) => [...current, createEmptyLink()]);
  }

  function removeLink(id: string) {
    setLinks((current) => (current.length <= 1 ? current : current.filter((item) => item.id !== id)));
  }

  async function fetchMetadata(id: string, rawUrl: string) {
    const url = rawUrl.trim();
    if (!url) {
      setError('Vui lòng nhập URL trước.');
      return;
    }

    setFetchingId(id);
    setError('');

    try {
      const preview = await fetchLinkPreview(url);
      updateLink(id, {
        url: preview.url,
        title: preview.title,
        description: preview.description,
        thumbnailUrl: preview.thumbnailUrl,
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Không thể lấy metadata từ link');
    } finally {
      setFetchingId('');
    }
  }

  async function saveBlock() {
    if (!page?.id) {
      setError('Không tìm thấy page để lưu block.');
      return;
    }

    const validLinks = links.filter((item) => item.url.trim());
    if (validLinks.length === 0) {
      setError('Bạn cần thêm ít nhất 1 link hợp lệ.');
      return;
    }

    setSaving(true);
    setError('');
    setNotice('');

    try {
      const block: LinkPageBlock = {
        type: 'link-block',
        id: blockId || activeBlock?.id || createBlockId('link'),
        visible: activeBlock?.visible !== false,
        layout,
        links: validLinks,
      };

      const updatedPage = await updatePage(page.id, {
        blocks: upsertContentBlock(page, block),
      });

      setPage(updatedPage);
      setNotice('Đã lưu Link Block.');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Không thể lưu block');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <DashboardShell onSignOut={signOut}>
        <p>Đang tải Link Block...</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell onSignOut={signOut}>
      <DashboardBuilderLayout page={page} previewPage={previewPage} loading={loading} error={error}>
        <div className="content-block-editor">
        <header className="content-block-editor-head">
          <div>
            <p className="eyebrow">Content Block</p>
            <h2>Link Block</h2>
            <p className="muted-copy">Điền link để tự động lấy thumbnail, tiêu đề và mô tả.</p>
          </div>
          <button type="button" className="btn btn-dark" onClick={() => void saveBlock()} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu block'}
          </button>
        </header>

        <div className="content-block-editor-card">
          <p className="content-block-section-title">Kiểu hiển thị</p>
          <div className="content-link-layout-grid">
            {LAYOUT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`content-link-layout-option ${layout === option.value ? 'is-active' : ''}`}
                onClick={() => setLayout(option.value)}
                aria-pressed={layout === option.value}
              >
                <span className={`content-link-layout-mock layout-mock-${option.value}`} aria-hidden="true" />
                <span className="content-link-layout-label">{option.label}</span>
              </button>
            ))}
          </div>

          <div className="content-block-links-head">
            <p className="content-block-section-title">Danh sách link</p>
            <button type="button" className="btn btn-secondary" onClick={addLink}>
              <PlusIcon className="icon-18" />
              Thêm link
            </button>
          </div>

          <div className="content-link-editor-list">
            {links.map((link) => (
              <div key={link.id} className="content-link-editor-item">
                <label>
                  <span>URL</span>
                  <div className="content-link-url-row">
                    <input
                      className="input"
                      value={link.url}
                      placeholder="https://example.com"
                      onChange={(event) => updateLink(link.id, { url: event.target.value })}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => void fetchMetadata(link.id, link.url)}
                      disabled={fetchingId === link.id}
                    >
                      <ArrowPathIcon className="icon-18" />
                      {fetchingId === link.id ? 'Đang lấy...' : 'Lấy metadata'}
                    </button>
                  </div>
                </label>

                <div className="content-link-preview-card">
                  {link.thumbnailUrl ? (
                    <img src={link.thumbnailUrl} alt={link.title || 'Thumbnail'} />
                  ) : (
                    <div className="content-link-preview-placeholder">
                      <LinkIcon className="icon-18" />
                    </div>
                  )}
                  <div>
                    <input
                      className="input"
                      value={link.title}
                      placeholder="Tiêu đề"
                      onChange={(event) => updateLink(link.id, { title: event.target.value })}
                    />
                    <textarea
                      className="input"
                      rows={2}
                      value={link.description}
                      placeholder="Mô tả"
                      onChange={(event) => updateLink(link.id, { description: event.target.value })}
                    />
                  </div>
                </div>

                <button type="button" className="btn btn-secondary" onClick={() => removeLink(link.id)}>
                  <TrashIcon className="icon-18" />
                  Xóa link
                </button>
              </div>
            ))}
          </div>
        </div>

        {notice ? <p className="field-success">{notice}</p> : null}
        {error ? <p className="field-error">{error}</p> : null}
        </div>
      </DashboardBuilderLayout>
    </DashboardShell>
  );
}
