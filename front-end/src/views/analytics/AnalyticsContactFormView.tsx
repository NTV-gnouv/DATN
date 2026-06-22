import { useMemo } from 'react';

import { ContactFormSubmissionsPanel } from '@/components/analytics/ContactFormSubmissionsPanel';
import { Card } from '@/components/ui/Card';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { getDataSourceBlock } from '@/config/data-source-blocks';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardPage } from '@/hooks/useDashboardPage';
import { getContactFormIdFromPage } from '@/utils/contact-form-page';

export default function AnalyticsContactFormView() {
  const { signOut } = useAuth();
  const { page, loading } = useDashboardPage();
  const source = getDataSourceBlock('contact-form');
  const formId = useMemo(() => getContactFormIdFromPage(page), [page]);

  return (
    <DashboardShell onSignOut={signOut}>
      <div className="analytics-page">
        <header className="analytics-page-header">
          <p className="eyebrow">Analytics</p>
          <h2>{source?.label ?? 'Form liên hệ'}</h2>
          <p className="muted-copy">{source?.description ?? 'Dữ liệu khách hàng gửi qua biểu mẫu liên hệ.'}</p>
        </header>

        <Card className="analytics-detail-card">
          {loading ? (
            <p className="muted-copy">Đang tải...</p>
          ) : (
            <ContactFormSubmissionsPanel formId={formId} />
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}
