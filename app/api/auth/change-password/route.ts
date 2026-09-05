import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import type { UserDoc } from "@/lib/types";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "กรุณาเข้าสู่ระบบก่อนทำรายการ" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const currentPassword = String(body?.currentPassword || "");
  const newPassword = String(body?.newPassword || "");

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ message: "กรุณากรอกรหัสผ่านเดิมและรหัสผ่านใหม่" }, { status: 400 });
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ message: "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร" }, { status: 400 });
  }

  const db = await getDb();
  const dbUser = await db.collection<UserDoc>("users").findOne({ _id: new ObjectId(user.id) });
  if (!dbUser) {
    return NextResponse.json({ message: "ไม่พบข้อมูลผู้ใช้งาน" }, { status: 404 });
  }

  const isCurrentValid = verifyPassword(currentPassword, dbUser.passwordHash);
  if (!isCurrentValid) {
    return NextResponse.json({ message: "รหัสผ่านเดิมไม่ถูกต้อง" }, { status: 400 });
  }

  await db.collection<UserDoc>("users").updateOne(
    { _id: new ObjectId(user.id) },
    {
      $set: {
        passwordHash: hashPassword(newPassword),
        updatedAt: new Date()
      }
    }
  );

  return NextResponse.json({ ok: true, message: "เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว" });
}
