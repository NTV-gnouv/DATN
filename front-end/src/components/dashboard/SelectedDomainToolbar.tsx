import { ArrowTopRightOnSquareIcon, EyeIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

import { normalizeSlug } from '@/utils/slug';

type SelectedDomainEditableProps = {
  isEditing: boolean;
  onChange: (value: string) => void;
  onStartEdit: () => void;
  onBlur: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
};

type SelectedDomainToolbarProps = {
  slug: string;
  editable?: SelectedDomainEditableProps;
  onCopySuccess?: (message: string) => void;
  onCopyError?: (message: string) => void;
};

export function SelectedDomainToolbar({
  slug,
  editable,
  onCopySuccess,
  onCopyError,
}: SelectedDomainToolbarProps) {
  const navigate = useNavigate();
  const displaySlug = normalizeSlug(slug) || 'creator-page';

  const openPublicPage = () => {
    window.open(`/${displaySlug}`, '_blank', 'noopener,noreferrer');
  };

  const copyPublicLink = () => {
    const publicUrl = `${window.location.origin}/${displaySlug}`;
    void navigator.clipboard.writeText(publicUrl).then(
      () => {
        onCopySuccess?.('✓ Đã sao chép liên kết chia sẻ');
      },
      () => {
        onCopyError?.('Không thể sao chép liên kết');
      },
    );
  };

  const startEdit = () => {
    if (editable) {
      editable.onStartEdit();
      return;
    }
    navigate('/dashboard/block/header');
  };

  return (
    <div className="editor-domain-toolbar">
      <div className="editor-domain-stack">
        <p className="eyebrow">Selected domain</p>
        <div className="editor-domain-control">
          <span className="editor-domain-prefix">/</span>
          {editable?.isEditing ? (
            <input
              className="input editor-domain-input"
              value={slug}
              autoFocus
              onChange={(event) => editable.onChange(event.target.value)}
              onBlur={editable.onBlur}
              onKeyDown={editable.onKeyDown}
              aria-label="Chỉnh sửa slug"
            />
          ) : (
            <button type="button" className="editor-domain-slug" onClick={startEdit} aria-label="Chỉnh sửa slug">
              {displaySlug}
            </button>
          )}
        </div>
      </div>

      <div className="editor-preview-actions">
        <button
          type="button"
          className="btn btn-secondary editor-quick-btn"
          aria-label="Chỉnh sửa slug"
          title="Chỉnh sửa slug"
          onClick={startEdit}
        >
          <PencilSquareIcon className="icon-18" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="btn btn-secondary editor-quick-btn"
          aria-label="Xem trang công khai"
          title="Xem trang công khai"
          onClick={openPublicPage}
        >
          <EyeIcon className="icon-18" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="btn btn-dark editor-share-btn"
          aria-label="Sao chép liên kết"
          title="Sao chép liên kết"
          onClick={copyPublicLink}
        >
          <ArrowTopRightOnSquareIcon className="icon-18" aria-hidden="true" />
          Share
        </button>
      </div>
    </div>
  );
}
