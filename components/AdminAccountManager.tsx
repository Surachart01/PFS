"use client";

import { useState, type FormEvent } from "react";
import { Plus, ShieldCheck } from "lucide-react";

export type AdminAccount = { id: string; firstName: string; lastName: string; email: string; status: string };

export function AdminAccountManager({ initialAdmins }: { initialAdmins: AdminAccount[] }) {
  const [admins, setAdmins] = useState(initialAdmins);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ text: "", error: false });
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (form.password !== form.confirmPassword) {
      setMessage({ text: "รหัสผ่านทั้งสองช่องไม่ตรงกัน", error: true });
      return;
    }
    setBusy(true);
    setMessage({ text: "", error: false });
    try {
      const response = await fetch("/api/admins", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage({ text: data.message || "เพิ่ม Admin ไม่สำเร็จ กรุณาลองอีกครั้ง", error: true });
        return;
      }
      setAdmins(previous => [data.admin, ...previous]);
      setForm({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" });
      setOpen(false);
      setMessage({ text: "เพิ่ม Admin เรียบร้อยแล้ว บัญชีใหม่สามารถเข้าสู่ระบบได้ทันที", error: false });
    } catch {
      setMessage({ text: "เชื่อมต่อไม่ได้ กรุณาตรวจการเชื่อมต่อแล้วลองอีกครั้ง", error: true });
    } finally { setBusy(false); }
  }

  return <section className="adm-card adm-admin-accounts" aria-labelledby="admin-accounts-title">
    <div className="adm-toolbar">
      <div><h2 id="admin-accounts-title"><ShieldCheck size={20} aria-hidden="true" /> บัญชี Admin</h2><p>Admin ทุกบัญชีสามารถจัดการนักศึกษาและเพิ่ม Admin ได้</p></div>
      <button className="btn btn-primary" type="button" aria-expanded={open} aria-controls="admin-create-form" onClick={() => { setOpen(value => !value); setMessage({ text: "", error: false }); }} disabled={busy}><Plus size={16} aria-hidden="true" /> {open ? "ปิดฟอร์ม" : "เพิ่ม Admin"}</button>
    </div>
    {message.text && <p className={`adm-message adm-message-${message.error ? "error" : "success"}`} role={message.error ? "alert" : "status"}>{message.text}</p>}
    {open && <form id="admin-create-form" className="adm-admin-create" onSubmit={submit}>
      <fieldset disabled={busy}>
        <legend>ข้อมูล Admin ใหม่</legend>
        <div className="adm-form-row">
          <div className="field"><label htmlFor="admin-first-name">ชื่อ</label><input className="input" id="admin-first-name" autoComplete="given-name" required maxLength={100} value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} /></div>
          <div className="field"><label htmlFor="admin-last-name">นามสกุล</label><input className="input" id="admin-last-name" autoComplete="family-name" required maxLength={100} value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} /></div>
        </div>
        <div className="field"><label htmlFor="admin-email">อีเมลสถาบัน</label><input className="input" id="admin-email" type="email" autoComplete="email" required maxLength={254} aria-describedby="admin-email-hint" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /><small id="admin-email-hint">ใช้อีเมลลงท้าย @kmitl.ac.th</small></div>
        <div className="adm-form-row">
          <div className="field"><label htmlFor="admin-password">รหัสผ่าน (8–128 ตัวอักษร)</label><input className="input" id="admin-password" type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
          <div className="field"><label htmlFor="admin-confirm-password">ยืนยันรหัสผ่าน</label><input className="input" id="admin-confirm-password" type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} /></div>
        </div>
        <button className="btn btn-primary" type="submit">{busy ? "กำลังเพิ่ม Admin…" : "บันทึก Admin ใหม่"}</button>
      </fieldset>
    </form>}
    <div className="adm-table-wrap"><table className="adm-table"><caption className="adm-admin-caption">Admin ทั้งหมด {admins.length} บัญชี</caption><thead><tr><th scope="col">ชื่อ–นามสกุล</th><th scope="col">อีเมล</th><th scope="col">สถานะ</th></tr></thead><tbody>{admins.map(admin => <tr key={admin.id}><td>{admin.firstName} {admin.lastName}</td><td>{admin.email}</td><td>{admin.status === "active" ? "เปิดใช้งาน" : "ปิดใช้งาน"}</td></tr>)}</tbody></table></div>
  </section>;
}
