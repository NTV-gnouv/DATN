import { XMarkIcon } from '@heroicons/react/24/outline';

import { ADDABLE_BLOCK_CATALOG, type AddableBlockType } from '@/config/block-catalog';

type AddBlockModalProps = {
  open: boolean;
  adding?: AddableBlockType | null;
  onClose: () => void;
  onSelect: (type: AddableBlockType) => void;
};

export function AddBlockModal({ open, adding, onClose, onSelect }: AddBlockModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="dashboard-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="dashboard-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Thêm block"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dashboard-modal-header">
          <div>
            <p className="eyebrow">Blocks</p>
            <h3>Chọn block để thêm</h3>
          </div>
          <button type="button" className="btn btn-secondary dashboard-modal-close" onClick={onClose} aria-label="Đóng">
            <XMarkIcon className="icon-18" aria-hidden="true" />
          </button>
        </div>

        <div className="dashboard-modal-body">
          <p className="muted-copy">Bạn có thể thêm nhiều block cùng loại. Mỗi block có ID riêng.</p>
          <div className="dashboard-add-block-grid">
            {ADDABLE_BLOCK_CATALOG.map((item) => {
              const Icon = item.Icon;
              const isAdding = adding === item.type;
              return (
                <button
                  key={item.type}
                  type="button"
                  className="dashboard-add-block-option"
                  disabled={Boolean(adding)}
                  onClick={() => onSelect(item.type)}
                >
                  <span className="dashboard-add-block-option-icon" aria-hidden="true">
                    <Icon className="block-card-icon-svg" />
                  </span>
                  <span className="dashboard-add-block-option-copy">
                    <strong>{item.title}</strong>
                    <span>{item.description}</span>
                  </span>
                  {isAdding ? <span className="dashboard-add-block-option-status">Đang thêm...</span> : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
