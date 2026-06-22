import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeftIcon, PencilSquareIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

import { DashboardBuilderLayout } from '@/components/layout/DashboardBuilderLayout';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useAuth } from '@/hooks/useAuth';
import { useBlockEditorRoute } from '@/hooks/useBlockEditorRoute';
import {
  ALBUM_BLOCK_MAX_CATEGORIES,
  ALBUM_DESCRIPTION_MAX_LENGTH,
  type AlbumImage,
  type AlbumItem,
  type AlbumPageBlock,
} from '@/models/content-blocks.model';
import {
  ALBUM_BLOCK_MAX_ALBUMS,
  ALBUM_BLOCK_MAX_IMAGES,
  clampAlbumDescription,
  createEmptyAlbum,
  getAlbumPreviewImage,
  normalizeAlbumBlock,
} from '@/utils/album-block.utils';
import { createBlockId, upsertContentBlock } from '@/utils/page-blocks';
import { buildPreviewPage } from '@/utils/preview-page';
import { uploadMediaImage } from '@/services/media.service';
import { updatePage } from '@/services/pages.service';

type EditorMode = 'list' | 'edit';

type DraftAlbum = AlbumItem;

function createAlbumImage(url: string): AlbumImage {
  return {
    id: createBlockId('album-img'),
    url,
    caption: '',
  };
}

