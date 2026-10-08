import { NextRequest, NextResponse } from "next/server";
import { hashPassword, isValidKmitlEmail, requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import type { UserDoc } from "@/lib/types";

export async function POST(request: NextRequest) {
  const { response } = await requireApiUser(["admin"]);
  if (response) return response;
  const body = await request.json().catch(() => null);
  const firstName = typeof body?.firstName === "string" ? body.firstName.trim() : "";
  const lastName = typeof body?.lastName === "string" ? body.lastName.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!firstName || !lastName || firstName.length > 100 || lastName.length > 100) {
    return NextResponse.json({ message: "กรุณากรอกชื่อและนามสกุลไม่เกินช่องละ 100 ตัวอักษร" }, { status: 400 });
  }
  if (email.length > 254 || !isValidKmitlEmail(email)) {
    return NextResponse.json({ message: "กรุณาใช้อีเมลสถาบัน (@kmitl.ac.th)" }, { status: 400 });
  }
  if (password.trim().length < 8 || password.length > 128) {
    return NextResponse.json({ message: "รหัสผ่านต้องมี 8–128 ตัวอักษร" }, { status: 400 });
  }
  try {
    const db = await getDb();
    const users = db.collection<UserDoc>("users");
    if (await users.findOne({ email })) {
      return NextResponse.json({ message: "อีเมลนี้มีบัญชีอยู่แล้ว กรุณาใช้อีเมลอื่น" }, { status: 409 });
    }
    await users.createIndex({ email: 1 }, { unique: true });
    const now = new Date();
    const result = await db.collection<Omit<UserDoc, "_id">>("users").insertOne({
      firstName, lastName, email, passwordHash: hashPassword(password),
      role: "admin", status: "active", createdAt: now, updatedAt: now
    });
    return NextResponse.json({ admin: { id: result.insertedId.toString(), firstName, lastName, email, status: "active" } }, { status: 201 });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      return NextResponse.json({ message: "อีเมลนี้มีบัญชีอยู่แล้ว กรุณาใช้อีเมลอื่น" }, { status: 409 });
    }
    return NextResponse.json({ message: "เพิ่ม Admin ไม่สำเร็จ กรุณาตรวจการเชื่อมต่อฐานข้อมูลแล้วลองอีกครั้ง" }, { status: 500 });
  }
}
