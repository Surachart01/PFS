import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { hashPassword, requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import type { PortfolioDoc, UserDoc } from "@/lib/types";

type RouteParams = { params: Promise<{ id: string }> };

// PUT: แก้ไขข้อมูลนักศึกษา
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

// PATCH: สลับสถานะ active/inactive หรือ รีเซ็ตรหัสผ่าน
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

// DELETE: ลบบัญชีนักศึกษาและ Portfolio ที่เกี่ยวข้อง
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
