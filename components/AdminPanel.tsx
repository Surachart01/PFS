"use client";

import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Database,
  Edit2,
  ExternalLink,
  Eye,
  KeyRound,
  Plus,
  Power,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Users,
  X
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { AdminShell } from "@/components/AdminShell";

type AdminStudent = {
  id: string;
  studentId?: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  year?: number;
  status: string;
  portfolioStatus?: string;
  portfolioSlug?: string;
  updatedAt?: string;
};

type SortKey = "name" | "year" | "portfolioStatus";

const YEAR_LABELS: Record<number, string> = { 1: "ปี 1", 2: "ปี 2", 3: "ปี 3", 4: "ปี 4" };

export function AdminPanel({
  initialStudents,
  user
}: {
  initialStudents: AdminStudent[];
  user: { firstName: string; lastName: string; email?: string; role: string };
}) {
  const [students, setStudents] = useState(initialStudents);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<AdminStudent | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "students" | "published" | "accounts">("dashboard");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);

  // Add form state
  const [form, setForm] = useState({
    studentId: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    department: "Computer Engineering",
    year: "1"
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    studentId: "",
    firstName: "",
    lastName: "",
    email: "",
    department: "Computer Engineering",
    year: "1"
  });

  const stats = useMemo(() => ({
    total: students.length,
    published: students.filter((s) => s.portfolioStatus === "published").length,
    draft: students.filter((s) => s.portfolioStatus === "draft").length,
    noPortfolio: students.filter((s) => !s.portfolioStatus).length
  }), [students]);

  const filtered = useMemo(() => {
    const text = search.toLowerCase();
    let list = students.filter((s) => {
      const row = `${s.studentId ?? ""} ${s.firstName} ${s.lastName} ${s.email}`.toLowerCase();
      return row.includes(text);
    });

    // Filter by Active Tab
    if (activeTab === "published") {
      list = list.filter((s) => s.portfolioStatus === "published");
    }

    return list.sort((a, b) => {
      let va = "", vb = "";
      if (sortKey === "name") { va = `${a.firstName} ${a.lastName}`; vb = `${b.firstName} ${b.lastName}`; }
      else if (sortKey === "year") { va = String(a.year ?? 0); vb = String(b.year ?? 0); }
      else if (sortKey === "portfolioStatus") { va = a.portfolioStatus ?? ""; vb = b.portfolioStatus ?? ""; }
      return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }, [students, search, sortKey, sortAsc, activeTab]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return null;
    return sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  }

  async function reload() {
    const res = await fetch("/api/students");
    const data = await res.json();
    setStudents(data.students || []);
  }

  async function addStudent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, year: Number(form.year) })
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setMessage({ text: data.message || "เพิ่มนักศึกษาไม่สำเร็จ", type: "error" });
      return;
    }

    setForm({ studentId: "", firstName: "", lastName: "", email: "", password: "", department: "Computer Engineering", year: "1" });
    setMessage({ text: "✅ เพิ่มนักศึกษาเรียบร้อยแล้ว!", type: "success" });
    setShowAddPanel(false);
    await reload();
  }

  function openEditModal(student: AdminStudent) {
    setEditingStudent(student);
    setEditForm({
      studentId: student.studentId || "",
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      department: student.department || "Computer Engineering",
      year: String(student.year || 1)
    });
  }

  async function handleUpdateStudent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingStudent) return;
    setLoading(true);

    const res = await fetch(`/api/students/${editingStudent.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editForm, year: Number(editForm.year) })
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      alert(data.message || "แก้ไขข้อมูลไม่สำเร็จ");
      return;
    }

    setEditingStudent(null);
    await reload();
  }

  async function handleToggleStatus(student: AdminStudent) {
    const next = student.status === "active" ? "ปิดใช้งาน" : "เปิดใช้งาน";
    if (!confirm(`ต้องการ ${next} บัญชีของ "${student.firstName} ${student.lastName}" หรือไม่?`)) return;

    const res = await fetch(`/api/students/${student.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle-status" })
    });

    if (res.ok) {
      await reload();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.message || "ไม่สามารถเปลี่ยนสถานะได้");
    }
  }

  async function handleResetPassword(student: AdminStudent) {
    const newPass = prompt(`กรุณากรอกรหัสผ่านใหม่สำหรับ ${student.firstName} ${student.lastName} (เว้นว่าง = ใช้รหัสนักศึกษา):`, student.studentId || "Student@1234");
    if (newPass === null) return;

    const res = await fetch(`/api/students/${student.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset-password", password: newPass })
    });

    if (res.ok) {
      alert(`✅ รีเซ็ตรหัสผ่านของ ${student.firstName} เรียบร้อยแล้ว!`);
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.message || "รีเซ็ตรหัสผ่านไม่สำเร็จ");
    }
  }

  async function handleDeleteStudent(student: AdminStudent) {
    if (!confirm(`⚠️ ยืนยันการลบบัญชีนักศึกษา "${student.firstName} ${student.lastName}" (${student.studentId})?\nการกระทำนี้จะลบทั้งบัญชีและผลงาน Portfolio ทั้งหมดออกจากระบบอย่างถาวร!`)) {
      return;
    }

    const res = await fetch(`/api/students/${student.id}`, {
      method: "DELETE"
    });

    if (res.ok) {
      await reload();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.message || "ลบบัญชีไม่สำเร็จ");
    }
  }

  const initials = (s: AdminStudent) =>
    `${s.firstName[0] ?? ""}${s.lastName[0] ?? ""}`.toUpperCase();

  const avatarColor = (s: AdminStudent) => {
    const colors = ["#4f46e5", "#0284c7", "#059669", "#d97706", "#db2777", "#7c3aed"];
    const idx = (s.firstName.charCodeAt(0) + s.lastName.charCodeAt(0)) % colors.length;
    return colors[idx];
  };

  const pageTitle = activeTab === "dashboard"
    ? "Admin Dashboard"
    : activeTab === "students"
    ? "รายชื่อนักศึกษาทั้งหมด"
    : activeTab === "published"
    ? "Portfolio ที่เผยแพร่แล้ว"
    : "การจัดการบัญชีนักศึกษา";

  const pageDesc = activeTab === "dashboard"
    ? "ภาพรวมนักศึกษา, สถิติระบบ, และสถานะ Portfolio ทั้งหมด"
    : activeTab === "students"
    ? `แสดงรายชื่อนักศึกษาทั้งหมดในระบบ (${students.length} บัญชี)`
    : activeTab === "published"
    ? `แสดงเฉพาะนักศึกษาที่เปิดเผยแพร่ Portfolio สู่สาธารณะแล้ว (${stats.published} ผลงาน)`
    : "บริหารจัดการสิทธิ์บัญชีผู้ใช้ (ระงับ/เปิดใช้, รีเซ็ตรหัสผ่าน, ลบบัญชี, แก้ไขข้อมูล)";

  return (
    <AdminShell
      activeTab={activeTab}
      onOpenAddStudent={() => setShowAddPanel(true)}
      onOpenSettings={() => setShowSettingsModal(true)}
      onSelectTab={(tab) => setActiveTab(tab as any)}
      pageDesc={pageDesc}
      pageTitle={pageTitle}
      publishedCount={stats.published}
      studentCount={stats.total}
      user={user}
    >
      {/* ── Stats Row (Always visible in Dashboard & Overview) ── */}
      <div className="adm-stats-row">
        <div
          className={`adm-stat-card adm-stat-indigo ${activeTab === "students" ? "active-stat" : ""}`}
          onClick={() => setActiveTab("students")}
          style={{ cursor: "pointer" }}
          title="คลิกเพื่อดูรายชื่อนักศึกษาทั้งหมด"
        >
          <div className="adm-stat-card-row">
            <div className="adm-stat-icon-box">
              <Users size={20} />
            </div>
            <div className="adm-stat-info">
              <span>นักศึกษาทั้งหมด</span>
              <strong>{stats.total}</strong>
            </div>
          </div>
          <div className="adm-stat-trend">
            <TrendingUp size={14} />
            <span>คลิกดูทั้งหมด →</span>
          </div>
        </div>

        <div
          className={`adm-stat-card adm-stat-green ${activeTab === "published" ? "active-stat" : ""}`}
          onClick={() => setActiveTab("published")}
          style={{ cursor: "pointer" }}
          title="คลิกเพื่อดู Portfolio ที่เผยแพร่แล้ว"
        >
          <div className="adm-stat-card-row">
            <div className="adm-stat-icon-box">
              <BookOpen size={20} />
            </div>
            <div className="adm-stat-info">
              <span>เผยแพร่แล้ว</span>
              <strong>{stats.published}</strong>
            </div>
          </div>
          <div className="adm-stat-trend">
            <TrendingUp size={14} />
            <span>คลิกดูเผยแพร่แล้ว →</span>
          </div>
        </div>

        <div className="adm-stat-card adm-stat-amber">
          <div className="adm-stat-card-row">
            <div className="adm-stat-icon-box">
              <RefreshCw size={20} />
            </div>
            <div className="adm-stat-info">
              <span>ฉบับร่าง</span>
              <strong>{stats.draft}</strong>
            </div>
          </div>
          <div className="adm-stat-trend">
            <span>กำลังออกแบบ</span>
          </div>
        </div>

        <div className="adm-stat-card adm-stat-slate">
          <div className="adm-stat-card-row">
            <div className="adm-stat-icon-box">
              <Users size={20} />
            </div>
            <div className="adm-stat-info">
              <span>ยังไม่สร้าง</span>
              <strong>{stats.noPortfolio}</strong>
            </div>
          </div>
          <div className="adm-stat-trend">
            <span>รอดำเนินการ</span>
          </div>
        </div>
      </div>

      {/* Active Tab Notice Banner */}
      {activeTab === "published" ? (
        <div style={{
          background: "#ECFDF5",
          border: "1px solid #A7F3D0",
          borderRadius: "10px",
          padding: "12px 16px",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "#065F46",
          fontSize: "14px"
        }}>
          <span>
            📌 <strong>กำลังกรอง:</strong> แสดงเฉพาะนักศึกษาที่เปิดเผยแพร่ Portfolio แล้ว ({stats.published} รายการ)
          </span>
          <button
            className="btn"
            onClick={() => setActiveTab("students")}
            style={{ fontSize: "12px", padding: "4px 10px", background: "#FFFFFF" }}
            type="button"
          >
            แสดงนักศึกษาทั้งหมด
          </button>
        </div>
      ) : null}

      {activeTab === "accounts" ? (
        <div style={{
          background: "#EFF6FF",
          border: "1px solid #BFDBFE",
          borderRadius: "10px",
          padding: "12px 16px",
          marginBottom: "16px",
          color: "#1E40AF",
          fontSize: "14px"
        }}>
          🛡️ <strong>โหมดจัดการบัญชี:</strong> คุณสามารถคลิกปุ่มเปิด/ปิดสถานะบัญชี, รีเซ็ตรหัสผ่าน, หรือแก้ไขข้อมูลนักศึกษาได้ทันทีในคอลัมน์ด้านขวาสุดของตาราง
        </div>
      ) : null}

      {/* ── Toolbar ───────────────────────── */}
      <div className="adm-card">
        <div className="adm-toolbar">
          <div className="adm-search-wrap">
            <Search size={16} className="adm-search-icon" />
            <input
              className="adm-search-input"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อ, รหัสนักศึกษา, อีเมล..."
              value={search}
            />
            {search ? (
              <button className="adm-search-clear" onClick={() => setSearch("")} type="button">
                <X size={14} />
              </button>
            ) : null}
          </div>
          <div className="adm-toolbar-right">
            <button className="btn adm-btn-reload" onClick={reload} type="button">
              <RefreshCw size={15} />
              โหลดใหม่
            </button>
            <button
              className="btn btn-primary adm-btn-add"
              onClick={() => setShowAddPanel(true)}
              type="button"
            >
              <Plus size={16} />
              เพิ่มนักศึกษา
            </button>
          </div>
        </div>

        {/* ── Table ─────────────────────────── */}
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th
                  className="adm-th-sortable"
                  onClick={() => toggleSort("name")}
                >
                  <span>นักศึกษา</span>
                  <SortIcon col="name" />
                </th>
                <th>อีเมล / สาขา</th>
                <th
                  className="adm-th-sortable"
                  onClick={() => toggleSort("year")}
                >
                  <span>ชั้นปี</span>
                  <SortIcon col="year" />
                </th>
                <th>สถานะบัญชี</th>
                <th
                  className="adm-th-sortable"
                  onClick={() => toggleSort("portfolioStatus")}
                >
                  <span>Portfolio</span>
                  <SortIcon col="portfolioStatus" />
                </th>
                <th>ตรวจผลงาน</th>
                <th style={{ textAlign: "center" }}>จัดการบัญชี</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td className="adm-empty-row" colSpan={7}>
                    <Users size={32} style={{ opacity: 0.3 }} />
                    <span>{search ? `ไม่พบผลลัพธ์สำหรับ "${search}"` : "ยังไม่มีนักศึกษาในรายการนี้"}</span>
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr className="adm-tr" key={s.id}>
                    <td>
                      <div className="adm-student-cell">
                        <div
                          className="adm-student-avatar"
                          style={{ background: avatarColor(s) }}
                        >
                          {initials(s)}
                        </div>
                        <div className="adm-student-name-col">
                          <span className="adm-student-fullname">
                            {s.firstName} {s.lastName}
                          </span>
                          <span className="adm-student-id">{s.studentId ?? "—"}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span className="adm-td-muted" style={{ fontSize: "13px" }}>{s.email}</span>
                        <span style={{ fontSize: "11px", color: "#64748b" }}>{s.department || "Computer Engineering"}</span>
                      </div>
                    </td>
                    <td>
                      {s.year ? (
                        <span className="adm-year-badge">{YEAR_LABELS[s.year] ?? `ปี ${s.year}`}</span>
                      ) : (
                        <span className="adm-td-muted">—</span>
                      )}
                    </td>
                    <td>
                      <button
                        className={`adm-status ${s.status}`}
                        onClick={() => handleToggleStatus(s)}
                        style={{ border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                        title="คลิกเพื่อสลับสถานะเปิด/ปิดบัญชี"
                        type="button"
                      >
                        <Power size={11} />
                        {s.status === "active" ? "ใช้งาน" : "ระงับใช้"}
                      </button>
                    </td>
                    <td>
                      <span className={`adm-status ${s.portfolioStatus ?? "none"}`}>
                        {s.portfolioStatus === "published"
                          ? "เผยแพร่แล้ว"
                          : s.portfolioStatus === "draft"
                          ? "ฉบับร่าง"
                          : "ยังไม่สร้าง"}
                      </span>
                    </td>
                    <td>
                      {s.portfolioStatus ? (
                        <div style={{ display: "flex", gap: "6px" }}>
                          {s.portfolioStatus === "published" && s.portfolioSlug ? (
                            <a
                              className="adm-link-btn"
                              href={`/r/${s.portfolioSlug}`}
                              rel="noopener noreferrer"
                              target="_blank"
                              title="เปิดดูหน้าสาธารณะ"
                            >
                              <ExternalLink size={12} />
                              เปิดดู
                            </a>
                          ) : null}
                          <a
                            className="adm-link-btn"
                            href={`/admin/preview/${s.id}`}
                            style={{ background: "#EEF2FF", color: "#3730A3" }}
                            title="ตรวจผลงานและแบบร่าง"
                          >
                            <Eye size={12} />
                            ตรวจงาน
                          </a>
                        </div>
                      ) : (
                        <span className="adm-td-muted" style={{ fontSize: "12px" }}>ยังไม่มีงาน</span>
                      )}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          className="btn"
                          onClick={() => openEditModal(s)}
                          style={{ padding: "4px 8px", fontSize: "12px" }}
                          title="แก้ไขข้อมูลนักศึกษา"
                          type="button"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn"
                          onClick={() => handleResetPassword(s)}
                          style={{ padding: "4px 8px", fontSize: "12px" }}
                          title="รีเซ็ตรหัสผ่าน"
                          type="button"
                        >
                          <KeyRound size={13} />
                        </button>
                        <button
                          className="btn"
                          onClick={() => handleDeleteStudent(s)}
                          style={{ padding: "4px 8px", fontSize: "12px", color: "#EF4444", borderColor: "#FCA5A5" }}
                          title="ลบบัญชีนักศึกษา"
                          type="button"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="adm-table-footer">
          แสดง <strong>{filtered.length}</strong> / {students.length} รายการ
        </div>
      </div>

      {/* ── Add Student Slide Panel ────────── */}
      {showAddPanel ? (
        <div className="adm-drawer-overlay" onClick={() => setShowAddPanel(false)}>
          <div className="adm-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="adm-drawer-header">
              <div>
                <h2>เพิ่มนักศึกษาใหม่</h2>
                <p>สร้างบัญชีให้นักศึกษาเพื่อเริ่มสร้าง Portfolio</p>
              </div>
              <button
                className="adm-drawer-close"
                onClick={() => setShowAddPanel(false)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>
            <form className="adm-drawer-form" onSubmit={addStudent}>
              <div className="adm-form-row">
                <div className="field">
                  <label htmlFor="studentId">รหัสนักศึกษา</label>
                  <input
                    className="input"
                    id="studentId"
                    onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                    placeholder="64XXXXXXX"
                    required
                    value={form.studentId}
                  />
                </div>
                <div className="field">
                  <label htmlFor="year">ชั้นปี</label>
                  <select
                    className="select"
                    id="year"
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    value={form.year}
                  >
                    <option value="1">ปี 1</option>
                    <option value="2">ปี 2</option>
                    <option value="3">ปี 3</option>
                    <option value="4">ปี 4</option>
                  </select>
                </div>
              </div>
              <div className="adm-form-row">
                <div className="field">
                  <label htmlFor="firstName">ชื่อ</label>
                  <input
                    className="input"
                    id="firstName"
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    placeholder="ชื่อจริง"
                    required
                    value={form.firstName}
                  />
                </div>
                <div className="field">
                  <label htmlFor="lastName">นามสกุล</label>
                  <input
                    className="input"
                    id="lastName"
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    placeholder="นามสกุล"
                    required
                    value={form.lastName}
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="email">อีเมล</label>
                <input
                  className="input"
                  id="email"
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@example.com"
                  required
                  type="email"
                  value={form.email}
                />
              </div>
              <div className="field">
                <label htmlFor="department">สาขา/ภาควิชา</label>
                <input
                  className="input"
                  id="department"
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  value={form.department}
                />
              </div>
              <div className="field">
                <label htmlFor="password">รหัสผ่านเริ่มต้น</label>
                <input
                  className="input"
                  id="password"
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="เว้นว่าง = ใช้รหัสนักศึกษา"
                  value={form.password}
                />
              </div>
              {message.text ? (
                <div className={`adm-message adm-message-${message.type}`}>{message.text}</div>
              ) : null}
              <div className="adm-drawer-footer">
                <button
                  className="btn"
                  onClick={() => setShowAddPanel(false)}
                  type="button"
                >
                  ยกเลิก
                </button>
                <button className="btn btn-primary" disabled={loading} type="submit">
                  <Plus size={16} />
                  {loading ? "กำลังเพิ่ม..." : "เพิ่มนักศึกษา"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* ── Edit Student Modal ────────── */}
      {editingStudent ? (
        <div className="adm-drawer-overlay" onClick={() => setEditingStudent(null)}>
          <div className="adm-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="adm-drawer-header">
              <div>
                <h2>แก้ไขข้อมูลนักศึกษา</h2>
                <p>ปรับปรุงข้อมูลประจำตัวของนักศึกษาในระบบ</p>
              </div>
              <button
                className="adm-drawer-close"
                onClick={() => setEditingStudent(null)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>
            <form className="adm-drawer-form" onSubmit={handleUpdateStudent}>
              <div className="adm-form-row">
                <div className="field">
                  <label htmlFor="edit-studentId">รหัสนักศึกษา</label>
                  <input
                    className="input"
                    id="edit-studentId"
                    onChange={(e) => setEditForm({ ...editForm, studentId: e.target.value })}
                    required
                    value={editForm.studentId}
                  />
                </div>
                <div className="field">
                  <label htmlFor="edit-year">ชั้นปี</label>
                  <select
                    className="select"
                    id="edit-year"
                    onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                    value={editForm.year}
                  >
                    <option value="1">ปี 1</option>
                    <option value="2">ปี 2</option>
                    <option value="3">ปี 3</option>
                    <option value="4">ปี 4</option>
                  </select>
                </div>
              </div>
              <div className="adm-form-row">
                <div className="field">
                  <label htmlFor="edit-firstName">ชื่อ</label>
                  <input
                    className="input"
                    id="edit-firstName"
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    required
                    value={editForm.firstName}
                  />
                </div>
                <div className="field">
                  <label htmlFor="edit-lastName">นามสกุล</label>
                  <input
                    className="input"
                    id="edit-lastName"
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    required
                    value={editForm.lastName}
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="edit-email">อีเมล</label>
                <input
                  className="input"
                  id="edit-email"
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                  type="email"
                  value={editForm.email}
                />
              </div>
              <div className="field">
                <label htmlFor="edit-department">สาขา/ภาควิชา</label>
                <input
                  className="input"
                  id="edit-department"
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  value={editForm.department}
                />
              </div>
              <div className="adm-drawer-footer">
                <button
                  className="btn"
                  onClick={() => setEditingStudent(null)}
                  type="button"
                >
                  ยกเลิก
                </button>
                <button className="btn btn-primary" disabled={loading} type="submit">
                  {loading ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* ── System Settings Modal ────────── */}
      {showSettingsModal ? (
        <div className="adm-drawer-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="adm-drawer" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="adm-drawer-header">
              <div>
                <h2>⚙️ การตั้งค่าและสถานะระบบ</h2>
                <p>ข้อมูลสภาพแวดล้อมทางเทคนิคและสถิติเซิร์ฟเวอร์</p>
              </div>
              <button
                className="adm-drawer-close"
                onClick={() => setShowSettingsModal(false)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <Database size={18} color="#2563eb" />
                  <strong style={{ fontSize: "14px", color: "#1e293b" }}>ระบบฐานข้อมูล (MongoDB)</strong>
                </div>
                <p style={{ margin: 0, fontSize: "13px", color: "#475569" }}>
                  สถานะ: <span style={{ color: "#059669", fontWeight: 700 }}>🟢 เชื่อมต่อแล้ว (Connected)</span><br />
                  คอลเลกชันหลัก: <code>users</code>, <code>portfolios</code>, <code>sessions</code>
                </p>
              </div>

              <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <ShieldCheck size={18} color="#7c3aed" />
                  <strong style={{ fontSize: "14px", color: "#1e293b" }}>ความปลอดภัย (Security & Crypto)</strong>
                </div>
                <p style={{ margin: 0, fontSize: "13px", color: "#475569" }}>
                  การเข้ารหัสผ่าน: <strong>scrypt with 16-byte random salt</strong><br />
                  การลงนาม Session: <strong>HMAC-SHA256 Signed HttpOnly Cookie</strong>
                </p>
              </div>

              <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <Server size={18} color="#059669" />
                  <strong style={{ fontSize: "14px", color: "#1e293b" }}>เทคโนโลยี (Architecture)</strong>
                </div>
                <p style={{ margin: 0, fontSize: "13px", color: "#475569" }}>
                  Frontend/Backend: <strong>Next.js 16 (Turbopack) + React 19</strong><br />
                  เวอร์ชันระบบ: <strong>PFS v1.0.0 (Senior Project 1)</strong>
                </p>
              </div>
            </div>
            <div className="adm-drawer-footer">
              <button
                className="btn btn-primary"
                onClick={() => setShowSettingsModal(false)}
                style={{ width: "100%" }}
                type="button"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
