import type { PropsWithChildren } from 'react';
import { BrandLogo } from '@/components/layout/BrandLogo';

type AuthShellProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  subtitle: string;
}>;

export function AuthShell({ eyebrow, title, subtitle, children }: AuthShellProps) {
  return (
    <main className="auth-shell">
      <aside className="auth-shell-aside">
        <div className="brand-lockup">
          <BrandLogo />
          <div>
            <p className="eyebrow">ShotVN</p>
            <h1>Trang nhà sáng tạo kiểu Beacons với hệ thống triển khai gọn hơn.</h1>
          </div>
        </div>
        <div className="auth-shell-copy">
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </aside>
      <section className="auth-shell-panel">
        <div className="auth-card">
          <div className="auth-card-head">
            <p className="eyebrow">Nền tảng ShotVN</p>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
