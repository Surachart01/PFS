import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { getCurrentUser, toSafeUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import type { UserDoc } from "@/lib/types";

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

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const firstName = String(body?.firstName || "").trim();
  const lastName = String(body?.lastName || "").trim();
  const department = String(body?.department || "").trim();
  const year = Number(body?.year || user.year || 1);

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
