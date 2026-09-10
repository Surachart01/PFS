"use client";

import { LockKeyhole, LogIn, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("admin@kmitl.ac.th");
  const [password, setPassword] = useState("Admin@1234");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const cleanIdentifier = identifier.trim();
    if (cleanIdentifier.includes("@") && !cleanIdentifier.toLowerCase().endsWith("@kmitl.ac.th")) {
      setError("อีเมลต้องใช้อีเมลสถาบัน (@kmitl.ac.th) เท่านั้น");
      return;
    }

    setLoading(true);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: cleanIdentifier, password })
    });

    setLoading(false);
    if (!response.ok) {
      const data = await response.json().catch(() => ({ message: "เข้าสู่ระบบไม่สำเร็จ" }));
      setError(data.message || "เข้าสู่ระบบไม่สำเร็จ");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="auth-page">
      <div className="auth-ambient-blob-1" />
      <div className="auth-ambient-blob-2" />
      <section className="panel auth-card">
        <div className="panel-body">
          <div className="auth-header">
            <div className="auth-brand-badge">
              <Sparkles size={22} />
            </div>
            <h1>เข้าสู่ระบบ</h1>
            <p className="muted">ระบบ Resume Studio นักศึกษาวิศวกรรมคอมพิวเตอร์</p>
          </div>

          <form className="form" onSubmit={submit}>
            <div className="field">
              <label htmlFor="identifier">อีเมลหรือรหัสนักศึกษา</label>
              <input
                className="input"
                id="identifier"
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="admin@kmitl.ac.th หรือ รหัสนักศึกษา"
                value={identifier}
              />
            </div>
            <div className="field">
              <label htmlFor="password">รหัสผ่าน</label>
              <input
                className="input"
                id="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="รหัสผ่าน"
                type="password"
                value={password}
              />
            </div>
            {error ? <div className="alert">{error}</div> : null}
            <button className="btn btn-primary btn-full-lg" disabled={loading} type="submit">
              {loading ? (
                "กำลังเข้าสู่ระบบ..."
              ) : (
                <>
                  <LogIn size={18} />
                  เข้าสู่ระบบ
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
