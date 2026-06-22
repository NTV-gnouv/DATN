import type { PropsWithChildren } from 'react';
import { BrandLogo } from '@/components/layout/BrandLogo';

type SiteShellProps = PropsWithChildren<{
  title: string;
  description: string;
  className?: string;
  hideHero?: boolean;
}>;

export function SiteShell({ title, description, children, className, hideHero = false }: SiteShellProps) {
  const mainClass = `site-shell${className ? ` ${className}` : ''}`;
  return (
    <main className={mainClass}>
      {!hideHero ? (
        <header className="site-hero">
          <div className="brand-lockup brand-lockup-tight">
            <BrandLogo />
            <div>
              <p className="eyebrow">Trang công khai ShotVN</p>
              <h1>{title}</h1>
            </div>
          </div>
          <p className="site-hero-copy">{description}</p>
        </header>
      ) : null}
      <section className="site-content">{children}</section>
    </main>
  );
}
