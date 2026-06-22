import type { ReactNode } from 'react';

import { PhonePagePreview } from '@/components/preview/PhonePagePreview';
import { useDashboardPreviewData } from '@/hooks/useDashboardPreviewData';
import type { HeaderBlock } from '@/models/editor.model';
import type { LandingPage } from '@/models/page.model';

import { SelectedDomainToolbar } from './SelectedDomainToolbar';

type DashboardPreviewPaneProps = {
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
  asAside?: boolean;
};

export function DashboardPreviewPaneShell({
  page,
  previewPage,
  headerBlock,
  themeTokens,
  loading = false,
  error = '',
  domainToolbar,
  displayNameOverride,
  bioOverride,
  avatarOverride,
}: DashboardPreviewPaneProps) {
  const resolvedPage = previewPage ?? page;
  const shouldLoadConfig = headerBlock === undefined && themeTokens === undefined;
  const previewData = useDashboardPreviewData(shouldLoadConfig ? page?.id : undefined);
  const resolvedHeaderBlock = headerBlock ?? previewData.headerBlock;
  const resolvedThemeTokens = themeTokens ?? previewData.themeTokens;
  const resolvedLoading = loading || (shouldLoadConfig && previewData.loading);
  const resolvedError = error || (shouldLoadConfig ? previewData.error : '');

  return (
    <div className="editor-right-pane-shell">
      {domainToolbar ?? <SelectedDomainToolbar slug={resolvedPage?.slug || page?.slug || 'creator-page'} />}
      <PhonePagePreview
        page={resolvedPage}
        headerBlock={resolvedHeaderBlock}
        themeTokens={resolvedThemeTokens}
        loading={resolvedLoading}
        error={resolvedError}
        displayNameOverride={displayNameOverride}
        bioOverride={bioOverride}
        avatarOverride={avatarOverride}
      />
    </div>
  );
}

export function DashboardPreviewPane(props: DashboardPreviewPaneProps) {
  if (props.asAside === false) {
    return <DashboardPreviewPaneShell {...props} />;
  }

  return (
    <aside className="editor-right-pane">
      <DashboardPreviewPaneShell {...props} />
    </aside>
  );
}
