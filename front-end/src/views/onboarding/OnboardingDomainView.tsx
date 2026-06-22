import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { OnboardingShell } from '@/components/layout/OnboardingShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { usePages } from '@/hooks/usePages';
import { loadSession } from '@/services/auth.service';
import { saveOnboardingPageId } from '@/utils/onboarding';
import { normalizeSlug } from '@/utils/slug';

export default function OnboardingDomainView() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { createPage, verifySlug, error } = usePages();
  const session = loadSession();
  const suggestedSlug = useMemo(() => normalizeSlug(session?.user?.name || ''), [session?.user?.name]);
  const suggestedUsername = suggestedSlug || normalizeSlug(session?.user?.email?.split('@')[0] || '');
  const [slug, setSlug] = useState(suggestedSlug);
  const [slugState, setSlugState] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  return (
    <OnboardingShell
      step={1}
      title="Chọn domain cho trang của bạn"
      subtitle="Đây là đường dẫn công khai mà mọi người sẽ dùng để truy cập trang cá nhân."
      onSignOut={signOut}
    >
      <div className="onboarding-domain-layout">
        <Card className="onboarding-domain-card">
          <p className="eyebrow">Selected domain</p>
          <h2>Tạo đường dẫn trang đích</h2>
          <p className="muted-copy">Chọn slug duy nhất cho tài khoản. Bạn có thể đổi sau trong editor.</p>

          <form
            className="page-form"
            onSubmit={async (event) => {
              event.preventDefault();
              setSubmitError('');
              const normalizedSlug = normalizeSlug(slug);
              if (!normalizedSlug) {
                setSubmitError('Vui lòng nhập đường dẫn hợp lệ.');
                return;
              }

              setSubmitting(true);
              try {
                const isAvailable = await verifySlug(normalizedSlug);
                if (!isAvailable) {
                  setSlugState('taken');
                  setSubmitError('Slug này đã được dùng. Hãy thử một đường dẫn khác.');
                  return;
                }

                const page = await createPage({
                  title: session?.user?.name?.trim() || normalizedSlug,
                  slug: normalizedSlug,
                  username: suggestedUsername || normalizedSlug,
                  ownerId: session?.user?.id,
                  template: 'starter',
                  themeId: 'minimal',
                });
                saveOnboardingPageId(page.id);
                navigate('/onboarding/chat');
              } catch (caughtError) {
                setSubmitError(caughtError instanceof Error ? caughtError.message : 'Không thể tạo trang');
              } finally {
                setSubmitting(false);
              }
            }}
          >
            <Input
              label="Đường dẫn trang"
              value={slug}
              onChange={(event) => {
                setSlug(event.target.value);
                setSlugState('idle');
              }}
              onBlur={async () => {
                const normalizedSlug = normalizeSlug(slug);
                setSlug(normalizedSlug);
                if (!normalizedSlug) {
                  setSlugState('idle');
                  return;
                }

                setSlugState('checking');
                try {
                  const isAvailable = await verifySlug(normalizedSlug);
                  setSlugState(isAvailable ? 'available' : 'taken');
                } catch {
                  setSlugState('idle');
                }
              }}
              hint={`Xem trước: /${normalizeSlug(slug) || 'ten-trang'}`}
              status={slugState}
            />
            {error ? <p className="field-error field-error-block">{error}</p> : null}
            {submitError ? <p className="field-error field-error-block">{submitError}</p> : null}
            <div className="dashboard-actions">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Đang tạo...' : 'Tiếp tục'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </OnboardingShell>
  );
}
