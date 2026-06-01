'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Inbox, Users, Package, TrendingUp, Shield, Settings } from 'lucide-react';
import { useAppStore } from '@/lib/appStore';

const DOCK_ITEMS = [
  { href: '/inbox',     label: 'Inbox', Icon: Inbox,     badge: 7 },
  { href: '/leads',     label: 'Leads', Icon: Users,     badge: 3 },
  { href: '/inventory', label: 'Stock', Icon: Package },
  { href: '/analytics', label: 'Stats', Icon: TrendingUp },
  { href: '/admin',     label: 'Team',  Icon: Shield },
  { href: '/settings',  label: 'More',  Icon: Settings },
];

export function MobileDock() {
  const pathname = usePathname();
  return (
    <nav className="mobile-dock">
      <div className="dock-scroll">
        {DOCK_ITEMS.map(it => {
          const active = pathname.startsWith(it.href);
          return (
            <Link key={it.href} href={it.href} className={`dock-item no-underline ${active ? 'active' : ''}`}>
              <it.Icon size={18} />
              <span className="dock-lbl">{it.label}</span>
              {it.badge && <span className="dock-badge">{it.badge}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
