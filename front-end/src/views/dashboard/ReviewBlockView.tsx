import { useEffect, useMemo, useRef, useState } from 'react';
import { PlusIcon, TrashIcon, UserCircleIcon } from '@heroicons/react/24/outline';

import { DashboardBuilderLayout } from '@/components/layout/DashboardBuilderLayout';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useAuth } from '@/hooks/useAuth';
import { useBlockEditorRoute } from '@/hooks/useBlockEditorRoute';
import type { ReviewBlockLayout, ReviewItem, ReviewPageBlock } from '@/models/content-blocks.model';
import { createBlockId, upsertContentBlock } from '@/utils/page-blocks';
import { buildPreviewPage } from '@/utils/preview-page';
import { uploadMediaImage } from '@/services/media.service';
import { updatePage } from '@/services/pages.service';

const LAYOUT_OPTIONS: Array<{ value: ReviewBlockLayout; label: string; mockClass: string }> = [
  { value: 'carousel', label: 'Carousel thẻ', mockClass: 'review-layout-mock-carousel' },
  { value: 'grid', label: 'Lưới avatar', mockClass: 'review-layout-mock-grid' },
  { value: 'featured', label: 'Spotlight', mockClass: 'review-layout-mock-featured' },
];

function createEmptyReview(): ReviewItem {
  return {
    id: `review-${Date.now().toString(36)}`,
    quote: '',
    authorName: '',
    authorTitle: '',
    avatarUrl: '',
    rating: 5,
  };
}

