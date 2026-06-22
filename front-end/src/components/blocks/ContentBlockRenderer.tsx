import { useState, type CSSProperties } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

import type {
  AlbumPageBlock,
  GalleryPageBlock,
  LinkPageBlock,
  ReviewPageBlock,
  TextPageBlock,
} from '@/models/content-blocks.model';
import type { PageBlock } from '@/models/page.model';
import { AlbumBlockPreview } from '@/components/blocks/AlbumBlockPreview';
import { LinkBlockPreview } from '@/components/blocks/LinkBlockPreview';
import { ReviewBlockPreview } from '@/components/blocks/ReviewBlockPreview';
import { getBlockShellStyle, getBlockSurfaceStyle } from '@/utils/block-render-context';
import {
  getGalleryAspectRatioStyle,
  getGalleryImageScaleStyle,
  normalizeGalleryBlock,
} from '@/utils/gallery-block.utils';

export type BlockRenderContext = {
  contentBg: string;
  contentText: string;
  buttonColor: string;
  divWidth: number;
  border: { width: number; style: string; color: string; radius: number };
  shadow: { enabled: boolean; x: number; y: number; blur: number; spread: number; color: string };
  reviewFontSize: number;
  cardTitleFontSize?: number;
  displayFontStack?: string;
  bodyFontStack?: string;
  cardSurfaceStyle?: CSSProperties;
};

type ContentBlockRendererProps = {
  block: PageBlock;
  index: number;
  context: BlockRenderContext;
};

function cardStyle(context: BlockRenderContext): CSSProperties {
  return {
    ...getBlockSurfaceStyle(context),
    ...getBlockShellStyle(context),
    fontFamily: context.bodyFontStack,
  };
}

function blockBodyStyle(context: BlockRenderContext): CSSProperties {
  return {
    fontSize: `${context.reviewFontSize}px`,
    fontFamily: context.bodyFontStack,
  };
}

function blockTitleStyle(context: BlockRenderContext): CSSProperties {
  return {
    fontSize: `${context.cardTitleFontSize ?? Math.round(context.reviewFontSize * 1.12)}px`,
    fontFamily: context.displayFontStack,
    fontWeight: 700,
    lineHeight: 1.25,
  };
}

function TextBlockContent({ block, context }: { block: TextPageBlock; context: BlockRenderContext }) {
  if (!block.content?.trim()) {
    return null;
  }

  return (
    <div className="phone-content-card content-text-block" style={cardStyle(context)}>
      <div
        className="content-text-block-body"
        style={blockBodyStyle(context)}
        dangerouslySetInnerHTML={{ __html: block.content }}
      />
    </div>
  );
}

function GalleryImageFigure({
  image,
  aspectStyle,
  scaleStyle,
}: {
  image: GalleryPageBlock['images'][number];
  aspectStyle: CSSProperties;
  scaleStyle: CSSProperties;
}) {
  const imageNode = (
    <img src={image.url} alt={image.caption || 'Gallery image'} loading="lazy" style={{ ...aspectStyle, ...scaleStyle }} />
  );

  return (
    <figure className="content-gallery-figure">
      {image.linkUrl?.trim() ? (
        <a href={image.linkUrl} target="_blank" rel="noreferrer">
          {imageNode}
        </a>
      ) : (
        imageNode
      )}
      {image.caption?.trim() ? <figcaption>{image.caption}</figcaption> : null}
    </figure>
  );
}

