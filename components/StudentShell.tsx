"use client";

import {
  BookOpen,
  ExternalLink,
  GraduationCap,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Pencil,
  Sparkles,
  User
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import type { SafeUser } from "@/lib/types";

type StudentShellProps = {
  children: React.ReactNode;
  user: SafeUser;
  pageTitle?: string;
  pageDesc?: string;
  portfolioStatus?: string;
  portfolioSlug?: string;
};

export function StudentShell({
  children,
  user,
  pageTitle = "Dashboard",
  pageDesc,
  portfolioStatus,
  portfolioSlug
}: StudentShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();

  const navItems = [
    {
      label: "ภาพรวม",
      href: "/student",
      icon: <LayoutDashboard size={18} />
    },
    {
      label: "Studio Editor",
      href: "/student/editor",
      icon: <LayoutGrid size={18} />
    },
    {
      label: "โปรไฟล์ของฉัน",
      href: "/student",
      icon: <User size={18} />
    }
  ];

  return (
    <div className="student-shell">
      {/* ── Sidebar ─────────────────────────── */}
      <aside className="student-sidebar">
        {/* Brand */}
        <div className="student-sidebar-brand">
          <div className="student-sidebar-logo">
            <Sparkles size={18} />
          </div>
          <div className="student-sidebar-brand-text">
            <span className="student-sidebar-brand-name">Resume Studio</span>
            <span className="student-sidebar-brand-role">Student Portal</span>
          </div>
        </div>

        {/* Portfolio status pill */}
        {portfolioStatus && (
          <div className={`student-sidebar-status-card ${portfolioStatus}`}>
            <div className="student-sidebar-status-indicator" />
            <div className="student-sidebar-status-text">
              <span className="student-sidebar-status-label">Portfolio</span>
              <span className="student-sidebar-status-value">
                {portfolioStatus === "published" ? "เผยแพร่แล้ว ✓" : "ฉบับร่าง"}
              </span>
            </div>
            {portfolioStatus === "published" && portfolioSlug && (
              <a
                className="student-sidebar-status-link"
                href={`/r/${portfolioSlug}`}
                rel="noopener noreferrer"
                target="_blank"
                title="เปิดดู Portfolio"
              >
                <ExternalLink size={13} />
              </a>
            )}
          </div>
        )}

        <span className="student-nav-label">เมนูหลัก</span>

        {/* Nav */}
        <nav className="student-nav">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                className={`student-nav-item ${isActive ? "active" : ""}`}
                href={item.href}
                key={item.label}
              >
                <span className="student-nav-icon">{item.icon}</span>
                <span className="student-nav-text">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="student-sidebar-divider" />
        <span className="student-nav-label">เครื่องมือ</span>

        <nav className="student-nav">
          <Link className="student-nav-item student-nav-cta" href="/student/editor">
            <span className="student-nav-icon">
              <Pencil size={18} />
            </span>
            <span className="student-nav-text">แก้ไข Resume</span>
          </Link>
          <Link className="student-nav-item" href="/student">
            <span className="student-nav-icon">
              <GraduationCap size={18} />
            </span>
            <span className="student-nav-text">ข้อมูลนักศึกษา</span>
          </Link>
          {portfolioStatus === "published" && portfolioSlug ? (
            <a
              className="student-nav-item"
              href={`/r/${portfolioSlug}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className="student-nav-icon">
                <BookOpen size={18} />
              </span>
              <span className="student-nav-text">เปิดดู Portfolio จริง</span>
            </a>
          ) : null}
        </nav>

        {/* User profile */}
        <div className="student-sidebar-user">
          <div className="student-avatar">{initials}</div>
          <div className="student-user-info">
            <span className="student-user-name">
              {user.firstName} {user.lastName}
            </span>
            <span className="student-user-role">
              {user.department ? user.department : "นักศึกษา"}
              {user.year ? ` • ปี ${user.year}` : ""}
            </span>
          </div>
          <button
            className="student-logout-btn"
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
      <div className="student-main">
        {/* Top Header */}
        <header className="student-topbar">
          <div className="student-page-title-area">
            <h1 className="student-page-title">{pageTitle}</h1>
            {pageDesc ? <p className="student-page-desc">{pageDesc}</p> : null}
          </div>
          <div className="student-topbar-actions">
            <Link className="btn btn-primary" href="/student/editor">
              <Pencil size={15} />
              เปิด Studio Editor
            </Link>
            <div className="student-topbar-avatar" title={`${user.firstName} ${user.lastName}`}>
              {initials}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="student-content">{children}</div>
      </div>
    </div>
  );
}
