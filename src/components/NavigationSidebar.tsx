'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  History,
  FileText,
  Cpu,
  Settings,
  ShieldAlert,
} from 'lucide-react';
import { useTestWorkflow } from '@/context/TestWorkflowContext';

export function NavigationSidebar() {
  const pathname = usePathname();
  const { testState } = useTestWorkflow();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'New Test', href: '/new-test', icon: PlusCircle, badge: testState !== 'READY' ? testState : undefined },
    { label: 'History', href: '/history', icon: History },
    { label: 'Reports', href: '/reports', icon: FileText },
    { label: 'Device', href: '/device', icon: Cpu },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="nav-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={22} color="var(--teal)" />
          <span className="brand-title">NARCOSENSE</span>
        </div>
        <div className="brand-subtitle">AI-ASSISTED BREATH SCREENING</div>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} className="nav-icon" />
              <span className="nav-label">{item.label}</span>
              {item.badge && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer build info */}
      <div className="sidebar-footer">
        <div className="footer-meta font-mono">
          <span>RPI-3B LINK: OK</span>
          <span>BUILD v2.4</span>
        </div>
      </div>
    </aside>
  );
}
