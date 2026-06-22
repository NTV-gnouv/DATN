import { type PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { ArrowRightOnRectangleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { NavLink, useLocation } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { DASHBOARD_NAV_GROUPS, findDashboardNavGroupForPath } from '@/config/dashboard-nav';

type DashboardShellProps = PropsWithChildren<{
  onSignOut: () => void;
}>;

function isNavItemActive(pathname: string, to: string, end?: boolean) {
  if (end) {
    return pathname === to;
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function DashboardShell({ children, onSignOut }: DashboardShellProps) {
  const location = useLocation();
  const activeGroup = useMemo(() => findDashboardNavGroupForPath(location.pathname), [location.pathname]);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => ({
    builder: true,
    analytics: location.pathname.startsWith('/dashboard/analytics'),
  }));

  useEffect(() => {
    if (!activeGroup) {
      return;
    }
    setExpandedGroups((current) => ({
      ...current,
      [activeGroup.id]: true,
    }));
  }, [activeGroup?.id]);

  function toggleGroup(groupId: string) {
    setExpandedGroups((current) => ({
      ...current,
      [groupId]: !current[groupId],
    }));
  }

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-rail dashboard-rail-compact">
        <div className="dashboard-rail-head">
          <div className="brand-lockup brand-lockup-tight dashboard-rail-brand">
            <BrandLogo />
            <div className="dashboard-rail-brand-copy">
              <p className="eyebrow">ShotVN</p>
              <h1>Dashboard</h1>
            </div>
          </div>

          <nav className="rail-menu" aria-label="Dashboard navigation">
            {DASHBOARD_NAV_GROUPS.map((group, groupIndex) => {
              const isExpanded = expandedGroups[group.id] ?? false;
              const groupActive = activeGroup?.id === group.id;

              return (
                <div
                  className={`rail-menu-group ${groupIndex === DASHBOARD_NAV_GROUPS.length - 1 ? 'rail-menu-group-separated' : ''}`}
                  key={group.id}
                >
                  <button
                    type="button"
                    className={`rail-menu-group-toggle ${groupActive ? 'is-active' : ''}`}
                    aria-expanded={isExpanded}
                    onClick={() => toggleGroup(group.id)}
                  >
                    <group.icon className="rail-menu-group-icon" aria-hidden="true" />
                    <span className="rail-menu-group-label">{group.label}</span>
                    <ChevronDownIcon className={`rail-menu-group-caret ${isExpanded ? 'is-open' : ''}`} aria-hidden="true" />
                  </button>

                  {isExpanded ? (
                    <div className="rail-menu-group-items">
                      {group.items.map((item) => {
                        const itemActive = isNavItemActive(location.pathname, item.to, item.end);
                        return (
                          <NavLink
                            key={item.id}
                            to={item.to}
                            end={item.end}
                            className={`rail-menu-item ${itemActive ? 'is-active' : ''}`}
                          >
                            {item.label}
                          </NavLink>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </nav>
        </div>

        <Button variant="dark" fullWidth onClick={onSignOut}>
          <ArrowRightOnRectangleIcon className="button-inline-icon" aria-hidden="true" />
          Đăng xuất
        </Button>
      </aside>
      <section className="dashboard-stage">{children}</section>
    </main>
  );
}
