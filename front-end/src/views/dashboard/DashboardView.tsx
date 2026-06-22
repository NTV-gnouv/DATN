import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';

import { AddBlockModal } from '@/components/dashboard/AddBlockModal';
import { DashboardBlockList } from '@/components/dashboard/DashboardBlockList';
import { DashboardBuilderLayout } from '@/components/layout/DashboardBuilderLayout';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useAuth } from '@/hooks/useAuth';
import type { AddableBlockType } from '@/config/block-catalog';
import { getBlockDisplayTitle, getBlockEditorPath } from '@/config/block-catalog';
import type { PageBlock, LandingPage } from '@/models/page.model';
import { loadSession } from '@/services/auth.service';
import { getPageByUsername, updatePage } from '@/services/pages.service';
import {
  createDefaultBlock,
  getBlockId,
  getContentBlocks,
  normalizePageBlocks,
  reorderContentBlocks,
  removeContentBlock,
  toggleContentBlockVisibility,
  upsertContentBlock,
} from '@/utils/page-blocks';
import { getAccountUsernames } from '@/utils/onboarding';

export default function DashboardView() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const session = loadSession();
  const accountUsernames = useMemo(() => getAccountUsernames(session), [session]);
  const [page, setPage] = useState<LandingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addingBlockType, setAddingBlockType] = useState<AddableBlockType | null>(null);
  const [togglingBlockId, setTogglingBlockId] = useState('');
  const [deletingBlockId, setDeletingBlockId] = useState('');
  const [reordering, setReordering] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
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

        if (!cancelled) {
          setPage({
            ...loadedPage,
            blocks: normalizePageBlocks(loadedPage.blocks),
          });
        }
      } catch (caughtError) {
        if (!cancelled) {
          const message = caughtError instanceof Error ? caughtError.message : 'Không thể tải dashboard';
          setError(message);
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
  }, [accountUsernames]);

  const contentBlocks = useMemo(() => getContentBlocks(page?.blocks), [page?.blocks]);

  async function persistBlocks(nextBlocks: PageBlock[]) {
    if (!page?.id) {
      throw new Error('Không tìm thấy page để lưu block.');
    }
    const updatedPage = await updatePage(page.id, { blocks: nextBlocks });
    setPage({
      ...(updatedPage as LandingPage),
      blocks: normalizePageBlocks((updatedPage as LandingPage).blocks),
    });
  }

  async function handleAddBlock(type: AddableBlockType) {
    if (!page?.id) {
      setActionError('Không tìm thấy page để thêm block.');
      return;
    }

    setAddingBlockType(type);
    setActionError('');

    try {
      const block = createDefaultBlock(type);
      const nextBlocks = upsertContentBlock(page, block);
      await persistBlocks(nextBlocks);
      setIsAddModalOpen(false);
      navigate(getBlockEditorPath(type, getBlockId(block)));
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : 'Không thể thêm block');
    } finally {
      setAddingBlockType(null);
    }
  }

  async function handleToggleVisibility(blockId: string) {
    if (!page?.id) {
      return;
    }

    setTogglingBlockId(blockId);
    setActionError('');

    try {
      await persistBlocks(toggleContentBlockVisibility(page, blockId));
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : 'Không thể cập nhật block');
    } finally {
      setTogglingBlockId('');
    }
  }

  async function handleReorder(orderedIds: string[]) {
    if (!page?.id) {
      return;
    }

    setReordering(true);
    setActionError('');

    try {
      await persistBlocks(reorderContentBlocks(page, orderedIds));
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : 'Không thể sắp xếp block');
    } finally {
      setReordering(false);
    }
  }

  async function handleDeleteBlock(blockId: string) {
    if (!page?.id) {
      return;
    }

    const block = contentBlocks.find((item) => getBlockId(item) === blockId);
    const label = block ? getBlockDisplayTitle(String(block.type ?? ''), 0) : 'block này';
    const confirmed = window.confirm(`Xóa ${label}? Hành động này không thể hoàn tác.`);
    if (!confirmed) {
      return;
    }

    setDeletingBlockId(blockId);
    setActionError('');

    try {
      await persistBlocks(removeContentBlock(page, blockId));
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : 'Không thể xóa block');
    } finally {
      setDeletingBlockId('');
    }
  }

  return (
    <DashboardShell onSignOut={signOut}>
      <DashboardBuilderLayout page={page} loading={loading} error={error} className="dashboard-home-layout">
        <div className="dashboard-home-header">
          <h2>Link in Bio</h2>
        </div>
        <div className="dashboard-blocks-page">
          <button
            type="button"
            className="dashboard-add-block"
            aria-label="Add block"
            onClick={() => setIsAddModalOpen(true)}
          >
            <PlusIcon className="dashboard-add-block-icon" aria-hidden="true" />
            Add block
          </button>

          {actionError ? <p className="field-error">{actionError}</p> : null}

          <DashboardBlockList
            contentBlocks={contentBlocks}
            togglingBlockId={togglingBlockId}
            deletingBlockId={deletingBlockId}
            reordering={reordering}
            onToggleVisibility={(blockId) => void handleToggleVisibility(blockId)}
            onDelete={(blockId) => void handleDeleteBlock(blockId)}
            onReorder={(orderedIds) => void handleReorder(orderedIds)}
          />
        </div>
      </DashboardBuilderLayout>

      <AddBlockModal
        open={isAddModalOpen}
        adding={addingBlockType}
        onClose={() => {
          if (!addingBlockType) {
            setIsAddModalOpen(false);
          }
        }}
        onSelect={(type) => void handleAddBlock(type)}
      />
    </DashboardShell>
  );
}
