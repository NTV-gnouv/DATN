import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

import type { BlockRenderContext } from '@/components/blocks/ContentBlockRenderer';
import { ImageLightbox } from '@/components/blocks/ImageLightbox';
import type { AlbumItem, AlbumPageBlock } from '@/models/content-blocks.model';
import {
  getBlockNavStyle,
  getBlockProgressFillStyle,
  getBlockProgressTrackStyle,
  getBlockShellStyle,
  getBlockSurfaceStyle,
} from '@/utils/block-render-context';
import {
  filterAlbumsByCategory,
  getAlbumCategoriesForFilter,
  normalizeAlbumBlock,
} from '@/utils/album-block.utils';

type AlbumBlockPreviewProps = {
  block: AlbumPageBlock;
  context: BlockRenderContext;
};

function cardStyle(context: BlockRenderContext): CSSProperties {
  return {
    ...getBlockSurfaceStyle(context),
    ...getBlockShellStyle(context),
    fontFamily: context.bodyFontStack,
  };
}

function bodyStyle(context: BlockRenderContext): CSSProperties {
  return {
    fontSize: `${context.reviewFontSize}px`,
    fontFamily: context.bodyFontStack,
    lineHeight: 1.45,
  };
}

function titleStyle(context: BlockRenderContext): CSSProperties {
  return {
    fontSize: `${context.cardTitleFontSize ?? Math.round(context.reviewFontSize * 1.12)}px`,
    fontFamily: context.displayFontStack,
    fontWeight: 700,
    lineHeight: 1.25,
  };
}

