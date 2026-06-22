import {
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  HomeIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import type { ComponentType, SVGProps } from 'react';

import { DATA_SOURCE_BLOCKS } from '@/config/data-source-blocks';

export type DashboardNavItem = {
  id: string;
  label: string;
  to: string;
  end?: boolean;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
};

export type DashboardNavGroup = {
  id: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  items: DashboardNavItem[];
};

export const DASHBOARD_BUILDER_GROUP: DashboardNavGroup = {
  id: 'builder',
  label: 'Link in Bio & Website',
  icon: Squares2X2Icon,
  items: [
    { id: 'home', label: 'Tổng quan', to: '/dashboard', end: true, icon: HomeIcon },
    { id: 'ai-chat', label: 'AI Chat', to: '/dashboard/ai-chat', end: true, icon: ChatBubbleLeftRightIcon },
  ],
};

export const DASHBOARD_ANALYTICS_GROUP: DashboardNavGroup = {
  id: 'analytics',
  label: 'Analytics',
  icon: ChartBarIcon,
  items: [
    { id: 'analytics-overview', label: 'Tổng quan', to: '/dashboard/analytics/overview', end: true, icon: ChartBarIcon },
    ...DATA_SOURCE_BLOCKS.map((source) => ({
      id: `analytics-${source.blockType}`,
      label: source.label,
      to: source.analyticsPath,
      icon: source.icon,
    })),
  ],
};

export const DASHBOARD_NAV_GROUPS = [DASHBOARD_BUILDER_GROUP, DASHBOARD_ANALYTICS_GROUP];

export function findDashboardNavGroupForPath(pathname: string) {
  return DASHBOARD_NAV_GROUPS.find((group) =>
    group.items.some((item) =>
      item.end ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`),
    ),
  );
}
