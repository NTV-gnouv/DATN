import { useEffect, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';

export type LightboxImage = {
  url: string;
  alt?: string;
  caption?: string;
};

type ImageLightboxProps = {
  images: LightboxImage[];
  activeIndex: number;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
};

export function ImageLightbox({ images, activeIndex, onClose, onChangeIndex }: ImageLightboxProps) {
  const current = images[activeIndex];
  const hasMultiple = images.length > 1;

  const goPrev = useCallback(() => {
    if (!hasMultiple) {
      return;
    }
    onChangeIndex((activeIndex - 1 + images.length) % images.length);
  }, [activeIndex, hasMultiple, images.length, onChangeIndex]);

  const goNext = useCallback(() => {
    if (!hasMultiple) {
      return;
    }
    onChangeIndex((activeIndex + 1) % images.length);
  }, [activeIndex, hasMultiple, images.length, onChangeIndex]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
      if (event.key === 'ArrowLeft') {
        goPrev();
      }
      if (event.key === 'ArrowRight') {
        goNext();
      }
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goNext, goPrev, onClose]);

  if (!current) {
    return null;
  }

  return (
    <div className="image-lightbox" role="dialog" aria-modal="true" aria-label="Xem ảnh">
      <button type="button" className="image-lightbox-backdrop" aria-label="Đóng" onClick={onClose} />
      <div className="image-lightbox-panel">
        <button type="button" className="image-lightbox-close" aria-label="Đóng" onClick={onClose}>
          <XMarkIcon className="icon-18" aria-hidden="true" />
        </button>

        {hasMultiple ? (
          <button type="button" className="image-lightbox-nav is-prev" aria-label="Ảnh trước" onClick={goPrev}>
            <ChevronLeftIcon className="icon-18" aria-hidden="true" />
          </button>
        ) : null}

        <figure className="image-lightbox-figure">
          <img src={current.url} alt={current.alt || current.caption || 'Ảnh album'} />
          {current.caption?.trim() ? <figcaption>{current.caption}</figcaption> : null}
        </figure>

        {hasMultiple ? (
          <button type="button" className="image-lightbox-nav is-next" aria-label="Ảnh tiếp" onClick={goNext}>
            <ChevronRightIcon className="icon-18" aria-hidden="true" />
          </button>
        ) : null}

        {hasMultiple ? (
          <p className="image-lightbox-counter" aria-live="polite">
            {activeIndex + 1} / {images.length}
          </p>
        ) : null}
      </div>
    </div>
  );
}
