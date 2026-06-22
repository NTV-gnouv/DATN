import type { PropsWithChildren } from 'react';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

import { BrandLogo } from '@/components/layout/BrandLogo';
import { Button } from '@/components/ui/Button';

type OnboardingShellProps = PropsWithChildren<{
  step: 1 | 2 | 3;
  title: string;
  subtitle?: string;
  onSignOut: () => void;
}>;

const STEPS = [
  { id: 1, label: 'Chọn domain' },
  { id: 2, label: 'Tạo giao diện' },
  { id: 3, label: 'Hoàn thành' },
] as const;

export function OnboardingShell({ step, title, subtitle, onSignOut, children }: OnboardingShellProps) {
  return (
    <main className="onboarding-shell">
      <header className="onboarding-shell-header">
        <div className="onboarding-shell-brand">
          <BrandLogo />
          <p className="eyebrow">Thiết lập tài khoản</p>
        </div>
        <Button type="button" variant="secondary" onClick={onSignOut}>
          <ArrowRightOnRectangleIcon className="icon-18" aria-hidden="true" />
          <span>Đăng xuất</span>
        </Button>
      </header>

      <div className="onboarding-shell-layout">
        <aside className="onboarding-shell-rail" aria-label="Tiến trình thiết lập">
          <p className="onboarding-rail-title">Các bước</p>
          <ol className="onboarding-steps">
            {STEPS.map((item) => (
              <li key={item.id} className={item.id === step ? 'is-active' : item.id < step ? 'is-done' : ''}>
                <span className="onboarding-step-index">{item.id}</span>
                <span className="onboarding-step-label">{item.label}</span>
              </li>
            ))}
          </ol>
        </aside>

        <section className="onboarding-shell-body">
          <div className="onboarding-shell-content-head">
            <h1>{title}</h1>
            {subtitle ? <p className="muted-copy">{subtitle}</p> : null}
          </div>
          <div className="onboarding-shell-content">{children}</div>
        </section>
      </div>
    </main>
  );
}
