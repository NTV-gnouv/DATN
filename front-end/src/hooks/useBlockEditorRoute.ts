import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import type { PageBlock } from '@/models/page.model';
import { findPageBlockById, getBlockId, resolveEditorBlock } from '@/utils/page-blocks';

import { useDashboardPage } from './useDashboardPage';

export function useBlockEditorRoute<T extends PageBlock>(expectedType: string) {
  const [searchParams] = useSearchParams();
  const blockIdParam = searchParams.get('blockId');
  const dashboard = useDashboardPage();

  const activeBlock = useMemo(
    () => resolveEditorBlock<T>(dashboard.page, expectedType, blockIdParam),
    [dashboard.page, blockIdParam, expectedType],
  );

  const blockId = activeBlock ? getBlockId(activeBlock) : blockIdParam ?? '';

  return {
    ...dashboard,
    activeBlock,
    blockId,
    blockIdParam,
  };
}

export function useBlockEditorRouteById<T extends PageBlock>(blockIdParam: string | null | undefined) {
  const dashboard = useDashboardPage();

  const activeBlock = useMemo(
    () => (blockIdParam ? findPageBlockById<T>(dashboard.page, blockIdParam) : null),
    [dashboard.page, blockIdParam],
  );

  return {
    ...dashboard,
    activeBlock,
    blockId: activeBlock ? getBlockId(activeBlock) : blockIdParam ?? '',
    blockIdParam,
  };
}
