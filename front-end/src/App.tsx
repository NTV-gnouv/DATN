import { type PropsWithChildren } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import DashboardPage from './app/dashboard/page';
import DashboardAiChatPage from './app/dashboard/ai-chat/page';
import DashboardAlbumBlockPage from './app/dashboard/block/album/page';
import DashboardContactFormBlockPage from './app/dashboard/block/contact-form/page';
import DashboardGalleryBlockPage from './app/dashboard/block/gallery/page';
import DashboardHeaderBlockPage from './app/dashboard/block/header/page';
import DashboardLinkBlockPage from './app/dashboard/block/link/page';
import DashboardReviewBlockPage from './app/dashboard/block/review/page';
import DashboardTextBlockPage from './app/dashboard/block/text/page';
import DashboardAnalyticsContactFormPage from './app/dashboard/analytics/contact-form/page';
import DashboardAnalyticsOverviewPage from './app/dashboard/analytics/overview/page';
import OnboardingChatPage from './app/onboarding/chat/page';
import OnboardingDomainPage from './app/onboarding/domain/page';
import { RequireOnboardingComplete, RequireOnboardingStep } from './components/auth/OnboardingGuards';
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

function AuthenticatedApp({ children }: PropsWithChildren) {
  return (
    <RequireAuth>
      <RequireOnboardingComplete>{children}</RequireOnboardingComplete>
    </RequireAuth>
  );
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
        path="/onboarding/domain"
        element={
          <RequireAuth>
            <RequireOnboardingStep step="domain">
              <OnboardingDomainPage />
            </RequireOnboardingStep>
          </RequireAuth>
        }
      />
      <Route
        path="/onboarding/chat"
        element={
          <RequireAuth>
            <RequireOnboardingStep step="chat">
              <OnboardingChatPage />
            </RequireOnboardingStep>
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard"
        element={
          <AuthenticatedApp>
            <DashboardPage />
          </AuthenticatedApp>
        }
      />
      <Route
        path="/dashboard/ai-chat"
        element={
          <AuthenticatedApp>
            <DashboardAiChatPage />
          </AuthenticatedApp>
        }
      />
      <Route path="/dashboard/design" element={<Navigate to="/dashboard/block/header" replace />} />
      <Route
        path="/dashboard/block/header"
        element={
          <AuthenticatedApp>
            <DashboardHeaderBlockPage />
          </AuthenticatedApp>
        }
      />
      <Route
        path="/dashboard/block/contact-form"
        element={
          <AuthenticatedApp>
            <DashboardContactFormBlockPage />
          </AuthenticatedApp>
        }
      />
      <Route
        path="/dashboard/block/text"
        element={
          <AuthenticatedApp>
            <DashboardTextBlockPage />
          </AuthenticatedApp>
        }
      />
      <Route
        path="/dashboard/block/gallery"
        element={
          <AuthenticatedApp>
            <DashboardGalleryBlockPage />
          </AuthenticatedApp>
        }
      />
      <Route
        path="/dashboard/block/album"
        element={
          <AuthenticatedApp>
            <DashboardAlbumBlockPage />
          </AuthenticatedApp>
        }
      />
      <Route
        path="/dashboard/block/link"
        element={
          <AuthenticatedApp>
            <DashboardLinkBlockPage />
          </AuthenticatedApp>
        }
      />
      <Route
        path="/dashboard/block/review"
        element={
          <AuthenticatedApp>
            <DashboardReviewBlockPage />
          </AuthenticatedApp>
        }
      />
      <Route path="/dashboard/pages/new" element={<Navigate to="/onboarding/domain" replace />} />
      <Route path="/dashboard/analytics" element={<Navigate to="/dashboard/analytics/overview" replace />} />
      <Route
        path="/dashboard/analytics/overview"
        element={
          <AuthenticatedApp>
            <DashboardAnalyticsOverviewPage />
          </AuthenticatedApp>
        }
      />
      <Route
        path="/dashboard/analytics/contact-form"
        element={
          <AuthenticatedApp>
            <DashboardAnalyticsContactFormPage />
          </AuthenticatedApp>
        }
      />
      <Route
        path="/editor/:pageId"
        element={
          <AuthenticatedApp>
            <EditorPage />
          </AuthenticatedApp>
        }
      />
      <Route path="/:slug" element={<PublicUserPage />} />
    </Routes>
  );
}
