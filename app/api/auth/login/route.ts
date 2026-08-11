import { NextRequest, NextResponse } from "next/server";

import { createSessionToken, setSessionCookie, verifyPassword } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import type { UserDoc } from "@/lib/types";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const identifier = String(body?.identifier || "").trim().toLowerCase();
  const password = String(body?.password || "");

  if (!identifier || !password) {
    return NextResponse.json({ message: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
  }

  const db = await getDb();
  const user = await db.collection<UserDoc>("users").findOne({
    $or: [{ email: identifier }, { studentId: identifier }],
    status: "active"
  });

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ message: "อีเมล/รหัสนักศึกษาหรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  }

  const token = createSessionToken({ userId: user._id.toString(), role: user.role });
  const response = NextResponse.json({ ok: true, role: user.role });
  setSessionCookie(response, token);
  return response;
}
