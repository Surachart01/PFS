import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { hashPassword, isValidKmitlEmail, requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import type { PortfolioDoc, UserDoc } from "@/lib/types";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * ฟังก์ชัน 4.10: อาจารย์แก้ไขข้อมูลส่วนตัวของนักศึกษา (Admin Edit Student Info API)
 * หน้าที่: ตรวจสอบความซ้ำซ้อนของรหัสนักศึกษาและอีเมล แล้วอัปเดตชื่อ-สกุล แผนกวิชา หรือชั้นปีลงฐานข้อมูล
 * เมธอด: PUT /api/students/[id]
 * พารามิเตอร์: request (NextRequest) บรรจุ JSON { studentId, firstName, lastName, email, department, year }
 * คืนค่า: NextResponse JSON { ok: true, message }
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { response } = await requireApiUser(["admin"]);
  if (response) return response;

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ message: "รูปแบบ ID ไม่ถูกต้อง" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const studentId = String(body?.studentId || "").trim().toLowerCase();
  const firstName = String(body?.firstName || "").trim();
  const lastName = String(body?.lastName || "").trim();
  const email = String(body?.email || "").trim().toLowerCase();
  const department = String(body?.department || "Computer Engineering").trim();
  const year = Number(body?.year || 1);

  if (!studentId || !firstName || !lastName || !email) {
    return NextResponse.json({ message: "กรุณากรอกข้อมูลนักศึกษาให้ครบถ้วน" }, { status: 400 });
  }

  if (!isValidKmitlEmail(email)) {
    return NextResponse.json({ message: "อีเมลต้องใช้อีเมลสถาบัน (@kmitl.ac.th) เท่านั้น" }, { status: 400 });
  }

  const db = await getDb();
  // Check duplicate
  const duplicate = await db.collection<UserDoc>("users").findOne({
    _id: { $ne: new ObjectId(id) },
    $or: [{ studentId }, { email }]
  });
  if (duplicate) {
    return NextResponse.json({ message: "รหัสนักศึกษาหรืออีเมลนี้ถูกใช้งานแล้วโดยบัญชีอื่น" }, { status: 409 });
  }

  const updateResult = await db.collection<UserDoc>("users").updateOne(
    { _id: new ObjectId(id), role: "student" },
    {
      $set: {
        studentId,
        firstName,
        lastName,
        email,
        department,
        year,
        updatedAt: new Date()
      }
    }
  );

  if (updateResult.matchedCount === 0) {
    return NextResponse.json({ message: "ไม่พบข้อมูลนักศึกษาที่ต้องการแก้ไข" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, message: "แก้ไขข้อมูลนักศึกษาสำเร็จ" });
}

/**
 * ฟังก์ชัน 4.11: อาจารย์รีเซ็ตรหัสผ่านหรือสลับสถานะบัญชี (Admin Reset Password / Toggle Status API)
 * หน้าที่: ดำเนินการ 2 คำสั่งตามที่ส่งมาใน action:
 *         1. 'toggle-status': สลับสถานะระหว่าง active <-> inactive
 *         2. 'reset-password': ตั้งรหัสผ่านใหม่ให้นักศึกษาเป็นรหัสนักศึกษาหรือรหัสที่กำหนด
 * เมธอด: PATCH /api/students/[id]
 * พารามิเตอร์: request (NextRequest) บรรจุ JSON { action, password?, status? }
 * คืนค่า: NextResponse JSON { ok: true, message, status }
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { response } = await requireApiUser(["admin"]);
  if (response) return response;

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ message: "รูปแบบ ID ไม่ถูกต้อง" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const db = await getDb();
  const student = await db.collection<UserDoc>("users").findOne({ _id: new ObjectId(id), role: "student" });
  if (!student) {
    return NextResponse.json({ message: "ไม่พบข้อมูลนักศึกษา" }, { status: 404 });
  }

  const updateDoc: Partial<UserDoc> = { updatedAt: new Date() };

  // 1. สลับสถานะบัญชี
  if (body?.action === "toggle-status") {
    const nextStatus = student.status === "active" ? "inactive" : "active";
    updateDoc.status = nextStatus;
  } else if (body?.status) {
    updateDoc.status = body.status === "inactive" ? "inactive" : "active";
  }

  // 2. รีเซ็ตรหัสผ่าน
  if (body?.action === "reset-password" || body?.password) {
    const newPassword = String(body.password || student.studentId || "Student@1234");
    updateDoc.passwordHash = hashPassword(newPassword);
  }

  await db.collection<UserDoc>("users").updateOne({ _id: new ObjectId(id) }, { $set: updateDoc });

  return NextResponse.json({
    ok: true,
    message: "อัปเดตข้อมูลบัญชีสำเร็จ",
    status: updateDoc.status || student.status
  });
}

/**
 * ฟังก์ชัน 4.12: อาจารย์ลบบัญชีนักศึกษาและผลงาน (Admin Delete Student API)
 * หน้าที่: ลบบัญชีผู้ใช้จากคอลเลกชัน users และลบเอกสารเรซูเม่จากคอลเลกชัน portfolios พร้อมกัน ป้องกันข้อมูลตกค้าง
 * เมธอด: DELETE /api/students/[id]
 * คืนค่า: NextResponse JSON { ok: true, message }
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { response } = await requireApiUser(["admin"]);
  if (response) return response;

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ message: "รูปแบบ ID ไม่ถูกต้อง" }, { status: 400 });
  }

  const db = await getDb();
  const deleteResult = await db.collection<UserDoc>("users").deleteOne({
    _id: new ObjectId(id),
    role: "student"
  });

  if (deleteResult.deletedCount === 0) {
    return NextResponse.json({ message: "ไม่พบข้อมูลนักศึกษาที่ต้องการลบ" }, { status: 404 });
  }

  // ลบ Portfolio ของนักศึกษาออกด้วย
  await db.collection<PortfolioDoc>("portfolios").deleteOne({ userId: new ObjectId(id) });

  return NextResponse.json({ ok: true, message: "ลบบัญชีนักศึกษาและผลงานเรียบร้อยแล้ว" });
}
