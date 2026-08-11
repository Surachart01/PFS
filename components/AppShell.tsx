import { Sparkles } from "lucide-react";

import { LogoutButton } from "@/components/LogoutButton";
import type { SafeUser } from "@/lib/types";

export function AppShell({ children, user }: { children: React.ReactNode; user: SafeUser }) {
  return (
    <main className="shell">
      <header className="topbar">
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
        <LogoutButton />
      </header>
      <div className="page">{children}</div>
    </main>
  );
}
