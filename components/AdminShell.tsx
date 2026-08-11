"use client";

import {
  BookOpen,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings,
  Sparkles,
  UserPlus,
  Users
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
};

type AdminShellProps = {
  children: React.ReactNode;
  user: { firstName: string; lastName: string; email?: string; role: string };
  pageTitle?: string;
  pageDesc?: string;
  studentCount?: number;
  publishedCount?: number;
};

export function AdminShell({
  children,
  user,
  pageTitle = "Dashboard",
  pageDesc,
  studentCount,
  publishedCount
}: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard size={18} />
    },
    {
      label: "นักศึกษาทั้งหมด",
      href: "/admin",
      icon: <Users size={18} />,
      badge: studentCount
    },
    {
      label: "Portfolio สาธารณะ",
      href: "/admin",
      icon: <BookOpen size={18} />,
      badge: publishedCount
    }
  ];

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();

  return (
    <div className="admin-shell">
      {/* ── Sidebar ─────────────────────────── */}
      <aside className="admin-sidebar">
        {/* Brand */}
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-logo">
            <Sparkles size={18} />
          </div>
          <div className="admin-sidebar-brand-text">
            <span className="admin-sidebar-brand-name">Resume Studio</span>
            <span className="admin-sidebar-brand-role">Admin Panel</span>
          </div>
        </div>

        {/* Nav label */}
        <span className="admin-nav-label">เมนูหลัก</span>

        {/* Nav Items */}
        <nav className="admin-nav">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                className={`admin-nav-item ${isActive ? "active" : ""}`}
                href={item.href}
                key={item.label}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                <span className="admin-nav-text">{item.label}</span>
                {item.badge !== undefined && item.badge !== 0 ? (
                  <span className="admin-nav-badge">{item.badge}</span>
                ) : null}
                {isActive ? <ChevronRight size={14} className="admin-nav-chevron" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-divider" />

        <span className="admin-nav-label">ระบบ</span>
        <nav className="admin-nav">
          <Link className="admin-nav-item" href="/admin">
            <span className="admin-nav-icon">
              <GraduationCap size={18} />
            </span>
            <span className="admin-nav-text">เพิ่มนักศึกษา</span>
          </Link>
          <Link className="admin-nav-item" href="/admin">
            <span className="admin-nav-icon">
              <UserPlus size={18} />
            </span>
            <span className="admin-nav-text">จัดการบัญชี</span>
          </Link>
          <button className="admin-nav-item" onClick={() => {}} type="button">
            <span className="admin-nav-icon">
              <Settings size={18} />
            </span>
            <span className="admin-nav-text">ตั้งค่าระบบ</span>
          </button>
        </nav>

        {/* User Profile at bottom */}
        <div className="admin-sidebar-user">
          <div className="admin-avatar">{initials}</div>
          <div className="admin-user-info">
            <span className="admin-user-name">
              {user.firstName} {user.lastName}
            </span>
            <span className="admin-user-role">ผู้ดูแลระบบ</span>
          </div>
          <button
            className="admin-logout-btn"
            disabled={loggingOut}
            onClick={logout}
            title="ออกจากระบบ"
            type="button"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* ── Main Area ───────────────────────── */}
      <div className="admin-main">
        {/* Top Header */}
        <header className="admin-topbar">
          <div className="admin-page-title-area">
            <h1 className="admin-page-title">{pageTitle}</h1>
            {pageDesc ? <p className="admin-page-desc">{pageDesc}</p> : null}
          </div>
          <div className="admin-topbar-actions">
            <div className="admin-topbar-avatar" title={`${user.firstName} ${user.lastName}`}>
              {initials}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
