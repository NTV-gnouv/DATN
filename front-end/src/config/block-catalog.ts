import {
  DocumentTextIcon,
  InboxStackIcon,
  LinkIcon,
  PhotoIcon,
  RectangleStackIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

export type AddableBlockType = 'text' | 'gallery' | 'album-block' | 'link-block' | 'contact-form' | 'review-block';

export type BlockCatalogItem = {
  type: AddableBlockType;
  title: string;
  description: string;
  route: string;
  Icon: typeof DocumentTextIcon;
};

export const ADDABLE_BLOCK_CATALOG: BlockCatalogItem[] = [
  {
    type: 'contact-form',
    title: 'Contact Form',
    description: 'Thu thập thông tin liên hệ từ khách.',
    route: '/dashboard/block/contact-form',
    Icon: InboxStackIcon,
  },
  {
    type: 'text',
    title: 'Text Block',
    description: 'Thêm đoạn văn bản, tiêu đề và định dạng.',
    route: '/dashboard/block/text',
    Icon: DocumentTextIcon,
  },
  {
    type: 'gallery',
    title: 'Gallery Block',
    description: 'Hiển thị album ảnh dạng lưới hoặc carousel.',
    route: '/dashboard/block/gallery',
    Icon: PhotoIcon,
  },
  {
    type: 'album-block',
    title: 'Album ảnh',
    description: 'Tạo danh mục album với tối đa 5 album, mỗi album 5 ảnh.',
    route: '/dashboard/block/album',
    Icon: RectangleStackIcon,
  },
  {
    type: 'link-block',
    title: 'Link Block',
    description: 'Nhóm các liên kết ngoài trang.',
    route: '/dashboard/block/link',
    Icon: LinkIcon,
  },
  {
    type: 'review-block',
    title: 'Đánh giá khách hàng',
    description: 'Hiển thị testimonial với nhiều kiểu bố cục.',
    route: '/dashboard/block/review',
    Icon: StarIcon,
  },
];

export function getBlockCatalogItem(type: string): BlockCatalogItem | undefined {
  return ADDABLE_BLOCK_CATALOG.find((item) => item.type === type);
}

export function getBlockEditorPath(type: AddableBlockType, blockId: string): string {
  const item = getBlockCatalogItem(type);
  if (!item) {
    return '/dashboard';
  }
  return `${item.route}?blockId=${encodeURIComponent(blockId)}`;
}

export function getBlockDisplayTitle(type: string, index?: number): string {
  const item = getBlockCatalogItem(type as AddableBlockType);
  const base = item?.title ?? type;
  if (index != null && index > 0) {
    return `${base} ${index + 1}`;
  }
  return base;
}
