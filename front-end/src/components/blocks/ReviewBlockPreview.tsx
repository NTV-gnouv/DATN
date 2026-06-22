import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

import type { BlockRenderContext } from '@/components/blocks/ContentBlockRenderer';
import type { ReviewBlockLayout, ReviewItem, ReviewPageBlock } from '@/models/content-blocks.model';
import {
  getBlockNavStyle,
  getBlockProgressFillStyle,
  getBlockProgressTrackStyle,
  getBlockShellStyle,
  getBlockSurfaceStyle,
} from '@/utils/block-render-context';
import { normalizeReviewBlock } from '@/utils/review-block.utils';

type ReviewBlockPreviewProps = {
  block: ReviewPageBlock;
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
    lineHeight: 1.5,
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

function clampRating(rating?: number): number {
  const value = Number(rating ?? 5);
  if (!Number.isFinite(value)) {
    return 5;
  }
  return Math.max(1, Math.min(5, Math.round(value)));
}

function StarRating({ rating, accentColor, mutedColor }: { rating: number; accentColor: string; mutedColor: string }) {
  const stars = clampRating(rating);

  return (
    <div className="content-review-stars" aria-label={`${stars} trên 5 sao`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span
          key={index}
          className={index < stars ? 'is-filled' : 'is-empty'}
          style={{ color: index < stars ? accentColor : mutedColor }}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </div>
  );
}

function ReviewAvatar({ review, className }: { review: ReviewItem; className?: string }) {
  const name = review.authorName?.trim() || 'Khách hàng';
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  if (review.avatarUrl?.trim()) {
    return <img className={className} src={review.avatarUrl} alt={name} loading="lazy" />;
  }

  return (
    <span className={`${className ?? ''} content-review-avatar-fallback`.trim()} aria-hidden="true">
      {initials || 'K'}
    </span>
  );
}

function ReviewHeading({
  block,
  context,
}: {
  block: ReviewPageBlock;
  context: BlockRenderContext;
}) {
  if (!block.title?.trim() && !block.subtitle?.trim()) {
    return null;
  }

  return (
    <div className="content-review-heading">
      {block.title?.trim() ? (
        <h5 className="content-review-title" style={titleStyle(context)}>
          {block.title}
        </h5>
      ) : null}
      {block.subtitle?.trim() ? (
        <p className="content-review-subtitle" style={bodyStyle(context)}>
          {block.subtitle}
        </p>
      ) : null}
    </div>
  );
}

function CarouselReviews({ reviews, context }: { reviews: ReviewItem[]; context: BlockRenderContext }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const panelBg = `color-mix(in srgb, ${context.contentBg} 92%, #ffffff)`;
  const cardBg = `color-mix(in srgb, ${context.contentText} 8%, ${context.contentBg})`;
  const muted = `color-mix(in srgb, ${context.contentText} 55%, transparent)`;

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
  }, [reviews.length]);

  function scrollTo(index: number) {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const nextIndex = Math.max(0, Math.min(index, reviews.length - 1));
    const card = track.children[nextIndex] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    setActiveIndex(nextIndex);
  }

  const progress = reviews.length <= 1 ? 100 : ((activeIndex + 1) / reviews.length) * 100;

  return (
    <div className="content-review-carousel">
      <div className="content-review-carousel-track" ref={trackRef}>
        {reviews.map((review) => (
          <article
            key={review.id}
            className="content-review-carousel-card"
            style={{ background: cardBg, color: context.contentText }}
          >
            <div className="content-review-carousel-quote-panel" style={{ background: panelBg }}>
              <p className="content-review-quote" style={bodyStyle(context)}>
                {review.quote}
              </p>
              <span className="content-review-quote-mark" style={{ color: muted }} aria-hidden="true">
                ”
              </span>
            </div>
            <div className="content-review-author">
              <ReviewAvatar review={review} className="content-review-author-avatar" />
              <div className="content-review-author-copy">
                {review.authorName?.trim() ? (
                  <strong style={titleStyle(context)}>{review.authorName}</strong>
                ) : null}
                {review.authorTitle?.trim() ? (
                  <span className="content-review-author-title" style={{ color: muted, ...bodyStyle(context) }}>
                    {review.authorTitle}
                  </span>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>

      {reviews.length > 1 ? (
        <div className="content-review-carousel-nav" style={getBlockNavStyle(context)}>
          <button
            type="button"
            className="content-review-carousel-arrow"
            onClick={() => scrollTo(activeIndex - 1)}
            aria-label="Đánh giá trước"
          >
            <ChevronLeftIcon className="icon-18" />
          </button>
          <div className="content-review-carousel-progress" style={getBlockProgressTrackStyle(context)} aria-hidden="true">
            <span style={{ ...getBlockProgressFillStyle(context), width: `${progress}%` }} />
          </div>
          <button
            type="button"
            className="content-review-carousel-arrow"
            onClick={() => scrollTo(activeIndex + 1)}
            aria-label="Đánh giá tiếp"
          >
            <ChevronRightIcon className="icon-18" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function GridReviews({ reviews, context }: { reviews: ReviewItem[]; context: BlockRenderContext }) {
  const muted = `color-mix(in srgb, ${context.contentText} 55%, transparent)`;

  return (
    <div className="content-review-grid">
      {reviews.map((review) => (
        <article key={review.id} className="content-review-grid-item">
          <ReviewAvatar review={review} className="content-review-grid-avatar" />
          {review.authorName?.trim() ? (
            <strong className="content-review-grid-name" style={titleStyle(context)}>
              {review.authorName}
            </strong>
          ) : null}
          <p className="content-review-grid-quote" style={{ ...bodyStyle(context), color: muted }}>
            {review.quote}
          </p>
        </article>
      ))}
    </div>
  );
}

function FeaturedReviews({ reviews, context }: { reviews: ReviewItem[]; context: BlockRenderContext }) {
  const muted = `color-mix(in srgb, ${context.contentText} 55%, transparent)`;

  return (
    <div className="content-review-featured-list">
      {reviews.map((review) => (
        <article
          key={review.id}
          className="content-review-featured-card"
          style={{
            ...getBlockSurfaceStyle(context),
            fontFamily: context.bodyFontStack,
          }}
        >
          <div
            className="content-review-featured-avatar-wrap"
            style={{ borderColor: context.buttonColor }}
          >
            <ReviewAvatar review={review} className="content-review-featured-avatar" />
          </div>
          <div className="content-review-featured-copy">
            <StarRating rating={review.rating ?? 5} accentColor={context.buttonColor} mutedColor={muted} />
            <blockquote className="content-review-featured-quote" style={{ ...bodyStyle(context), fontStyle: 'italic' }}>
              {review.quote}
            </blockquote>
            {review.authorName?.trim() ? (
              <strong className="content-review-featured-name" style={titleStyle(context)}>
                {review.authorName}
              </strong>
            ) : null}
            {review.authorTitle?.trim() ? (
              <span className="content-review-featured-role" style={{ color: context.buttonColor, ...bodyStyle(context) }}>
                {review.authorTitle}
              </span>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}

function renderLayout(layout: ReviewBlockLayout, reviews: ReviewItem[], context: BlockRenderContext) {
  if (layout === 'grid') {
    return <GridReviews reviews={reviews} context={context} />;
  }

  if (layout === 'featured') {
    return <FeaturedReviews reviews={reviews} context={context} />;
  }

  return <CarouselReviews reviews={reviews} context={context} />;
}

export function ReviewBlockPreview({ block, context }: ReviewBlockPreviewProps) {
  const normalized = normalizeReviewBlock(block);
  const reviews = normalized.reviews;

  if (reviews.length === 0) {
    return null;
  }

  return (
    <div className={`phone-content-card content-review-block layout-${normalized.layout}`} style={cardStyle(context)}>
      <ReviewHeading block={normalized} context={context} />
      {renderLayout(normalized.layout, reviews, context)}
    </div>
  );
}
