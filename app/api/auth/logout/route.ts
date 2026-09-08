import { NextResponse } from "next/server";

import { clearSessionCookie } from "@/lib/auth";

/**
 * ฟังก์ชัน 4.2: ออกจากระบบและทำลายเซสชัน (User Logout API)
 * หน้าที่: สั่งให้เบราว์เซอร์ทำลายคุกกี้ portfolio_session ทิ้งทันทีเมื่อผู้ใช้กดออกจากระบบ
 * เมธอด: POST /api/auth/logout
 * คืนค่า: NextResponse JSON { ok: true }
 */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  return response;
}
