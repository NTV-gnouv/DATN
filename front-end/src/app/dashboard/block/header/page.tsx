import { Navigate } from 'react-router-dom';

import { useDashboardPage } from '@/hooks/useDashboardPage';
import PageEditorView from '@/views/builder/PageEditorView';

export default function DashboardHeaderBlockPage() {
  const { page, loading } = useDashboardPage();

  if (loading) {
    return <p className="muted-copy">Đang tải trang...</p>;
  }

  if (!page?.id) {
    return <Navigate to="/onboarding/domain" replace />;
  }

  return <PageEditorView pageId={page.id} />;
}