function GalleryBlockContent({ block, context }: { block: GalleryPageBlock; context: BlockRenderContext }) {
  const normalized = normalizeGalleryBlock(block);
  const images = normalized.images;
  const [expanded, setExpanded] = useState(false);

  if (images.length === 0) {
    return null;
  }

  const visibleCount = Math.max(1, normalized.visibleCount);
  const visibleImages = expanded ? images : images.slice(0, visibleCount);
  const hasMore = normalized.appearance === 'exposed' && images.length > visibleCount && !expanded;
  const aspectStyle = getGalleryAspectRatioStyle(normalized.aspectRatio);
  const scaleStyle = getGalleryImageScaleStyle(normalized.imageScale);
  const layoutClass =
    normalized.layout === 'carousel' ? 'content-gallery-slider' : 'content-gallery-column';
  const hasHeading = Boolean(normalized.title?.trim() || normalized.subtitle?.trim());
  const collapseLabel = normalized.title?.trim() || normalized.subtitle?.trim() || 'Thư viện ảnh';

  const galleryBody = (
    <div className="content-gallery-details-body">
      {normalized.layout === 'carousel' ? (
        <div className={layoutClass}>
          {visibleImages.map((image) => (
            <GalleryImageFigure key={image.id} image={image} aspectStyle={aspectStyle} scaleStyle={scaleStyle} />
          ))}
        </div>
      ) : (
        <div className={layoutClass}>
          {visibleImages.map((image) => (
            <GalleryImageFigure key={image.id} image={image} aspectStyle={aspectStyle} scaleStyle={scaleStyle} />
          ))}
        </div>
      )}
      {hasMore ? (
        <button
          type="button"
          className="content-gallery-more-btn"
          style={{ background: context.buttonColor }}
          onClick={() => setExpanded(true)}
        >
          {normalized.showMoreLabel?.trim() || 'Xem thêm'}
        </button>
      ) : null}
    </div>
  );

  if (normalized.appearance === 'collapsible') {
    return (
      <div className="phone-content-card content-gallery-block" style={cardStyle(context)}>
        <details className="content-gallery-details">
          <summary className="content-gallery-collapse-toggle">
            <span className="content-gallery-heading-copy">
              {hasHeading ? (
                <>
                  {normalized.title?.trim() ? <strong>{normalized.title}</strong> : null}
                  {normalized.subtitle?.trim() ? <span>{normalized.subtitle}</span> : null}
                </>
              ) : (
                <strong>{collapseLabel}</strong>
              )}
            </span>
            <ChevronDownIcon className="content-gallery-collapse-icon" aria-hidden="true" />
          </summary>
          {galleryBody}
        </details>
      </div>
    );
  }

  return (
    <div className="phone-content-card content-gallery-block" style={cardStyle(context)}>
      {hasHeading ? (
        <div className="content-gallery-heading-copy">
          {normalized.title?.trim() ? (
            <h5 className="content-gallery-title" style={blockTitleStyle(context)}>
              {normalized.title}
            </h5>
          ) : null}
          {normalized.subtitle?.trim() ? (
            <p className="content-gallery-subtitle" style={blockBodyStyle(context)}>
              {normalized.subtitle}
            </p>
          ) : null}
        </div>
      ) : null}
      {galleryBody}
    </div>
  );
}

function LinkBlockContent({ block, context }: { block: LinkPageBlock; context: BlockRenderContext }) {
  return <LinkBlockPreview block={block} context={context} />;
}

function ReviewBlockContent({ block, context }: { block: ReviewPageBlock; context: BlockRenderContext }) {
  return <ReviewBlockPreview block={block} context={context} />;
}

function AlbumBlockContent({ block, context }: { block: AlbumPageBlock; context: BlockRenderContext }) {
  return <AlbumBlockPreview block={block} context={context} />;
}

export function ContentBlockRenderer({ block, index, context }: ContentBlockRendererProps) {
  const type = String(block.type ?? '');

  if (type === 'text') {
    return <TextBlockContent key={`text-${index}`} block={block as TextPageBlock} context={context} />;
  }

  if (type === 'gallery') {
    const galleryBlock = block as GalleryPageBlock;
    return (
      <GalleryBlockContent
        key={`gallery-${galleryBlock.id || index}`}
        block={galleryBlock}
        context={context}
      />
    );
  }

  if (type === 'link-block') {
    return <LinkBlockContent key={`link-block-${index}`} block={block as LinkPageBlock} context={context} />;
  }

  if (type === 'review-block') {
    const reviewBlock = block as ReviewPageBlock;
    return (
      <ReviewBlockContent
        key={`review-block-${reviewBlock.id || index}`}
        block={reviewBlock}
        context={context}
      />
    );
  }

  if (type === 'album-block') {
    const albumBlock = block as AlbumPageBlock;
    return (
      <AlbumBlockContent
        key={`album-block-${albumBlock.id || index}`}
        block={albumBlock}
        context={context}
      />
    );
  }

  return null;
}
