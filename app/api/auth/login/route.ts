import { NextRequest, NextResponse } from "next/server";

import { createSessionToken, hashPassword, isValidKmitlEmail, setSessionCookie, verifyPassword } from "@/lib/auth";
import { ensureIndexes, getDb } from "@/lib/mongodb";
import type { UserDoc } from "@/lib/types";

/**
 * ฟังก์ชัน 4.1: ตรวจสอบการเข้าสู่ระบบและออกเซสชันคุกกี้ (User Login API)
 * หน้าที่: รับ identifier (รหัสนักศึกษา/อีเมล) และ password มาตรวจสอบกับฐานข้อมูล MongoDB
 *         หากถูกต้องจะสร้าง Token และแนบ Cookie ชื่อ portfolio_session ส่งกลับไปยังเบราว์เซอร์
 * เมธอด: POST /api/auth/login
 * พารามิเตอร์: request (NextRequest) บรรจุ JSON { identifier, password }
 * คืนค่า: NextResponse JSON { ok: true, role } พร้อม Set-Cookie header
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const identifier = String(body?.identifier || "").trim().toLowerCase();
    const password = String(body?.password || "");

    if (!identifier || !password) {
      return NextResponse.json({ message: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
    }

    if (identifier.includes("@") && !isValidKmitlEmail(identifier)) {
      return NextResponse.json({ message: "อีเมลต้องใช้อีเมลสถาบัน (@kmitl.ac.th) เท่านั้น" }, { status: 400 });
    }

    const db = await getDb();
    let user = await db.collection<UserDoc>("users").findOne({
      $or: [{ email: identifier }, { studentId: identifier }],
      status: "active"
    });

    const adminEmail = (process.env.ADMIN_EMAIL || "admin@kmitl.ac.th").trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@1234";

    // Auto-seed Admin account on Vercel/Cloud DB if users collection is empty or Admin login matches env vars
    if (!user) {
      const userCount = await db.collection("users").countDocuments();
      if (userCount === 0 || identifier === adminEmail) {
        if (identifier === adminEmail && password === adminPassword) {
          await ensureIndexes();
          const adminUserDoc: Omit<UserDoc, "_id"> = {
            firstName: "Admin",
            lastName: "System",
            email: adminEmail,
            passwordHash: hashPassword(adminPassword),
            role: "admin",
            status: "active",
            createdAt: new Date(),
            updatedAt: new Date()
          };

          await db.collection("users").updateOne(
            { email: adminEmail },
            { $setOnInsert: adminUserDoc },
            { upsert: true }
          );

          user = await db.collection<UserDoc>("users").findOne({ email: adminEmail });
        }
      }
    }

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ message: "อีเมล/รหัสนักศึกษาหรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
    }

    const token = createSessionToken({ userId: user._id.toString(), role: user.role });
    const response = NextResponse.json({ ok: true, role: user.role });
    setSessionCookie(response, token);
    return response;
  } catch (err: any) {
    console.error("Login API Error:", err);
    return NextResponse.json({ message: `เชื่อมต่อฐานข้อมูล MongoDB ล้มเหลว: ${err?.message || err}` }, { status: 500 });
  }
}
