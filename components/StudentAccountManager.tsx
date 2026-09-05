"use client";

import { KeyRound, Lock, Sparkles, User, UserCheck, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { SafeUser } from "@/lib/types";

export function StudentAccountManager({ user }: { user: SafeUser }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(user);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    department: user.department || "Computer Engineering",
    year: String(user.year || 1)
  });

  // Password Form
  const [passForm, setPassForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

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
    }, 1200);
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
    }, 1500);
  }

  return (
    <>
      <div className="stu-card" style={{ marginTop: 24 }}>
        <div className="stu-card-body">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div className="stu-card-icon-box" style={{ background: "#EEF2FF", color: "#4F46E5" }}>
                <UserCheck size={22} />
              </div>
              <div>
                <h3 className="stu-card-title" style={{ fontSize: 18 }}>ข้อมูลบัญชีผู้ใช้งาน</h3>
                <p className="stu-card-desc" style={{ fontSize: 13 }}>
                  รหัสนักศึกษา: <strong>{currentUser.studentId || "—"}</strong> • อีเมล: {currentUser.email} • สาขา: {currentUser.department || "Computer Engineering"} (ชั้นปี {currentUser.year || 1})
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn"
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
                style={{ fontSize: 13 }}
                type="button"
              >
                <User size={14} /> แก้ไขข้อมูลส่วนตัว
              </button>
              <button
                className="btn"
                onClick={() => {
                  setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  setMessage({ text: "", type: "" });
                  setShowPasswordModal(true);
                }}
                style={{ fontSize: 13 }}
                type="button"
              >
                <KeyRound size={14} /> เปลี่ยนรหัสผ่าน
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit Profile Modal ── */}
      {showProfileModal ? (
        <div className="adm-drawer-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="adm-drawer" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="adm-drawer-header">
              <div>
                <h2>แก้ไขข้อมูลส่วนตัว</h2>
                <p>ปรับปรุงชื่อ-นามสกุล และข้อมูลการศึกษา</p>
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
    </>
  );
}
