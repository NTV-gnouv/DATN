import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bars3Icon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

import { getBlockCatalogItem, getBlockDisplayTitle, getBlockEditorPath } from '@/config/block-catalog';
import type { PageBlock } from '@/models/page.model';
import { getBlockId, isBlockVisible } from '@/utils/page-blocks';

type DashboardBlockListProps = {
  contentBlocks: PageBlock[];
  togglingBlockId?: string;
  deletingBlockId?: string;
  reordering?: boolean;
  onToggleVisibility: (blockId: string) => void;
  onDelete: (blockId: string) => void;
  onReorder: (orderedIds: string[]) => void;
};

function getBlockLabel(block: PageBlock, sameTypeIndex: number): string {
  return getBlockDisplayTitle(String(block.type ?? ''), sameTypeIndex);
}

export function DashboardBlockList({
  contentBlocks,
  togglingBlockId = '',
  deletingBlockId = '',
  reordering = false,
  onToggleVisibility,
  onDelete,
  onReorder,
}: DashboardBlockListProps) {
  const [draggingId, setDraggingId] = useState('');
  const [dragOverId, setDragOverId] = useState('');

  const typeCounts = new Map<string, number>();

  function handleDrop(targetId: string) {
    if (!draggingId || draggingId === targetId) {
      setDraggingId('');
      setDragOverId('');
      return;
    }

    const ids = contentBlocks.map((block) => getBlockId(block));
    const fromIndex = ids.indexOf(draggingId);
    const toIndex = ids.indexOf(targetId);
    if (fromIndex < 0 || toIndex < 0) {
      setDraggingId('');
      setDragOverId('');
      return;
    }

    const nextIds = [...ids];
    const [moved] = nextIds.splice(fromIndex, 1);
    nextIds.splice(toIndex, 0, moved);
    onReorder(nextIds);
    setDraggingId('');
    setDragOverId('');
  }

  return (
    <div className="dashboard-home-block-list">
      <Link to="/dashboard/block/header" className="block-card block-card-link block-card-home block-card-header">
        <div className="block-card-icon" aria-hidden="true">
          <UserCircleIcon className="block-card-icon-svg" />
        </div>
        <div className="block-card-body">
          <div className="block-card-title">Header Block</div>
          <div className="block-card-desc">Mặc định — chỉ có 1 header</div>
        </div>
      </Link>

      {contentBlocks.length === 0 ? (
        <p className="dashboard-block-empty muted-copy">Chưa có block nào. Bấm Add block để thêm.</p>
      ) : null}

      {contentBlocks.map((block) => {
        const blockId = getBlockId(block);
        const type = String(block.type ?? '');
        const sameTypeIndex = typeCounts.get(type) ?? 0;
        typeCounts.set(type, sameTypeIndex + 1);

        const catalogItem = getBlockCatalogItem(type);
        const Icon = catalogItem?.Icon;
        const editorPath =
          catalogItem != null ? getBlockEditorPath(catalogItem.type, blockId) : '/dashboard';
        const visible = isBlockVisible(block);
        const isDragging = draggingId === blockId;
        const isDragOver = dragOverId === blockId;

        return (
          <div
            key={blockId}
            className={`block-card block-card-home block-card-managed${isDragging ? ' is-dragging' : ''}${isDragOver ? ' is-drag-over' : ''}${!visible ? ' is-hidden-block' : ''}`}
            draggable={!reordering}
            onDragStart={() => setDraggingId(blockId)}
            onDragEnd={() => {
              setDraggingId('');
              setDragOverId('');
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOverId(blockId);
            }}
            onDrop={(event) => {
              event.preventDefault();
              handleDrop(blockId);
            }}
          >
            <button
              type="button"
              className="block-card-drag"
              aria-label="Kéo để đổi vị trí"
              draggable
              onDragStart={() => setDraggingId(blockId)}
            >
              <Bars3Icon className="icon-18" aria-hidden="true" />
            </button>

            <Link to={editorPath} className="block-card-link-area">
              <div className="block-card-icon" aria-hidden="true">
                {Icon ? <Icon className="block-card-icon-svg" /> : null}
              </div>
              <div className="block-card-body">
                <div className="block-card-title">{getBlockLabel(block, sameTypeIndex)}</div>
              </div>
            </Link>

            <button
              type="button"
              className={`block-card-eye-btn${visible ? ' is-visible' : ' is-hidden'}`}
              aria-label={visible ? 'Ẩn block trên trang' : 'Hiện block trên trang'}
              disabled={togglingBlockId === blockId || deletingBlockId === blockId || reordering}
              onClick={() => onToggleVisibility(blockId)}
            >
              {visible ? (
                <EyeIcon className="block-card-eye" aria-hidden="true" />
              ) : (
                <EyeSlashIcon className="block-card-eye" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              className="block-card-delete-btn"
              aria-label="Xóa block"
              disabled={deletingBlockId === blockId || reordering}
              onClick={() => onDelete(blockId)}
            >
              <TrashIcon className="block-card-eye" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
