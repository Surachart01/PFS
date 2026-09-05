"use client";

import {
  BookOpen,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings,
  Sparkles,
  UserPlus,
  Users
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AdminShellProps = {
  children: React.ReactNode;
  user: { firstName: string; lastName: string; email?: string; role: string };
  pageTitle?: string;
  pageDesc?: string;
  studentCount?: number;
  publishedCount?: number;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  onOpenAddStudent?: () => void;
  onOpenSettings?: () => void;
};

export function AdminShell({
  children,
  user,
  pageTitle = "Dashboard",
  pageDesc,
  studentCount,
  publishedCount,
  activeTab = "dashboard",
  onSelectTab,
  onOpenAddStudent,
  onOpenSettings
}: AdminShellProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

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
          <button
            className={`admin-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => onSelectTab?.("dashboard")}
            type="button"
          >
            <span className="admin-nav-icon"><LayoutDashboard size={18} /></span>
            <span className="admin-nav-text">Dashboard ภาพรวม</span>
            {activeTab === "dashboard" ? <ChevronRight size={14} className="admin-nav-chevron" /> : null}
          </button>

          <button
            className={`admin-nav-item ${activeTab === "students" ? "active" : ""}`}
            onClick={() => onSelectTab?.("students")}
            type="button"
          >
            <span className="admin-nav-icon"><Users size={18} /></span>
            <span className="admin-nav-text">นักศึกษาทั้งหมด</span>
            {studentCount !== undefined ? (
              <span className="admin-nav-badge">{studentCount}</span>
            ) : null}
            {activeTab === "students" ? <ChevronRight size={14} className="admin-nav-chevron" /> : null}
          </button>

          <button
            className={`admin-nav-item ${activeTab === "published" ? "active" : ""}`}
            onClick={() => onSelectTab?.("published")}
            type="button"
          >
            <span className="admin-nav-icon"><BookOpen size={18} /></span>
            <span className="admin-nav-text">Portfolio สาธารณะ</span>
            {publishedCount !== undefined ? (
              <span className="admin-nav-badge">{publishedCount}</span>
            ) : null}
            {activeTab === "published" ? <ChevronRight size={14} className="admin-nav-chevron" /> : null}
          </button>

          <Link className="admin-nav-item" href="/dashboard" target="_blank">
            <span className="admin-nav-icon"><ExternalLink size={18} /></span>
            <span className="admin-nav-text">เปิดดูสารบบรวม</span>
          </Link>
        </nav>

        <div className="admin-sidebar-divider" />

        <span className="admin-nav-label">การจัดการระบบ</span>
        <nav className="admin-nav">
          <button
            className="admin-nav-item"
            onClick={() => {
              if (onOpenAddStudent) {
                onOpenAddStudent();
              } else {
                onSelectTab?.("students");
              }
            }}
            type="button"
          >
            <span className="admin-nav-icon"><GraduationCap size={18} /></span>
            <span className="admin-nav-text">เพิ่มนักศึกษาใหม่</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === "accounts" ? "active" : ""}`}
            onClick={() => onSelectTab?.("accounts")}
            type="button"
          >
            <span className="admin-nav-icon"><UserPlus size={18} /></span>
            <span className="admin-nav-text">จัดการบัญชีผู้ใช้</span>
            {activeTab === "accounts" ? <ChevronRight size={14} className="admin-nav-chevron" /> : null}
          </button>

          <button
            className="admin-nav-item"
            onClick={() => onOpenSettings?.()}
            type="button"
          >
            <span className="admin-nav-icon"><Settings size={18} /></span>
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
            <button
              className="btn btn-primary"
              onClick={() => onOpenAddStudent?.()}
              style={{ fontSize: "13px" }}
              type="button"
            >
              + เพิ่มนักศึกษา
            </button>
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
