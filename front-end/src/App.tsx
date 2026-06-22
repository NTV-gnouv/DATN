import { type PropsWithChildren } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import DashboardPage from './app/dashboard/page';
import DashboardAiChatPage from './app/dashboard/ai-chat/page';
import DashboardContactFormBlockPage from './app/dashboard/block/contact-form/page';
import DashboardGalleryBlockPage from './app/dashboard/block/gallery/page';
import DashboardHeaderBlockPage from './app/dashboard/block/header/page';
import DashboardLinkBlockPage from './app/dashboard/block/link/page';
import DashboardReviewBlockPage from './app/dashboard/block/review/page';
import DashboardTextBlockPage from './app/dashboard/block/text/page';
import DashboardAnalyticsContactFormPage from './app/dashboard/analytics/contact-form/page';
import DashboardAnalyticsOverviewPage from './app/dashboard/analytics/overview/page';
import DashboardNewPage from './app/dashboard/pages/new/page';
import EditorPage from './app/editor/[pageId]/page';
import ForgotPasswordPage from './app/forgot-password/page';
import LoginPage from './app/login/page';
import RegisterPage from './app/register/page';
import ResetPasswordPage from './app/reset-password/page';
import PublicUserPage from './app/[username]/page';
import { loadSession } from './services/auth.service';

function RequireAuth({ children }: PropsWithChildren) {
  const session = loadSession();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard/ai-chat"
        element={
          <RequireAuth>
            <DashboardAiChatPage />
          </RequireAuth>
        }
      />
      <Route path="/dashboard/design" element={<Navigate to="/dashboard/block/header" replace />} />
      <Route
        path="/dashboard/block/header"
        element={
          <RequireAuth>
            <DashboardHeaderBlockPage />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard/block/contact-form"
        element={
          <RequireAuth>
            <DashboardContactFormBlockPage />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard/block/text"
        element={
          <RequireAuth>
            <DashboardTextBlockPage />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard/block/gallery"
        element={
          <RequireAuth>
            <DashboardGalleryBlockPage />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard/block/link"
        element={
          <RequireAuth>
            <DashboardLinkBlockPage />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard/block/review"
        element={
          <RequireAuth>
            <DashboardReviewBlockPage />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard/pages/new"
        element={
          <RequireAuth>
            <DashboardNewPage />
          </RequireAuth>
        }
      />
      <Route path="/dashboard/analytics" element={<Navigate to="/dashboard/analytics/overview" replace />} />
      <Route
        path="/dashboard/analytics/overview"
        element={
          <RequireAuth>
            <DashboardAnalyticsOverviewPage />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard/analytics/contact-form"
        element={
          <RequireAuth>
            <DashboardAnalyticsContactFormPage />
          </RequireAuth>
        }
      />
      <Route
        path="/editor/:pageId"
        element={
          <RequireAuth>
            <EditorPage />
          </RequireAuth>
        }
      />
      <Route path="/:slug" element={<PublicUserPage />} />
    </Routes>
  );
}
