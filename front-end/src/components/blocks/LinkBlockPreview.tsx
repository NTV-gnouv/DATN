import { useEffect, useRef, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

import type { BlockRenderContext } from '@/components/blocks/ContentBlockRenderer';
import type { LinkBlockLayout, LinkItem, LinkPageBlock } from '@/models/content-blocks.model';
import {
  getBlockItemStyle,
  getBlockNavStyle,
  getBlockOverlayStyle,
  getBlockProgressFillStyle,
  getBlockProgressTrackStyle,
  getBlockShellStyle,
} from '@/utils/block-render-context';

type LinkBlockPreviewProps = {
  block: LinkPageBlock;
  context: BlockRenderContext;
};

function linkTitleStyle(context: BlockRenderContext): React.CSSProperties {
  return {
    fontFamily: context.displayFontStack,
    fontWeight: 700,
  };
}

function LinkAnchor({
  link,
  className,
  style,
  children,
}: {
  link: LinkItem;
  className: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  if (!link.url?.trim()) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <a href={link.url} className={className} style={style} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

function ClassicLinks({ links, context }: { links: LinkItem[]; context: BlockRenderContext }) {
  const itemStyle = getBlockItemStyle(context);

  return (
    <div className="content-link-classic-list">
      {links.map((link) => (
        <LinkAnchor key={link.id} link={link} className="content-link-classic-item" style={itemStyle}>
          {link.thumbnailUrl ? (
            <img className="content-link-classic-thumb" src={link.thumbnailUrl} alt={link.title || 'Thumbnail'} loading="lazy" />
          ) : (
            <span className="content-link-classic-thumb is-placeholder" aria-hidden="true" />
          )}
          <div className="content-link-classic-copy">
            {link.title?.trim() ? <strong style={linkTitleStyle(context)}>{link.title}</strong> : null}
            {link.description?.trim() ? <p>{link.description}</p> : null}
          </div>
        </LinkAnchor>
      ))}
    </div>
  );
}

function CarouselLinks({ links, context }: { links: LinkItem[]; context: BlockRenderContext }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const itemStyle = getBlockItemStyle(context);

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
  }, [links.length]);

  function scrollTo(index: number) {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const nextIndex = Math.max(0, Math.min(index, links.length - 1));
    const card = track.children[nextIndex] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    setActiveIndex(nextIndex);
  }

  const progress = links.length <= 1 ? 100 : ((activeIndex + 1) / links.length) * 100;

  return (
    <div className="content-link-carousel">
      <div className="content-link-carousel-track" ref={trackRef}>
        {links.map((link) => (
          <LinkAnchor key={link.id} link={link} className="content-link-carousel-card" style={itemStyle}>
            {link.thumbnailUrl ? (
              <img className="content-link-carousel-media" src={link.thumbnailUrl} alt={link.title || 'Thumbnail'} loading="lazy" />
            ) : (
              <span className="content-link-carousel-media is-placeholder" aria-hidden="true" />
            )}
            <div className="content-link-carousel-copy">
              {link.title?.trim() ? <strong style={linkTitleStyle(context)}>{link.title}</strong> : null}
              {link.description?.trim() ? <p>{link.description}</p> : null}
            </div>
          </LinkAnchor>
        ))}
      </div>

      {links.length > 1 ? (
        <div className="content-link-carousel-nav" style={getBlockNavStyle(context)}>
          <button type="button" className="content-link-carousel-arrow" onClick={() => scrollTo(activeIndex - 1)} aria-label="Link trước">
            <ChevronLeftIcon className="icon-18" />
          </button>
          <div className="content-link-carousel-progress" style={getBlockProgressTrackStyle(context)} aria-hidden="true">
            <span style={{ ...getBlockProgressFillStyle(context), width: `${progress}%` }} />
          </div>
          <button type="button" className="content-link-carousel-arrow" onClick={() => scrollTo(activeIndex + 1)} aria-label="Link tiếp">
            <ChevronRightIcon className="icon-18" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ImageGridLinks({ links, context }: { links: LinkItem[]; context: BlockRenderContext }) {
  const itemStyle = getBlockItemStyle(context);

  return (
    <div className="content-link-image-grid-list">
      {links.map((link) => (
        <LinkAnchor
          key={link.id}
          link={link}
          className="content-link-image-grid-item"
          style={{
            ...itemStyle,
            background: 'transparent',
          }}
        >
          {link.thumbnailUrl ? (
            <img className="content-link-image-grid-bg" src={link.thumbnailUrl} alt={link.title || 'Thumbnail'} loading="lazy" />
          ) : (
            <span className="content-link-image-grid-bg is-placeholder" style={{ background: context.contentBg }} aria-hidden="true" />
          )}
          <div className="content-link-image-grid-overlay" style={getBlockOverlayStyle(context)} />
          <div className="content-link-image-grid-copy">
            {link.title?.trim() ? <strong style={linkTitleStyle(context)}>{link.title}</strong> : null}
            {link.description?.trim() ? <p>{link.description}</p> : null}
          </div>
        </LinkAnchor>
      ))}
    </div>
  );
}

function CardLinks({ links, context }: { links: LinkItem[]; context: BlockRenderContext }) {
  const itemStyle = getBlockItemStyle(context);

  return (
    <div className="content-link-card-list">
      {links.map((link) => (
        <LinkAnchor key={link.id} link={link} className="content-link-card-item" style={itemStyle}>
          {link.thumbnailUrl ? (
            <img className="content-link-card-media" src={link.thumbnailUrl} alt={link.title || 'Thumbnail'} loading="lazy" />
          ) : (
            <span className="content-link-card-media is-placeholder" aria-hidden="true" />
          )}
          <div className="content-link-card-copy">
            {link.title?.trim() ? <strong style={linkTitleStyle(context)}>{link.title}</strong> : null}
            {link.description?.trim() ? <p>{link.description}</p> : null}
          </div>
        </LinkAnchor>
      ))}
    </div>
  );
}

export function LinkBlockPreview({ block, context }: LinkBlockPreviewProps) {
  const links = Array.isArray(block.links) ? block.links.filter((item) => item.url?.trim()) : [];
  const layout: LinkBlockLayout = block.layout ?? 'classic';

  if (links.length === 0) {
    return null;
  }

  return (
    <div className={`content-link-block layout-${layout}`} style={getBlockShellStyle(context)}>
      {layout === 'classic' ? <ClassicLinks links={links} context={context} /> : null}
      {layout === 'carousel' ? <CarouselLinks links={links} context={context} /> : null}
      {layout === 'image-grid' ? <ImageGridLinks links={links} context={context} /> : null}
      {layout === 'card' ? <CardLinks links={links} context={context} /> : null}
    </div>
  );
}
