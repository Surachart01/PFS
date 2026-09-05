import { ArrowLeft, LayoutDashboard, Sparkles } from "lucide-react";
import Link from "next/link";

import { LogoutButton } from "@/components/LogoutButton";
import type { SafeUser } from "@/lib/types";

export function AppShell({ children, user }: { children: React.ReactNode; user: SafeUser }) {
  const dashboardHref = user.role === "admin" ? "/admin" : "/student";

  return (
    <main className="shell">
      <header className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link
            className="btn"
            href={dashboardHref}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              fontSize: "13px",
              textDecoration: "none"
            }}
            title="กลับไปยังหน้า Dashboard"
          >
            <ArrowLeft size={15} />
            <span>กลับ Dashboard</span>
          </Link>

          <div className="brand">
            <div className="brand-logo-badge">
              <Sparkles size={18} />
            </div>
            <div className="brand-info">
              <strong className="brand-title">Resume Studio</strong>
              <span className="brand-user">
                {user.firstName} {user.lastName}
                <span className={`user-role-badge ${user.role}`}>
                  {user.role === "admin" ? "ผู้ดูแลระบบ" : "นักศึกษา"}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link
            className="btn"
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              fontSize: "13px",
              textDecoration: "none"
            }}
            target="_blank"
          >
            <LayoutDashboard size={14} />
            <span>สารบบสาธารณะ</span>
          </Link>
          <LogoutButton />
        </div>
      </header>
      <div className="page">{children}</div>
    </main>
  );
}
