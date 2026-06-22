import { useEffect, useRef, useState } from 'react';
import { Bars3Icon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

import { DashboardShell } from '@/components/layout/DashboardShell';
import { useAuth } from '@/hooks/useAuth';
import { useBlockEditorRoute } from '@/hooks/useBlockEditorRoute';
import type {
  GalleryAppearance,
  GalleryAspectRatio,
  GalleryImage,
  GalleryLayout,
  GalleryPageBlock,
} from '@/models/content-blocks.model';
import {
  GALLERY_ASPECT_RATIO_OPTIONS,
  GALLERY_IMAGE_SCALE_MAX,
  GALLERY_IMAGE_SCALE_MIN,
  clampGalleryImageScale,
  normalizeGalleryBlock,
} from '@/utils/gallery-block.utils';
import { createBlockId, getBlockId, upsertContentBlock } from '@/utils/page-blocks';
import { uploadMediaImage } from '@/services/media.service';
import { updatePage } from '@/services/pages.service';

type EditorTab = 'images' | 'layouts';

const LAYOUT_OPTIONS: Array<{ value: GalleryLayout; label: string; mockClass: string }> = [
  { value: 'column', label: 'Column', mockClass: 'gallery-layout-mock-column' },
  { value: 'carousel', label: 'Carousel', mockClass: 'gallery-layout-mock-carousel' },
];

const APPEARANCE_OPTIONS: Array<{ value: GalleryAppearance; label: string; mockClass: string }> = [
  { value: 'exposed', label: 'Exposed', mockClass: 'gallery-appearance-mock-exposed' },
  { value: 'collapsible', label: 'Collapsible', mockClass: 'gallery-appearance-mock-collapsible' },
];

export default function GalleryBlockView() {
  const { signOut } = useAuth();
  const { page, setPage, loading, error, setError, ownerId, activeBlock, blockId } =
    useBlockEditorRoute<GalleryPageBlock>('gallery');
  const [activeTab, setActiveTab] = useState<EditorTab>('images');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [layout, setLayout] = useState<GalleryLayout>('column');
  const [appearance, setAppearance] = useState<GalleryAppearance>('exposed');
  const [aspectRatio, setAspectRatio] = useState<GalleryAspectRatio>('auto');
  const [imageScale, setImageScale] = useState(100);
  const [visibleCount, setVisibleCount] = useState(6);
  const [showMoreLabel, setShowMoreLabel] = useState('Xem thêm');
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [draggingId, setDraggingId] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!activeBlock) {
      return;
    }

    const normalized = normalizeGalleryBlock(activeBlock);
    setTitle(normalized.title ?? '');
    setSubtitle(normalized.subtitle ?? '');
    setLayout(normalized.layout);
    setAppearance(normalized.appearance);
    setAspectRatio(normalized.aspectRatio);
    setImageScale(normalized.imageScale);
    setVisibleCount(normalized.visibleCount);
    setShowMoreLabel(normalized.showMoreLabel ?? 'Xem thêm');
    setImages(normalized.images);
  }, [activeBlock]);

  async function handleUpload(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    setUploading(true);
    setError('');

    try {
      const uploaded: GalleryImage[] = [];
      for (const file of Array.from(files)) {
        const result = await uploadMediaImage(file, 'background', ownerId);
        uploaded.push({
          id: `img-${Date.now().toString(36)}-${uploaded.length}`,
          url: result.fileUrl,
          caption: '',
          linkUrl: '',
        });
      }
      setImages((current) => [...current, ...uploaded]);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Không thể tải ảnh');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  function removeImage(id: string) {
    setImages((current) => current.filter((item) => item.id !== id));
  }

  function updateImage(id: string, patch: Partial<GalleryImage>) {
    setImages((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function reorderImages(sourceId: string, targetId: string) {
    if (!sourceId || !targetId || sourceId === targetId) {
      return;
    }

    setImages((current) => {
      const sourceIndex = current.findIndex((item) => item.id === sourceId);
      const targetIndex = current.findIndex((item) => item.id === targetId);
      if (sourceIndex < 0 || targetIndex < 0) {
        return current;
      }

      const next = [...current];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  }

  async function saveBlock() {
    if (!page?.id) {
      setError('Không tìm thấy page để lưu block.');
      return;
    }
    if (images.length === 0) {
      setError('Bạn cần thêm ít nhất 1 ảnh.');
      return;
    }

    setSaving(true);
    setError('');
    setNotice('');

    try {
      const block: GalleryPageBlock = {
        type: 'gallery',
        id: blockId || activeBlock?.id || createBlockId('gallery'),
        visible: activeBlock?.visible !== false,
        title,
        subtitle,
        layout,
        appearance,
        aspectRatio,
        imageScale: clampGalleryImageScale(imageScale),
        visibleCount,
        showMoreLabel,
        images,
        displayMode: layout === 'carousel' ? 'slider' : 'grid',
      };

      const updatedPage = await updatePage(page.id, {
        blocks: upsertContentBlock(page, block),
      });

      setPage(updatedPage);
      setNotice('Đã lưu Gallery Block.');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Không thể lưu block');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <DashboardShell onSignOut={signOut}>
        <p>Đang tải Gallery Block...</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell onSignOut={signOut}>
      <div className="content-block-editor gallery-block-editor">
        <header className="content-block-editor-head">
          <div>
            <p className="eyebrow">Content Block</p>
            <h2>Thư viện ảnh</h2>
            <p className="muted-copy">Tùy chỉnh layout, tỉ lệ ảnh, kích cỡ và cách hiển thị trên landing page.</p>
          </div>
          <button type="button" className="btn btn-dark" onClick={() => void saveBlock()} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu block'}
          </button>
        </header>

        <div className="content-block-editor-card gallery-block-card">
          <div className="gallery-block-headline-grid">
            <label>
              <span>Tiêu đề</span>
              <input className="input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" />
            </label>
            <label>
              <span>Phụ đề</span>
              <input
                className="input"
                value={subtitle}
                onChange={(event) => setSubtitle(event.target.value)}
                placeholder="Subtitle"
              />
            </label>
          </div>

          <div className="gallery-block-tabs">
            <button
              type="button"
              className={`gallery-block-tab ${activeTab === 'images' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('images')}
            >
              Ảnh
            </button>
            <button
              type="button"
              className={`gallery-block-tab ${activeTab === 'layouts' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('layouts')}
            >
              Layouts
            </button>
          </div>

          {activeTab === 'images' ? (
            <div className="gallery-block-panel">
              <section className="gallery-block-section">
                <p className="gallery-block-section-title">Aspect ratio</p>
                <div className="gallery-aspect-ratio-group">
                  {GALLERY_ASPECT_RATIO_OPTIONS.map((option) => (
                    <label key={option.value} className="gallery-aspect-ratio-option">
                      <input
                        type="radio"
                        name="gallery-aspect-ratio"
                        value={option.value}
                        checked={aspectRatio === option.value}
                        onChange={() => setAspectRatio(option.value)}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </section>

              <section className="gallery-block-section">
                <p className="gallery-block-section-title">Image scaling</p>
                <div className="editor-avatar-size-row gallery-scale-row">
                  <input
                    className="editor-avatar-size-slider"
                    type="range"
                    min={GALLERY_IMAGE_SCALE_MIN}
                    max={GALLERY_IMAGE_SCALE_MAX}
                    step={1}
                    value={imageScale}
                    onChange={(event) => setImageScale(clampGalleryImageScale(event.target.value))}
                  />
                  <div className="editor-avatar-size-value">
                    <span>{imageScale}</span>
                    <span>%</span>
                  </div>
                </div>
              </section>

              <section className="gallery-block-section">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(event) => void handleUpload(event.target.files)}
                />
                <button type="button" className="btn btn-dark gallery-add-image-btn" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  <PlusIcon className="icon-18" />
                  {uploading ? 'Đang tải ảnh...' : 'Thêm ảnh mới'}
                </button>

                {images.length === 0 ? (
                  <p className="muted-copy">Chưa có ảnh nào. Hãy tải ảnh lên để bắt đầu.</p>
                ) : (
                  <div className="gallery-image-list">
                    {images.map((image) => (
                      <div
                        key={image.id}
                        className={`gallery-image-card ${draggingId === image.id ? 'is-dragging' : ''}`}
                        draggable
                        onDragStart={() => setDraggingId(image.id)}
                        onDragEnd={() => setDraggingId('')}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => {
                          if (draggingId) {
                            reorderImages(draggingId, image.id);
                          }
                          setDraggingId('');
                        }}
                      >
                        <button type="button" className="gallery-image-drag-handle" aria-label="Kéo để sắp xếp">
                          <Bars3Icon className="icon-18" />
                        </button>
                        <div className="gallery-image-card-body">
                          <img src={image.url} alt={image.caption || 'Gallery'} />
                          <input
                            className="input"
                            value={image.linkUrl ?? ''}
                            placeholder="Image link (optional)"
                            onChange={(event) => updateImage(image.id, { linkUrl: event.target.value })}
                          />
                          <input
                            className="input"
                            value={image.caption ?? ''}
                            placeholder="Chú thích ảnh"
                            onChange={(event) => updateImage(image.id, { caption: event.target.value })}
                          />
                        </div>
                        <button type="button" className="gallery-image-delete-btn" onClick={() => removeImage(image.id)} aria-label="Xóa ảnh">
                          <TrashIcon className="icon-18" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          ) : (
            <div className="gallery-block-panel">
              <section className="gallery-block-section">
                <p className="gallery-block-section-title">Image layouts</p>
                <div className="gallery-layout-grid">
                  {LAYOUT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`gallery-layout-option ${layout === option.value ? 'is-active' : ''}`}
                      onClick={() => setLayout(option.value)}
                    >
                      <div className={`gallery-layout-mock ${option.mockClass}`} aria-hidden="true" />
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="gallery-block-section">
                <p className="gallery-block-section-title">Images block appearance</p>
                <div className="gallery-layout-grid gallery-appearance-grid">
                  {APPEARANCE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`gallery-layout-option ${appearance === option.value ? 'is-active' : ''}`}
                      onClick={() => setAppearance(option.value)}
                    >
                      <div className={`gallery-layout-mock ${option.mockClass}`} aria-hidden="true" />
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              {appearance === 'exposed' ? (
                <section className="gallery-block-section">
                  <div className="content-block-settings-grid">
                    <label>
                      <span>Số ảnh hiển thị trước</span>
                      <input
                        className="input"
                        type="number"
                        min={1}
                        max={24}
                        value={visibleCount}
                        onChange={(event) => setVisibleCount(Math.max(1, Number(event.target.value) || 1))}
                      />
                    </label>
                    <label>
                      <span>Nhãn nút xem thêm</span>
                      <input className="input" value={showMoreLabel} onChange={(event) => setShowMoreLabel(event.target.value)} />
                    </label>
                  </div>
                </section>
              ) : (
                <p className="muted-copy">Chế độ Collapsible cho phép người xem gấp gọn hoặc mở rộng block ảnh trên trang.</p>
              )}
            </div>
          )}
        </div>

        {notice ? <p className="field-success">{notice}</p> : null}
        {error ? <p className="field-error">{error}</p> : null}
      </div>
    </DashboardShell>
  );
}
