'use client';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
} from '@/shared/ui/Collapsible';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type {
  BusinessVertical,
  VerticalCapability,
} from '@/lib/business-verticals';
import {
  findActiveChildHref,
  formatNavBadge,
  navLabelFor,
  type NavItem,
} from './navItems';
import { SidebarNavFlyout } from './SidebarNavFlyout';

interface SidebarNavItemProps {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
  badge?: number;
  expanded: boolean;
  onToggleExpanded: () => void;
  onNavigate: () => void;
  canAccess: (perm?: string) => boolean;
  canUseCapability: (capability?: VerticalCapability) => boolean;
  /** Drives per-vertical label overrides — see navLabelFor. */
  businessVertical?: BusinessVertical | undefined;
}

export function SidebarNavItem({
  item,
  pathname,
  collapsed,
  badge,
  expanded,
  onToggleExpanded,
  onNavigate,
  canAccess,
  canUseCapability,
  businessVertical,
}: SidebarNavItemProps) {
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const label = navLabelFor(item, businessVertical);
  const visibleChildren = (item.children ?? []).filter(
    (child) =>
      canAccess(child.perm) &&
      canUseCapability(child.capability) &&
      !(businessVertical && child.hiddenForVerticals?.includes(businessVertical)),
  );
  const hasChildren = visibleChildren.length > 0;
  const activeChildHref = hasChildren
    ? findActiveChildHref(visibleChildren, pathname)
    : undefined;

  const childLinks = visibleChildren.map((child, index) => {
    const childActive = child.href === activeChildHref;
    return (
      <Link
        key={child.href}
        href={child.href}
        onClick={onNavigate}
        // Children fade in one after another as the section or flyout opens.
        style={{ animationDelay: `${index * 40}ms` }}
        className={cn(
          'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13.5px] no-underline transition-colors animate-in fade-in slide-in-from-left-1 fill-mode-both motion-reduce:animate-none',
          childActive
            ? 'bg-[var(--accent-soft)] font-semibold text-[var(--accent)]'
            : 'text-[var(--ink-soft)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]',
        )}
      >
        {child.Icon && (
          <child.Icon
            size={14}
            className={cn(
              'flex-shrink-0',
              childActive ? 'text-[var(--accent)]' : 'text-[var(--ink-mute)]',
            )}
          />
        )}
        <span className="truncate">{navLabelFor(child, businessVertical)}</span>
      </Link>
    );
  });

  const parentLink = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-label={collapsed ? label : undefined}
      className={cn(
        'nav-item group/nav no-underline',
        collapsed ? 'justify-center p-[10px]' : 'justify-start px-3 py-2',
        !collapsed && hasChildren && 'pr-9',
        active ? 'active' : '',
      )}
    >
      <item.Icon
        size={17}
        className={cn(
          'nav-ic flex-shrink-0 transition-transform duration-200 group-hover/nav:scale-110',
          active ? 'text-[var(--accent)]' : 'text-[var(--ink-mute)]',
        )}
      />
      {!collapsed && (
        // Labels ease in as the rail widens instead of popping in at full width.
        <span className="flex-1 animate-in fade-in slide-in-from-left-1 duration-200 motion-reduce:animate-none">
          {label}
        </span>
      )}
      {!collapsed && !!badge && (
        <span
          className={cn(
            'badge font-medium py-[1px] px-[7px] min-w-5 justify-center',
            active
              ? 'bg-[var(--accent)] text-white border-none'
              : 'bg-[var(--surface-2)] text-[var(--ink-soft)] border border-[var(--line)]',
          )}
        >
          {formatNavBadge(badge)}
        </span>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <SidebarNavFlyout
        href={item.href}
        label={label}
        badge={badge}
        isActive={active}
        onNavigate={onNavigate}
        childLinks={hasChildren ? childLinks : undefined}
      >
        {parentLink}
      </SidebarNavFlyout>
    );
  }

  return (
    <Collapsible
      open={hasChildren && expanded}
      onOpenChange={onToggleExpanded}
      className="flex flex-col gap-0.5"
    >
      <div className="relative flex items-center">
        {parentLink}

        {/* Separate from the link so opening the submenu never costs you the navigation */}
        {hasChildren && (
          <button
            type="button"
            aria-label={`${expanded ? 'Collapse' : 'Expand'} ${label}`}
            aria-expanded={expanded}
            onClick={onToggleExpanded}
            className="absolute right-1.5 flex h-6 w-6 items-center justify-center rounded-md text-[var(--ink-mute)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
          >
            <ChevronRight
              size={13}
              className={cn('transition-transform duration-200', expanded && 'rotate-90')}
            />
          </button>
        )}
      </div>

      {hasChildren && (
        <CollapsibleContent className="overflow-hidden data-open:animate-collapsible-down data-closed:animate-collapsible-up">
          <div className="relative ml-[22px] mt-0.5 flex flex-col gap-0.5 border-l border-[var(--line)] pl-2.5">
            {childLinks}
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}
