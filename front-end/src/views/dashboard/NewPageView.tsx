import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { usePages } from '@/hooks/usePages';

function normalizeSlug(value: string) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function NewPageView() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { createPage, verifySlug, error, message } = usePages();
  const [title, setTitle] = useState('Trang nha sang tao');
  const [username, setUsername] = useState('creator');
  const [slug, setSlug] = useState('trang-nha-sang-tao');
  const [slugState, setSlugState] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [submitError, setSubmitError] = useState('');

  // Only verify slug when the user finishes typing (onBlur) or on submit.
  // While typing, keep state idle to avoid spinner flicker.

  return (
    <DashboardShell onSignOut={signOut}>
      <div className="dashboard-grid dashboard-grid-single">
        <Card>
          <p className="eyebrow">Trang đích mới</p>
          <h2>Tạo đường dẫn tài khoản và trang mẫu</h2>
          <p className="muted-copy">Trang này sẽ kiểm tra và giữ chỗ slug trước khi tạo template.</p>
          <form
            className="page-form"
            onSubmit={async (event) => {
              event.preventDefault();
              setSubmitError('');
              const normalizedSlug = normalizeSlug(slug || title);
              const isAvailable = await verifySlug(normalizedSlug);

              if (!isAvailable) {
                setSlugState('taken');
                setSubmitError('Slug này đã được dùng. Hãy thử một đường dẫn khác.');
                return;
              }

              const page = await createPage({ title, slug: normalizedSlug, username, template: 'starter', themeId: 'minimal' });
              navigate(`/editor/${page.id}`);
            }}
          >
            <Input label="Tên tài khoản" value={username} onChange={(event) => setUsername(event.target.value)} />
            <Input label="Tiêu đề trang" value={title} onChange={(event) => setTitle(event.target.value)} />
            <Input
              label="Slug trang đích"
              value={slug}
              onChange={(event) => {
                setSlug(event.target.value);
                setSlugState('idle');
              }}
              onBlur={async () => {
                const normalizedSlug = normalizeSlug(slug || title);
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
              hint={`Xem trước: /${normalizeSlug(slug || title) || 'trang'}`}
              status={slugState}
            />
            {/* slug status text removed — status now shown inline in the Input */}
            {error ? <p className="field-error field-error-block">{error}</p> : null}
            {message ? <p className="field-success">{message}</p> : null}
            {submitError ? <p className="field-error field-error-block">{submitError}</p> : null}
            <div className="dashboard-actions">
              <Button type="submit">Tạo trang mẫu</Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/dashboard')}>
                Hủy
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardShell>
  );
}