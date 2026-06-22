type BrandLogoProps = {
  className?: string;
  alt?: string;
};

export function BrandLogo({ className = '', alt = 'ShotVN logo' }: BrandLogoProps) {
  return (
    <img
      className={`brand-logo ${className}`.trim()}
      src="/img/icons/favicon/favicon_trinh-duyet.svg"
      alt={alt}
      loading="eager"
      decoding="async"
    />
  );
}
