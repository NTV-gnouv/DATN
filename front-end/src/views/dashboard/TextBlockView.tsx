import { useEffect, useMemo, useState } from 'react';

import { DashboardBuilderLayout } from '@/components/layout/DashboardBuilderLayout';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { useAuth } from '@/hooks/useAuth';
import { useBlockEditorRoute } from '@/hooks/useBlockEditorRoute';
import type { TextPageBlock } from '@/models/content-blocks.model';
import { createBlockId, getBlockId, upsertContentBlock } from '@/utils/page-blocks';
import { buildPreviewPage } from '@/utils/preview-page';
import { updatePage } from '@/services/pages.service';

export default function TextBlockView() {
  const { signOut } = useAuth();
  const { page, setPage, loading, error, setError, activeBlock, blockId } = useBlockEditorRoute<TextPageBlock>('text');
  const [content, setContent] = useState('<p>Nhập nội dung văn bản của bạn...</p>');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (activeBlock?.content) {
      setContent(activeBlock.content);
    }
  }, [activeBlock]);

  const previewPage = useMemo(() => {
    if (!page) {
      return null;
    }

    const draftBlock: TextPageBlock = {
      type: 'text',
      id: blockId || activeBlock?.id || createBlockId('text'),
      visible: activeBlock?.visible !== false,
      content,
    };

    return buildPreviewPage(page, draftBlock);
  }, [activeBlock?.id, activeBlock?.visible, blockId, content, page]);

  async function saveBlock() {
    if (!page?.id) {
      setError('Không tìm thấy page để lưu block.');
      return;
    }

    setSaving(true);
    setError('');
    setNotice('');

    try {
      const block: TextPageBlock = {
        type: 'text',
        id: blockId || activeBlock?.id || createBlockId('text'),
        visible: activeBlock?.visible !== false,
        content,
      };

      const updatedPage = await updatePage(page.id, {
        blocks: upsertContentBlock(page, block),
      });

      setPage(updatedPage);
      setNotice('Đã lưu Text Block.');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Không thể lưu block');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <DashboardShell onSignOut={signOut}>
        <p>Đang tải Text Block...</p>
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
            <h2>Text Block</h2>
            <p className="muted-copy">
              {blockId ? `Block ID: ${getBlockId(activeBlock ?? { type: 'text', id: blockId })}` : 'Thêm nội dung văn bản.'}
            </p>
          </div>
          <button type="button" className="btn btn-dark" onClick={() => void saveBlock()} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu block'}
          </button>
        </header>

        <div className="content-block-editor-card">
          <RichTextEditor value={content} onChange={setContent} />
        </div>

        {notice ? <p className="notice-copy">{notice}</p> : null}
        {error ? <p className="field-error">{error}</p> : null}
        </div>
      </DashboardBuilderLayout>
    </DashboardShell>
  );
}
