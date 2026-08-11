"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button className="btn btn-ghost" disabled={loading} onClick={logout} type="button">
      <LogOut size={18} />
      {loading ? "กำลังออก..." : "ออกจากระบบ"}
    </button>
  );
}
