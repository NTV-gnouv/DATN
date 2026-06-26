import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { OnboardingShell } from '@/components/layout/OnboardingShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { usePages } from '@/hooks/usePages';
import { loadSession } from '@/services/auth.service';
import { suggestDomain } from '@/services/pages.service';
import { saveOnboardingPageId } from '@/utils/onboarding';
import { normalizeSlug } from '@/utils/slug';

export default function OnboardingDomainView() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { createPage, verifySlug, error } = usePages();
  const session = loadSession();
  const baseSlug = useMemo(
    () => normalizeSlug(session?.user?.name || session?.user?.email?.split('@')[0] || ''),
    [session?.user?.email, session?.user?.name],
  );
  const [slug, setSlug] = useState(baseSlug);
  const [slugSuggestion, setSlugSuggestion] = useState('');
  const [slugState, setSlugState] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingSuggestion, setLoadingSuggestion] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        setLoadingSuggestion(true);
        const suggestion = await suggestDomain(baseSlug || 'creator');
        if (cancelled) {
          return;
        }
        setSlug(suggestion.slug);
        setSlugSuggestion(suggestion.slug);
        setSlugState('available');
      } catch {
        if (!cancelled && baseSlug) {
          setSlug(baseSlug);
        }
      } finally {
        if (!cancelled) {
          setLoadingSuggestion(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [baseSlug]);

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
          <p className="muted-copy">
            Hệ thống tự đề xuất domain duy nhất để tránh trùng với tài khoản khác. Bạn có thể chỉnh sửa trước khi tiếp tục.
          </p>

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
                  username: normalizedSlug,
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
              hint={
                loadingSuggestion
                  ? 'Đang đề xuất domain duy nhất...'
                  : slugSuggestion && slugSuggestion === normalizeSlug(slug)
                    ? `Đề xuất tự động: /${slugSuggestion}`
                    : `Xem trước: /${normalizeSlug(slug) || 'ten-trang'}`
              }
              status={slugState}
              disabled={loadingSuggestion}
            />
            {error ? <p className="field-error field-error-block">{error}</p> : null}
            {submitError ? <p className="field-error field-error-block">{submitError}</p> : null}
            <div className="dashboard-actions">
              <Button type="submit" disabled={submitting || loadingSuggestion}>
                {submitting ? 'Đang tạo...' : 'Tiếp tục'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </OnboardingShell>
  );
}