export default function AlbumBlockView() {
  const { signOut } = useAuth();
  const { page, setPage, loading, error, setError, ownerId, activeBlock, blockId } =
    useBlockEditorRoute<AlbumPageBlock>('album-block');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [albums, setAlbums] = useState<AlbumItem[]>([]);
  const [mode, setMode] = useState<EditorMode>('list');
  const [editingAlbumId, setEditingAlbumId] = useState('');
  const [draftAlbum, setDraftAlbum] = useState<DraftAlbum>(createEmptyAlbum());
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [newAlbumDescription, setNewAlbumDescription] = useState('');
  const [newAlbumCategory, setNewAlbumCategory] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState('');
  const albumImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!activeBlock) {
      return;
    }

    const normalized = normalizeAlbumBlock(activeBlock);
    setTitle(normalized.title ?? '');
    setSubtitle(normalized.subtitle ?? '');
    setCategories(normalized.categories ?? []);
    setAlbums(normalized.albums);
    setMode('list');
    setEditingAlbumId('');
  }, [activeBlock]);

  const previewPage = useMemo(() => {
    if (!page) {
      return null;
    }

    const draftBlock: AlbumPageBlock = {
      type: 'album-block',
      id: blockId || activeBlock?.id || createBlockId('album'),
      visible: activeBlock?.visible !== false,
      title: title.trim(),
      subtitle: subtitle.trim(),
      categories,
      albums,
    };

    return buildPreviewPage(page, draftBlock);
  }, [activeBlock?.id, activeBlock?.visible, albums, blockId, categories, page, subtitle, title]);

  function addCategory() {
    const name = newCategoryName.trim();
    if (!name) {
      setError('Tên danh mục không được để trống.');
      return;
    }
    if (categories.length >= ALBUM_BLOCK_MAX_CATEGORIES) {
      setError(`Tối đa ${ALBUM_BLOCK_MAX_CATEGORIES} danh mục.`);
      return;
    }
    if (categories.some((item) => item.toLocaleLowerCase('vi') === name.toLocaleLowerCase('vi'))) {
      setError('Danh mục này đã tồn tại.');
      return;
    }

    setCategories((current) => [...current, name]);
    setNewCategoryName('');
    setError('');
  }

  function removeCategory(name: string) {
    setCategories((current) => current.filter((item) => item !== name));
    setAlbums((current) =>
      current.map((album) =>
        album.category === name ? { ...album, category: undefined } : album,
      ),
    );
    if (newAlbumCategory === name) {
      setNewAlbumCategory('');
    }
    if (draftAlbum.category === name) {
      setDraftAlbum((current) => ({ ...current, category: undefined }));
    }
  }

  function createAlbum() {
    const albumTitle = newAlbumTitle.trim();
    if (!albumTitle) {
      setError('Tên album là bắt buộc.');
      return;
    }
    if (albums.length >= ALBUM_BLOCK_MAX_ALBUMS) {
      setError(`Tối đa ${ALBUM_BLOCK_MAX_ALBUMS} album.`);
      return;
    }

    const album: AlbumItem = {
      id: createBlockId('album'),
      title: albumTitle,
      description: clampAlbumDescription(newAlbumDescription) || undefined,
      category: newAlbumCategory.trim() || undefined,
      images: [],
    };

    setAlbums((current) => [...current, album]);
    setDraftAlbum(album);
    setEditingAlbumId(album.id);
    setMode('edit');
    setNewAlbumTitle('');
    setNewAlbumDescription('');
    setNewAlbumCategory('');
    setNotice('Đã tạo album. Hãy tải ảnh (tối đa 5) rồi lưu album.');
    setError('');
  }

  function openAlbumEditor(album: AlbumItem) {
    setDraftAlbum({ ...album, images: [...album.images] });
    setEditingAlbumId(album.id);
    setMode('edit');
    setError('');
  }

  function backToList() {
    setMode('list');
    setEditingAlbumId('');
    setDraftAlbum(createEmptyAlbum());
  }

  function removeAlbum(id: string) {
    setAlbums((current) => current.filter((item) => item.id !== id));
    if (editingAlbumId === id) {
      backToList();
    }
  }

  function updateDraft(patch: Partial<DraftAlbum>) {
    const nextPatch = { ...patch };
    if (typeof nextPatch.description === 'string') {
      nextPatch.description = clampAlbumDescription(nextPatch.description);
    }
    setDraftAlbum((current) => ({ ...current, ...nextPatch }));
  }

  function removeDraftImage(id: string) {
    setDraftAlbum((current) => ({
      ...current,
      images: current.images.filter((item) => item.id !== id),
    }));
  }

  async function uploadImages(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    const remaining = ALBUM_BLOCK_MAX_IMAGES - draftAlbum.images.length;
    if (remaining <= 0) {
      setError(`Mỗi album tối đa ${ALBUM_BLOCK_MAX_IMAGES} ảnh.`);
      return;
    }

    setUploading(true);
    setError('');

    try {
      const uploaded: AlbumImage[] = [];
      for (const file of Array.from(files).slice(0, remaining)) {
        const result = await uploadMediaImage(file, 'background', ownerId);
        uploaded.push(createAlbumImage(result.fileUrl));
      }

      setDraftAlbum((current) => ({
        ...current,
        images: [...current.images, ...uploaded].slice(0, ALBUM_BLOCK_MAX_IMAGES),
      }));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Không thể tải ảnh');
    } finally {
      setUploading(false);
      if (albumImageInputRef.current) {
        albumImageInputRef.current.value = '';
      }
    }
  }

  const canUploadMoreImages = draftAlbum.images.length < ALBUM_BLOCK_MAX_IMAGES;

  function handleNewAlbumDescriptionChange(value: string) {
    setNewAlbumDescription(clampAlbumDescription(value));
  }

  function saveDraftAlbum() {
    const albumTitle = draftAlbum.title.trim();
    if (!albumTitle) {
      setError('Tên album là bắt buộc.');
      return;
    }
    if (draftAlbum.images.length === 0) {
      setError('Album cần ít nhất 1 ảnh.');
      return;
    }

    const normalized: AlbumItem = {
      ...draftAlbum,
      title: albumTitle,
      description: clampAlbumDescription(draftAlbum.description ?? '') || undefined,
      category: draftAlbum.category?.trim() || undefined,
      images: draftAlbum.images.slice(0, ALBUM_BLOCK_MAX_IMAGES),
    };

    setAlbums((current) => {
      const index = current.findIndex((item) => item.id === normalized.id);
      if (index >= 0) {
        const next = [...current];
        next[index] = normalized;
        return next;
      }
      return [...current, normalized];
    });

    setNotice('Đã cập nhật album trong bản nháp. Nhấn Lưu block để áp dụng lên trang.');
    backToList();
  }

  async function saveBlock() {
    if (!page?.id) {
      setError('Không tìm thấy page để lưu block.');
      return;
    }

    const validAlbums = albums
      .map((album) => normalizeAlbumBlock({ type: 'album-block', id: 'tmp', albums: [album] }).albums[0])
      .filter((album): album is AlbumItem => Boolean(album));

    if (validAlbums.length === 0) {
      setError('Bạn cần ít nhất 1 album có ảnh.');
      return;
    }

    setSaving(true);
    setError('');
    setNotice('');

    try {
      const block: AlbumPageBlock = {
        type: 'album-block',
        id: blockId || activeBlock?.id || createBlockId('album'),
        visible: activeBlock?.visible !== false,
        title: title.trim(),
        subtitle: subtitle.trim(),
        categories,
        albums: validAlbums,
      };

      const updatedPage = await updatePage(page.id, {
        blocks: upsertContentBlock(page, block),
      });

      setPage(updatedPage);
      setAlbums(validAlbums);
      setCategories(normalizeAlbumBlock(block).categories ?? []);
      setNotice('Đã lưu block album ảnh.');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Không thể lưu block');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <DashboardShell onSignOut={signOut}>
        <p>Đang tải block album...</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell onSignOut={signOut}>
      <DashboardBuilderLayout page={page} previewPage={previewPage} loading={loading} error={error}>
        <div className="content-block-editor album-block-editor">
          <header className="content-block-editor-head">
            <div>
              <p className="eyebrow">Content Block</p>
              <h2>Album ảnh</h2>
              <p className="muted-copy">
                Tạo tối đa {ALBUM_BLOCK_MAX_ALBUMS} album, mỗi album tối đa {ALBUM_BLOCK_MAX_IMAGES} ảnh.
              </p>
            </div>
            <button type="button" className="btn btn-dark" onClick={() => void saveBlock()} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu block'}
            </button>
          </header>

          {notice ? <p className="notice-copy">{notice}</p> : null}

          <div className="content-block-editor-card album-block-card">
            <div className="gallery-block-headline-grid">
              <label>
                <span>Tiêu đề block</span>
                <input className="input" value={title} placeholder="Bộ sưu tập ảnh" onChange={(event) => setTitle(event.target.value)} />
              </label>
              <label>
                <span>Phụ đề</span>
                <input className="input" value={subtitle} placeholder="Mô tả ngắn (tuỳ chọn)" onChange={(event) => setSubtitle(event.target.value)} />
              </label>
            </div>

            <section className="album-block-categories">
              <div className="album-block-create-head">
                <div>
                  <h3>Danh mục</h3>
                  <p className="muted-copy">Tạo danh mục riêng, sau đó gán cho từng album.</p>
                </div>
                <span className="muted-copy">
                  {categories.length} / {ALBUM_BLOCK_MAX_CATEGORIES}
                </span>
              </div>

              <div className="album-block-category-form">
                <input
                  className="input"
                  value={newCategoryName}
                  placeholder="Tên danh mục mới"
                  disabled={categories.length >= ALBUM_BLOCK_MAX_CATEGORIES}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      addCategory();
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-dark"
                  disabled={categories.length >= ALBUM_BLOCK_MAX_CATEGORIES}
                  onClick={addCategory}
                >
                  <PlusIcon className="icon-16" aria-hidden="true" />
                  Thêm danh mục
                </button>
              </div>

              {categories.length > 0 ? (
                <div className="album-block-category-list">
                  {categories.map((category) => (
                    <span key={category} className="album-block-category-chip">
                      {category}
                      <button type="button" aria-label={`Xóa danh mục ${category}`} onClick={() => removeCategory(category)}>
                        <TrashIcon className="icon-12" aria-hidden="true" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="muted-copy">Chưa có danh mục nào.</p>
              )}
            </section>

            {mode === 'list' ? (
              <>
                <div className="album-block-list">
                  {albums.length === 0 ? <p className="muted-copy">Chưa có album nào.</p> : null}
                  {albums.map((album) => {
                    const cover = getAlbumPreviewImage(album);
                    return (
                      <article key={album.id} className="album-block-list-item">
                        {cover ? <img className="album-block-list-thumb" src={cover} alt={album.title} /> : <div className="album-block-list-thumb is-empty" />}
                        <div className="album-block-list-copy">
                          <strong>{album.title}</strong>
                          <span className="muted-copy">
                            {[album.category, `${album.images.length} ảnh`].filter(Boolean).join(' • ')}
                          </span>
                        </div>
                        <div className="album-block-list-actions">
                          <button type="button" className="btn btn-outline btn-sm" onClick={() => openAlbumEditor(album)}>
                            <PencilSquareIcon className="icon-16" aria-hidden="true" />
                            Sửa
                          </button>
                          <button type="button" className="album-block-delete-btn" aria-label="Xóa album" onClick={() => removeAlbum(album.id)}>
                            <TrashIcon className="icon-16" aria-hidden="true" />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <section className="album-block-create">
                  <div className="album-block-create-head">
                    <h3>Tạo album mới</h3>
                    <span className="muted-copy">
                      Giới hạn: {albums.length} / {ALBUM_BLOCK_MAX_ALBUMS}
                    </span>
                  </div>

                  <label>
                    <span>Tên album *</span>
                    <input
                      className="input"
                      value={newAlbumTitle}
                      placeholder="Tên album"
                      disabled={albums.length >= ALBUM_BLOCK_MAX_ALBUMS}
                      onChange={(event) => setNewAlbumTitle(event.target.value)}
                    />
                  </label>

                  <label>
                    <span>Mô tả (không bắt buộc)</span>
                    <textarea
                      className="input album-block-textarea"
                      rows={3}
                      maxLength={ALBUM_DESCRIPTION_MAX_LENGTH}
                      value={newAlbumDescription}
                      placeholder="Mô tả ngắn về album"
                      disabled={albums.length >= ALBUM_BLOCK_MAX_ALBUMS}
                      onChange={(event) => handleNewAlbumDescriptionChange(event.target.value)}
                    />
                    <span className="album-block-char-count muted-copy">
                      {newAlbumDescription.length} / {ALBUM_DESCRIPTION_MAX_LENGTH}
                    </span>
                  </label>

                  <label>
                    <span>Danh mục</span>
                    <select
                      className="input"
                      value={newAlbumCategory}
                      disabled={albums.length >= ALBUM_BLOCK_MAX_ALBUMS || categories.length === 0}
                      onChange={(event) => setNewAlbumCategory(event.target.value)}
                    >
                      <option value="">{categories.length === 0 ? 'Hãy tạo danh mục trước' : 'Chọn danh mục...'}</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button
                    type="button"
                    className="btn btn-dark album-block-create-btn"
                    disabled={albums.length >= ALBUM_BLOCK_MAX_ALBUMS}
                    onClick={() => void createAlbum()}
                  >
                    <PlusIcon className="icon-16" aria-hidden="true" />
                    Tạo album
                  </button>
                </section>
              </>
            ) : (
              <section className="album-block-edit">
                <button type="button" className="album-block-back-link" onClick={backToList}>
                  <ArrowLeftIcon className="icon-16" aria-hidden="true" />
                  Quay lại danh sách
                </button>

                <h3>Chỉnh sửa nội dung Album</h3>

                <label>
                  <span>Tên album *</span>
                  <input className="input" value={draftAlbum.title} onChange={(event) => updateDraft({ title: event.target.value })} />
                </label>

                <label>
                  <span>Mô tả</span>
                  <textarea
                    className="input album-block-textarea"
                    rows={3}
                    maxLength={ALBUM_DESCRIPTION_MAX_LENGTH}
                    value={draftAlbum.description ?? ''}
                    onChange={(event) => updateDraft({ description: event.target.value })}
                  />
                  <span className="album-block-char-count muted-copy">
                    {(draftAlbum.description ?? '').length} / {ALBUM_DESCRIPTION_MAX_LENGTH}
                  </span>
                </label>

                <label>
                  <span>Danh mục</span>
                  <select
                    className="input"
                    value={draftAlbum.category ?? ''}
                    disabled={categories.length === 0}
                    onChange={(event) => updateDraft({ category: event.target.value })}
                  >
                    <option value="">{categories.length === 0 ? 'Hãy tạo danh mục trước' : 'Chọn danh mục...'}</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="album-block-images-head">
                  <h4>Ảnh album</h4>
                  <span className="muted-copy">
                    {draftAlbum.images.length} / {ALBUM_BLOCK_MAX_IMAGES}
                  </span>
                </div>

                <div className="album-block-image-grid">
                  {draftAlbum.images.map((image) => (
                    <div key={image.id} className="album-block-image-item">
                      <img src={image.url} alt={image.caption || 'Ảnh album'} />
                      <div className="album-block-image-actions">
                        <button
                          type="button"
                          className="album-block-image-delete"
                          aria-label="Xóa ảnh"
                          onClick={() => removeDraftImage(image.id)}
                        >
                          <TrashIcon className="icon-16" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {canUploadMoreImages ? (
                    <button
                      type="button"
                      className="album-block-image-upload"
                      disabled={uploading}
                      onClick={() => albumImageInputRef.current?.click()}
                    >
                      <PlusIcon className="icon-18" aria-hidden="true" />
                      <span>{uploading ? 'Đang tải...' : 'Tải ảnh'}</span>
                      <span className="album-block-image-upload-hint">Tối đa {ALBUM_BLOCK_MAX_IMAGES} ảnh</span>
                    </button>
                  ) : null}
                </div>

                <button type="button" className="btn btn-dark album-block-save-album-btn" onClick={saveDraftAlbum}>
                  Lưu album
                </button>
              </section>
            )}
          </div>

          <input
            ref={albumImageInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(event) => void uploadImages(event.target.files)}
          />
        </div>
      </DashboardBuilderLayout>
    </DashboardShell>
  );
}
