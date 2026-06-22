import type { AnchorHTMLAttributes, ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'dark';

type ButtonProps = PropsWithChildren<
  (ButtonHTMLAttributes<HTMLButtonElement> | AnchorHTMLAttributes<HTMLAnchorElement>) & {
    variant?: ButtonVariant;
    fullWidth?: boolean;
    as?: 'button' | 'a';
  }
>;

export function Button({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  as = 'button',
  ...rest
}: ButtonProps) {
  const variantClass = {
    primary: 'btn btn-primary',
    secondary: 'btn btn-secondary',
    ghost: 'btn btn-ghost',
    dark: 'btn btn-dark',
  }[variant];

  const mergedClassName = `${variantClass} ${fullWidth ? 'btn-full' : ''} ${className}`.trim();

  if (as === 'a') {
    return (
      <a className={mergedClassName} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }

  return (
    <button className={mergedClassName} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
