"use client";

import {
  BookOpen,
  ExternalLink,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Pencil,
  Sparkles,
  User,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

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
  const [currentUser, setCurrentUser] = useState(user);
  const [loggingOut, setLoggingOut] = useState(false);

  // Modals state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Profile form
  const [profileForm, setProfileForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    department: user.department || "Computer Engineering",
    year: String(user.year || 1)
  });

  // Password form
  const [passForm, setPassForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  async function handleSaveProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    const res = await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...profileForm, year: Number(profileForm.year) })
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setMessage({ text: data.message || "บันทึกข้อมูลไม่สำเร็จ", type: "error" });
      return;
    }

    if (data.profile) {
      setCurrentUser(data.profile);
    }
    setMessage({ text: "✅ บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว!", type: "success" });
    setTimeout(() => {
      setShowProfileModal(false);
      setMessage({ text: "", type: "" });
      router.refresh();
    }, 1000);
  }

  async function handleChangePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      setMessage({ text: "รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword
      })
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setMessage({ text: data.message || "เปลี่ยนรหัสผ่านไม่สำเร็จ", type: "error" });
      return;
    }

    setMessage({ text: "✅ เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว!", type: "success" });
    setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setTimeout(() => {
      setShowPasswordModal(false);
      setMessage({ text: "", type: "" });
    }, 1200);
  }

  const initials = `${currentUser.firstName[0] ?? ""}${currentUser.lastName[0] ?? ""}`.toUpperCase();

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

        {/* Main Nav */}
        <nav className="student-nav">
          <Link
            className={`student-nav-item ${pathname === "/student" ? "active" : ""}`}
            href="/student"
          >
            <span className="student-nav-icon"><LayoutDashboard size={18} /></span>
            <span className="student-nav-text">ภาพรวม (Dashboard)</span>
          </Link>

          <Link
            className={`student-nav-item ${pathname === "/student/editor" ? "active" : ""}`}
            href="/student/editor"
          >
            <span className="student-nav-icon"><LayoutGrid size={18} /></span>
            <span className="student-nav-text">Studio Editor</span>
          </Link>

          <button
            className="student-nav-item"
            onClick={() => {
              setProfileForm({
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
                department: currentUser.department || "Computer Engineering",
                year: String(currentUser.year || 1)
              });
              setMessage({ text: "", type: "" });
              setShowProfileModal(true);
            }}
            type="button"
          >
            <span className="student-nav-icon"><User size={18} /></span>
            <span className="student-nav-text">โปรไฟล์ของฉัน</span>
          </button>

          <button
            className="student-nav-item"
            onClick={() => {
              setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
              setMessage({ text: "", type: "" });
              setShowPasswordModal(true);
            }}
            type="button"
          >
            <span className="student-nav-icon"><KeyRound size={18} /></span>
            <span className="student-nav-text">เปลี่ยนรหัสผ่าน</span>
          </button>
        </nav>

        <div className="student-sidebar-divider" />
        <span className="student-nav-label">เครื่องมือ & ลิงก์</span>

        <nav className="student-nav">
          <Link className="student-nav-item student-nav-cta" href="/student/editor">
            <span className="student-nav-icon">
              <Pencil size={18} />
            </span>
            <span className="student-nav-text">แก้ไข Resume</span>
          </Link>

          <Link className="student-nav-item" href="/dashboard" target="_blank">
            <span className="student-nav-icon">
              <BookOpen size={18} />
            </span>
            <span className="student-nav-text">สารบบ Portfolio รวม</span>
          </Link>

          {portfolioStatus === "published" && portfolioSlug ? (
            <a
              className="student-nav-item"
              href={`/r/${portfolioSlug}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className="student-nav-icon">
                <ExternalLink size={18} />
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
              {currentUser.firstName} {currentUser.lastName}
            </span>
            <span className="student-user-role">
              {currentUser.department ? currentUser.department : "นักศึกษา"}
              {currentUser.year ? ` • ปี ${currentUser.year}` : ""}
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
            <div
              className="student-topbar-avatar"
              onClick={() => setShowProfileModal(true)}
              style={{ cursor: "pointer" }}
              title="คลิกเพื่อแก้ไขโปรไฟล์"
            >
              {initials}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="student-content">{children}</div>
      </div>

      {/* ── Edit Profile Modal ── */}
      {showProfileModal ? (
        <div className="adm-drawer-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="adm-drawer" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="adm-drawer-header">
              <div>
                <h2>แก้ไขข้อมูลส่วนตัว</h2>
                <p>ปรับปรุงชื่อ-นามสกุล และข้อมูลการศึกษาของคุณ</p>
              </div>
              <button className="adm-drawer-close" onClick={() => setShowProfileModal(false)} type="button">
                <X size={18} />
              </button>
            </div>
            <form className="adm-drawer-form" onSubmit={handleSaveProfile}>
              <div className="field">
                <label>รหัสนักศึกษา (ไม่สามารถแก้ไขได้)</label>
                <input className="input" disabled value={currentUser.studentId || ""} />
              </div>
              <div className="field">
                <label>อีเมล (ไม่สามารถแก้ไขได้)</label>
                <input className="input" disabled value={currentUser.email} />
              </div>
              <div className="adm-form-row">
                <div className="field">
                  <label htmlFor="pf-fname">ชื่อ</label>
                  <input
                    className="input"
                    id="pf-fname"
                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                    required
                    value={profileForm.firstName}
                  />
                </div>
                <div className="field">
                  <label htmlFor="pf-lname">นามสกุล</label>
                  <input
                    className="input"
                    id="pf-lname"
                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                    required
                    value={profileForm.lastName}
                  />
                </div>
              </div>
              <div className="adm-form-row">
                <div className="field">
                  <label htmlFor="pf-dept">สาขา/ภาควิชา</label>
                  <input
                    className="input"
                    id="pf-dept"
                    onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                    value={profileForm.department}
                  />
                </div>
                <div className="field">
                  <label htmlFor="pf-year">ชั้นปี</label>
                  <select
                    className="select"
                    id="pf-year"
                    onChange={(e) => setProfileForm({ ...profileForm, year: e.target.value })}
                    value={profileForm.year}
                  >
                    <option value="1">ปี 1</option>
                    <option value="2">ปี 2</option>
                    <option value="3">ปี 3</option>
                    <option value="4">ปี 4</option>
                  </select>
                </div>
              </div>

              {message.text ? (
                <div className={`adm-message adm-message-${message.type}`}>{message.text}</div>
              ) : null}

              <div className="adm-drawer-footer">
                <button className="btn" onClick={() => setShowProfileModal(false)} type="button">
                  ยกเลิก
                </button>
                <button className="btn btn-primary" disabled={loading} type="submit">
                  {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* ── Change Password Modal ── */}
      {showPasswordModal ? (
        <div className="adm-drawer-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="adm-drawer" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="adm-drawer-header">
              <div>
                <h2>เปลี่ยนรหัสผ่าน</h2>
                <p>กำหนดรหัสผ่านใหม่เพื่อความปลอดภัยในการเข้าสู่ระบบ</p>
              </div>
              <button className="adm-drawer-close" onClick={() => setShowPasswordModal(false)} type="button">
                <X size={18} />
              </button>
            </div>
            <form className="adm-drawer-form" onSubmit={handleChangePassword}>
              <div className="field">
                <label htmlFor="curr-pass">รหัสผ่านปัจจุบัน</label>
                <input
                  className="input"
                  id="curr-pass"
                  onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                  placeholder="กรอกรหัสผ่านปัจจุบัน"
                  required
                  type="password"
                  value={passForm.currentPassword}
                />
              </div>
              <div className="field">
                <label htmlFor="new-pass">รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)</label>
                <input
                  className="input"
                  id="new-pass"
                  minLength={6}
                  onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                  placeholder="กรอกรหัสผ่านใหม่"
                  required
                  type="password"
                  value={passForm.newPassword}
                />
              </div>
              <div className="field">
                <label htmlFor="conf-pass">ยืนยันรหัสผ่านใหม่</label>
                <input
                  className="input"
                  id="conf-pass"
                  minLength={6}
                  onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                  required
                  type="password"
                  value={passForm.confirmPassword}
                />
              </div>

              {message.text ? (
                <div className={`adm-message adm-message-${message.type}`}>{message.text}</div>
              ) : null}

              <div className="adm-drawer-footer">
                <button className="btn" onClick={() => setShowPasswordModal(false)} type="button">
                  ยกเลิก
                </button>
                <button className="btn btn-primary" disabled={loading} type="submit">
                  {loading ? "กำลังดำเนินการ..." : "เปลี่ยนรหัสผ่าน"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
