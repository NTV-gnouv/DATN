import { InboxStackIcon } from '@heroicons/react/24/outline';
import type { ComponentType, SVGProps } from 'react';

export type DataSourceBlockDefinition = {
  blockType: string;
  label: string;
  description: string;
  analyticsPath: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export const DATA_SOURCE_BLOCKS: DataSourceBlockDefinition[] = [
  {
    blockType: 'contact-form',
    label: 'Form liên hệ',
    description: 'Dữ liệu khách hàng gửi qua biểu mẫu liên hệ',
    analyticsPath: '/dashboard/analytics/contact-form',
    icon: InboxStackIcon,
  },
];

const dataSourceBlockMap = new Map(DATA_SOURCE_BLOCKS.map((item) => [item.blockType, item]));

export function isDataSourceBlock(blockType: unknown): blockType is string {
  return typeof blockType === 'string' && dataSourceBlockMap.has(blockType);
}

export function getDataSourceBlock(blockType: string) {
  return dataSourceBlockMap.get(blockType) ?? null;
}

export function getDataSourceBlocksForPageBlocks(blockTypes: unknown[]) {
  const uniqueTypes = [...new Set(blockTypes.filter((type): type is string => typeof type === 'string'))];
  return DATA_SOURCE_BLOCKS.filter((item) => uniqueTypes.includes(item.blockType));
}
