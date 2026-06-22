import type { ReactNode } from 'react';

import { DashboardPreviewPane } from '@/components/dashboard/DashboardPreviewPane';
import type { HeaderBlock } from '@/models/editor.model';
import type { LandingPage } from '@/models/page.model';

type DashboardBuilderLayoutProps = {
  children: ReactNode;
  page: LandingPage | null;
  previewPage?: LandingPage | null;
  headerBlock?: HeaderBlock | null;
  themeTokens?: Record<string, unknown> | null;
  loading?: boolean;
  error?: string;
  domainToolbar?: ReactNode;
  displayNameOverride?: string;
  bioOverride?: string;
  avatarOverride?: string;
  className?: string;
};

export function DashboardBuilderLayout({
  children,
  page,
  previewPage,
  headerBlock,
  themeTokens,
  loading,
  error,
  domainToolbar,
  displayNameOverride,
  bioOverride,
  avatarOverride,
  className,
}: DashboardBuilderLayoutProps) {
  return (
    <div className={`editor-layout dashboard-builder-layout${className ? ` ${className}` : ''}`}>
      <div className="editor-left-pane">{children}</div>
      <DashboardPreviewPane
        page={page}
        previewPage={previewPage}
        headerBlock={headerBlock}
        themeTokens={themeTokens}
        loading={loading}
        error={error}
        domainToolbar={domainToolbar}
        displayNameOverride={displayNameOverride}
        bioOverride={bioOverride}
        avatarOverride={avatarOverride}
      />
    </div>
  );
}
