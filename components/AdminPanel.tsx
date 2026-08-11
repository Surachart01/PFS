"use client";

import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Plus,
  RefreshCw,
  Search,
  TrendingUp,
  Users,
  X
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

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

export function AdminPanel({ initialStudents }: { initialStudents: AdminStudent[] }) {
  const [students, setStudents] = useState(initialStudents);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);

  const [form, setForm] = useState({
    studentId: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
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
    const list = students.filter((s) => {
      const row = `${s.studentId ?? ""} ${s.firstName} ${s.lastName} ${s.email}`.toLowerCase();
      return row.includes(text);
    });
    return list.sort((a, b) => {
      let va = "", vb = "";
      if (sortKey === "name") { va = `${a.firstName} ${a.lastName}`; vb = `${b.firstName} ${b.lastName}`; }
      else if (sortKey === "year") { va = String(a.year ?? 0); vb = String(b.year ?? 0); }
      else if (sortKey === "portfolioStatus") { va = a.portfolioStatus ?? ""; vb = b.portfolioStatus ?? ""; }
      return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }, [students, search, sortKey, sortAsc]);

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

  const initials = (s: AdminStudent) =>
    `${s.firstName[0] ?? ""}${s.lastName[0] ?? ""}`.toUpperCase();

  const avatarColor = (s: AdminStudent) => {
    const colors = ["#4f46e5", "#0284c7", "#059669", "#d97706", "#db2777", "#7c3aed"];
    const idx = (s.firstName.charCodeAt(0) + s.lastName.charCodeAt(0)) % colors.length;
    return colors[idx];
  };

  return (
    <>
      {/* ── Stats Row ─────────────────────── */}
      <div className="adm-stats-row">
        <div className="adm-stat-card adm-stat-indigo">
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
            <span>บัญชีที่ใช้งาน</span>
          </div>
        </div>
        <div className="adm-stat-card adm-stat-green">
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
            <span>Portfolio สาธารณะ</span>
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
            <span>กำลังดำเนินการ</span>
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
                <th>อีเมล</th>
                <th
                  className="adm-th-sortable"
                  onClick={() => toggleSort("year")}
                >
                  <span>ชั้นปี</span>
                  <SortIcon col="year" />
                </th>
                <th>บัญชี</th>
                <th
                  className="adm-th-sortable"
                  onClick={() => toggleSort("portfolioStatus")}
                >
                  <span>Portfolio</span>
                  <SortIcon col="portfolioStatus" />
                </th>
                <th>ลิงก์</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td className="adm-empty-row" colSpan={6}>
                    <Users size={32} style={{ opacity: 0.3 }} />
                    <span>{search ? `ไม่พบผลลัพธ์สำหรับ "${search}"` : "ยังไม่มีนักศึกษาในระบบ"}</span>
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
                    <td className="adm-td-muted">{s.email}</td>
                    <td>
                      {s.year ? (
                        <span className="adm-year-badge">{YEAR_LABELS[s.year] ?? `ปี ${s.year}`}</span>
                      ) : (
                        <span className="adm-td-muted">—</span>
                      )}
                    </td>
                    <td>
                      <span className={`adm-status ${s.status}`}>{s.status === "active" ? "ใช้งาน" : "ปิดใช้"}</span>
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
                      {s.portfolioSlug && s.portfolioStatus === "published" ? (
                        <a
                          className="adm-link-btn"
                          href={`/r/${s.portfolioSlug}`}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          <ExternalLink size={13} />
                          เปิดดู
                        </a>
                      ) : (
                        <span className="adm-td-muted">—</span>
                      )}
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
    </>
  );
}