function CategoryFilter({
  categories,
  activeCategory,
  onChange,
  context,
}: {
  categories: string[];
  activeCategory: string | 'all';
  onChange: (category: string | 'all') => void;
  context: BlockRenderContext;
}) {
  if (categories.length === 0) {
    return null;
  }

  const inactiveStyle: CSSProperties = {
    color: context.contentText,
    borderColor: `color-mix(in srgb, ${context.contentText} 24%, transparent)`,
    background: 'transparent',
  };
  const activeStyle: CSSProperties = {
    color: context.contentBg,
    borderColor: context.buttonColor,
    background: context.buttonColor,
  };

  return (
    <div className="content-album-category-filter" role="tablist" aria-label="Lọc album theo danh mục">
      <button
        type="button"
        role="tab"
        aria-selected={activeCategory === 'all'}
        className={`content-album-category-tab${activeCategory === 'all' ? ' is-active' : ''}`}
        style={activeCategory === 'all' ? activeStyle : inactiveStyle}
        onClick={() => onChange('all')}
      >
        Tất cả
      </button>
      {categories.map((category) => {
        const isActive = activeCategory === category;
        return (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`content-album-category-tab${isActive ? ' is-active' : ''}`}
            style={isActive ? activeStyle : inactiveStyle}
            onClick={() => onChange(category)}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}

function AlbumPanel({
  album,
  context,
  onImageClick,
}: {
  album: AlbumItem;
  context: BlockRenderContext;
  onImageClick: (albumId: string, imageIndex: number) => void;
}) {
  const muted = `color-mix(in srgb, ${context.contentText} 55%, transparent)`;

  return (
    <article className="content-album-panel">
      <div className="content-album-panel-copy">
        <div className="content-album-panel-head">
          <h6 className="content-album-title" style={titleStyle(context)}>
            {album.title}
          </h6>
          {album.category?.trim() ? (
            <span className="content-album-category-pill" style={{ color: context.contentBg, background: context.buttonColor }}>
              {album.category}
            </span>
          ) : null}
        </div>
        {album.description?.trim() ? (
          <p className="content-album-description" style={{ color: muted, ...bodyStyle(context) }} title={album.description}>
            {album.description}
          </p>
        ) : null}
      </div>

      {album.images.length > 0 ? (
        <div className="content-album-image-grid">
          {album.images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              className="content-album-image-btn"
              onClick={() => onImageClick(album.id, index)}
              aria-label={image.caption?.trim() || `Ảnh ${index + 1}`}
            >
              <img src={image.url} alt={image.caption?.trim() || album.title} loading="lazy" />
            </button>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function AlbumCarousel({
  albums,
  context,
  onImageClick,
  filterKey,
}: {
  albums: AlbumItem[];
  context: BlockRenderContext;
  onImageClick: (albumId: string, imageIndex: number) => void;
  filterKey: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
    trackRef.current?.scrollTo({ left: 0, behavior: 'auto' });
  }, [filterKey]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    function handleScroll() {
      if (!track) {
        return;
      }

      const cards = Array.from(track.children) as HTMLElement[];
      if (cards.length === 0) {
        return;
      }

      const trackLeft = track.scrollLeft;
      let nearestIndex = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;

      cards.forEach((card, index) => {
        const distance = Math.abs(card.offsetLeft - trackLeft);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      setActiveIndex(nearestIndex);
    }

    track.addEventListener('scroll', handleScroll, { passive: true });
    return () => track.removeEventListener('scroll', handleScroll);
  }, [albums.length, filterKey]);

  function scrollTo(index: number) {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const nextIndex = Math.max(0, Math.min(index, albums.length - 1));
    const card = track.children[nextIndex] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    setActiveIndex(nextIndex);
  }

  const progress = albums.length <= 1 ? 100 : ((activeIndex + 1) / albums.length) * 100;

  return (
    <div className="content-album-carousel">
      <div className="content-album-carousel-track" ref={trackRef}>
        {albums.map((album) => (
          <div key={album.id} className="content-album-carousel-slide">
            <AlbumPanel album={album} context={context} onImageClick={onImageClick} />
          </div>
        ))}
      </div>

      {albums.length > 1 ? (
        <div className="content-album-carousel-nav" style={getBlockNavStyle(context)}>
          <button
            type="button"
            className="content-album-carousel-arrow"
            onClick={() => scrollTo(activeIndex - 1)}
            aria-label="Album trước"
          >
            <ChevronLeftIcon className="icon-18" />
          </button>
          <div className="content-album-carousel-progress" style={getBlockProgressTrackStyle(context)} aria-hidden="true">
            <span style={{ ...getBlockProgressFillStyle(context), width: `${progress}%` }} />
          </div>
          <button
            type="button"
            className="content-album-carousel-arrow"
            onClick={() => scrollTo(activeIndex + 1)}
            aria-label="Album tiếp"
          >
            <ChevronRightIcon className="icon-18" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function AlbumBlockPreview({ block, context }: AlbumBlockPreviewProps) {
  const normalized = normalizeAlbumBlock(block);
  const albums = normalized.albums.filter((album) => album.images.length > 0);
  const filterCategories = getAlbumCategoriesForFilter(normalized.categories ?? [], albums);
  const [activeCategory, setActiveCategory] = useState<string | 'all'>('all');
  const [lightbox, setLightbox] = useState<{ albumId: string; imageIndex: number } | null>(null);

  const visibleAlbums = useMemo(
    () => filterAlbumsByCategory(albums, activeCategory),
    [activeCategory, albums],
  );

  if (albums.length === 0) {
    return null;
  }

  const lightboxAlbum = lightbox ? albums.find((album) => album.id === lightbox.albumId) : null;
  const lightboxImages = lightboxAlbum?.images ?? [];
  const hasHeading = Boolean(normalized.title?.trim() || normalized.subtitle?.trim());
  const muted = `color-mix(in srgb, ${context.contentText} 55%, transparent)`;

  function handleImageClick(albumId: string, imageIndex: number) {
    const album = albums.find((item) => item.id === albumId);
    if (!album || album.images.length === 0) {
      return;
    }
    setLightbox({ albumId, imageIndex: Math.max(0, Math.min(imageIndex, album.images.length - 1)) });
  }

  return (
    <>
      <div className="phone-content-card content-album-block" style={cardStyle(context)}>
        {hasHeading ? (
          <div className="content-album-heading">
            {normalized.title?.trim() ? (
              <h5 className="content-album-block-title" style={titleStyle(context)}>
                {normalized.title}
              </h5>
            ) : null}
            {normalized.subtitle?.trim() ? (
              <p className="content-album-block-subtitle" style={bodyStyle(context)}>
                {normalized.subtitle}
              </p>
            ) : null}
          </div>
        ) : null}

        <CategoryFilter
          categories={filterCategories}
          activeCategory={activeCategory}
          onChange={setActiveCategory}
          context={context}
        />

        <div className="content-album-section-meta" style={{ color: muted, ...bodyStyle(context) }}>
          <span>{visibleAlbums.length} album</span>
        </div>

        {visibleAlbums.length === 0 ? (
          <p className="content-album-empty" style={{ color: muted, ...bodyStyle(context) }}>
            Chưa có album trong danh mục này.
          </p>
        ) : visibleAlbums.length > 1 ? (
          <AlbumCarousel
            albums={visibleAlbums}
            context={context}
            onImageClick={handleImageClick}
            filterKey={activeCategory}
          />
        ) : (
          <AlbumPanel album={visibleAlbums[0]} context={context} onImageClick={handleImageClick} />
        )}
      </div>

      {lightbox && lightboxImages.length > 0 ? (
        <ImageLightbox
          images={lightboxImages.map((image) => ({
            url: image.url,
            caption: image.caption,
            alt: image.caption || lightboxAlbum?.title,
          }))}
          activeIndex={lightbox.imageIndex}
          onClose={() => setLightbox(null)}
          onChangeIndex={(index) => setLightbox((current) => (current ? { ...current, imageIndex: index } : null))}
        />
      ) : null}
    </>
  );
}
