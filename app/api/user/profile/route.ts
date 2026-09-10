import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { getCurrentUser, toSafeUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import type { UserDoc } from "@/lib/types";

/**
 * ฟังก์ชัน 4.13: ดึงข้อมูลโปรไฟล์ของผู้ใช้ปัจจุบัน (Get My Profile API)
 * หน้าที่: ดึงข้อมูลส่วนตัว (ชื่อ-สกุล แผนกวิชา ชั้นปี) ของผู้ใช้ที่กำลังล็อกอินอยู่
 * เมธอด: GET /api/user/profile
 * คืนค่า: NextResponse JSON { profile: SafeUser }
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const db = await getDb();
  const dbUser = await db.collection<UserDoc>("users").findOne({ _id: new ObjectId(user.id) });
  if (!dbUser) {
    return NextResponse.json({ message: "ไม่พบข้อมูลผู้ใช้งาน" }, { status: 404 });
  }

  return NextResponse.json({ profile: toSafeUser(dbUser) });
}

/**
 * ฟังก์ชัน 4.14: นักศึกษาแก้ไขข้อมูลส่วนตัวของตนเอง (Update My Profile API)
 * หน้าที่: ตรวจสอบความถูกต้องของชื่อ-นามสกุล และอัปเดตข้อมูลส่วนตัวลงฐานข้อมูล
 * เมธอด: PUT /api/user/profile
 * พารามิเตอร์: request (NextRequest) บรรจุ JSON { firstName, lastName, department, year }
 * คืนค่า: NextResponse JSON { ok: true, message, profile }
 */
export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const firstName = String(body?.firstName || "").trim();
  const lastName = String(body?.lastName || "").trim();
  const department = String(body?.department || "").trim();
  const rawYear = Number(body?.year ?? user.year);
  const year = Number.isFinite(rawYear) && rawYear >= 1 && rawYear <= 8 ? Math.floor(rawYear) : (user.year || 1);

  if (!firstName || !lastName) {
    return NextResponse.json({ message: "ชื่อและนามสกุลต้องไม่เว้นว่าง" }, { status: 400 });
  }

  const db = await getDb();
  await db.collection<UserDoc>("users").updateOne(
    { _id: new ObjectId(user.id) },
    {
      $set: {
        firstName,
        lastName,
        department,
        year,
        updatedAt: new Date()
      }
    }
  );

  const updated = await db.collection<UserDoc>("users").findOne({ _id: new ObjectId(user.id) });
  return NextResponse.json({
    ok: true,
    message: "บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว",
    profile: updated ? toSafeUser(updated) : null
  });
}