export default function ReviewBlockView() {
  const { signOut } = useAuth();
  const { page, setPage, loading, error, setError, ownerId, activeBlock, blockId } =
    useBlockEditorRoute<ReviewPageBlock>('review-block');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [layout, setLayout] = useState<ReviewBlockLayout>('carousel');
  const [reviews, setReviews] = useState<ReviewItem[]>([createEmptyReview()]);
  const [uploadingId, setUploadingId] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetId, setUploadTargetId] = useState('');

  useEffect(() => {
    if (!activeBlock) {
      return;
    }

    setTitle(activeBlock.title ?? '');
    setSubtitle(activeBlock.subtitle ?? '');
    setLayout(activeBlock.layout ?? 'carousel');
    setReviews(
      Array.isArray(activeBlock.reviews) && activeBlock.reviews.length > 0
        ? activeBlock.reviews
        : [createEmptyReview()],
    );
  }, [activeBlock]);

  const previewPage = useMemo(() => {
    if (!page) {
      return null;
    }

    const draftBlock: ReviewPageBlock = {
      type: 'review-block',
      id: blockId || activeBlock?.id || createBlockId('review'),
      visible: activeBlock?.visible !== false,
      title: title.trim(),
      subtitle: subtitle.trim(),
      layout,
      reviews: reviews.filter((item) => item.quote.trim()),
    };

    return buildPreviewPage(page, draftBlock);
  }, [activeBlock?.id, activeBlock?.visible, blockId, layout, page, reviews, subtitle, title]);

  function updateReview(id: string, patch: Partial<ReviewItem>) {
    setReviews((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function addReview() {
    setReviews((current) => [...current, createEmptyReview()]);
  }

  function removeReview(id: string) {
    setReviews((current) => (current.length <= 1 ? current : current.filter((item) => item.id !== id)));
  }

  function triggerAvatarUpload(id: string) {
    setUploadTargetId(id);
    fileInputRef.current?.click();
  }

  async function handleAvatarUpload(files: FileList | null) {
    const file = files?.[0];
    if (!file || !uploadTargetId) {
      return;
    }

    setUploadingId(uploadTargetId);
    setError('');

    try {
      const result = await uploadMediaImage(file, 'avatar', ownerId);
      updateReview(uploadTargetId, { avatarUrl: result.fileUrl });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Không thể tải ảnh');
    } finally {
      setUploadingId('');
      setUploadTargetId('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  async function saveBlock() {
    if (!page?.id) {
      setError('Không tìm thấy page để lưu block.');
      return;
    }

    const validReviews = reviews
      .map((item) => ({
        ...item,
        quote: item.quote.trim(),
        authorName: item.authorName.trim(),
        authorTitle: item.authorTitle?.trim() ?? '',
        avatarUrl: item.avatarUrl?.trim() ?? '',
        rating: Math.max(1, Math.min(5, Math.round(Number(item.rating ?? 5)))),
      }))
      .filter((item) => item.quote.length > 0);

    if (validReviews.length === 0) {
      setError('Bạn cần thêm ít nhất 1 đánh giá có nội dung.');
      return;
    }

    setSaving(true);
    setError('');
    setNotice('');

    try {
      const block: ReviewPageBlock = {
        type: 'review-block',
        id: blockId || activeBlock?.id || createBlockId('review'),
        visible: activeBlock?.visible !== false,
        title: title.trim(),
        subtitle: subtitle.trim(),
        layout,
        reviews: validReviews,
      };

      const updatedPage = await updatePage(page.id, {
        blocks: upsertContentBlock(page, block),
      });

      setPage(updatedPage);
      setNotice('Đã lưu block đánh giá khách hàng.');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Không thể lưu block');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <DashboardShell onSignOut={signOut}>
        <p>Đang tải block đánh giá...</p>
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
            <h2>Đánh giá khách hàng</h2>
            <p className="muted-copy">Thêm testimonial và chọn kiểu hiển thị phù hợp với trang.</p>
          </div>
          <button type="button" className="btn btn-dark" onClick={() => void saveBlock()} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu block'}
          </button>
        </header>

        <div className="content-block-editor-card">
          <div className="content-review-meta-grid">
            <label>
              <span>Tiêu đề block</span>
              <input className="input" value={title} placeholder="Khách hàng nói gì?" onChange={(event) => setTitle(event.target.value)} />
            </label>
            <label>
              <span>Phụ đề</span>
              <input className="input" value={subtitle} placeholder="Mô tả ngắn (tuỳ chọn)" onChange={(event) => setSubtitle(event.target.value)} />
            </label>
          </div>

          <p className="content-block-section-title">Kiểu hiển thị</p>
          <div className="content-review-layout-grid">
            {LAYOUT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`content-review-layout-option ${layout === option.value ? 'is-active' : ''}`}
                onClick={() => setLayout(option.value)}
                aria-pressed={layout === option.value}
              >
                <span className={`content-review-layout-mock ${option.mockClass}`} aria-hidden="true" />
                <span className="content-review-layout-label">{option.label}</span>
              </button>
            ))}
          </div>

          <div className="content-block-links-head">
            <p className="content-block-section-title">Danh sách đánh giá</p>
            <button type="button" className="btn btn-secondary" onClick={addReview}>
              <PlusIcon className="icon-18" />
              Thêm đánh giá
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => void handleAvatarUpload(event.target.files)}
          />

          <div className="content-review-editor-list">
            {reviews.map((review, index) => (
              <div key={review.id} className="content-review-editor-item">
                <p className="content-review-editor-item-title">Đánh giá {index + 1}</p>

                <label>
                  <span>Nội dung đánh giá</span>
                  <textarea
                    className="input"
                    rows={3}
                    value={review.quote}
                    placeholder="Nội dung testimonial..."
                    onChange={(event) => updateReview(review.id, { quote: event.target.value })}
                  />
                </label>

                <div className="content-review-editor-row">
                  <label>
                    <span>Tên khách hàng</span>
                    <input
                      className="input"
                      value={review.authorName}
                      placeholder="Lê Hoàng Nam"
                      onChange={(event) => updateReview(review.id, { authorName: event.target.value })}
                    />
                  </label>
                  <label>
                    <span>Chức danh / công ty</span>
                    <input
                      className="input"
                      value={review.authorTitle ?? ''}
                      placeholder="Giám đốc công ty"
                      onChange={(event) => updateReview(review.id, { authorTitle: event.target.value })}
                    />
                  </label>
                </div>

                <div className="content-review-editor-row">
                  <label>
                    <span>Số sao (Spotlight)</span>
                    <select
                      className="input"
                      value={review.rating ?? 5}
                      onChange={(event) => updateReview(review.id, { rating: Number(event.target.value) })}
                    >
                      {[5, 4, 3, 2, 1].map((value) => (
                        <option key={value} value={value}>
                          {value} sao
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Ảnh đại diện (URL)</span>
                    <input
                      className="input"
                      value={review.avatarUrl ?? ''}
                      placeholder="https://..."
                      onChange={(event) => updateReview(review.id, { avatarUrl: event.target.value })}
                    />
                  </label>
                </div>

                <div className="content-review-avatar-upload-row">
                  {review.avatarUrl?.trim() ? (
                    <img className="content-review-editor-avatar" src={review.avatarUrl} alt={review.authorName || 'Avatar'} />
                  ) : (
                    <span className="content-review-editor-avatar is-placeholder">
                      <UserCircleIcon className="icon-18" />
                    </span>
                  )}
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => triggerAvatarUpload(review.id)}
                    disabled={uploadingId === review.id}
                  >
                    {uploadingId === review.id ? 'Đang tải...' : 'Tải ảnh lên'}
                  </button>
                </div>

                <button type="button" className="btn btn-secondary" onClick={() => removeReview(review.id)}>
                  <TrashIcon className="icon-18" />
                  Xóa đánh giá
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
