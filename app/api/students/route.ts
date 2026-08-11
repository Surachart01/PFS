import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { hashPassword, requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import type { PortfolioDoc, UserDoc } from "@/lib/types";

export async function GET() {
  const { response } = await requireApiUser(["admin"]);
  if (response) return response;

  const db = await getDb();
  const users = await db.collection<UserDoc>("users").find({ role: "student" }).sort({ createdAt: -1 }).toArray();
  const portfolios = await db.collection<PortfolioDoc>("portfolios").find({ userId: { $in: users.map((user) => user._id) } }).toArray();
  const portfolioMap = new Map(portfolios.map((portfolio) => [portfolio.userId.toString(), portfolio]));

  return NextResponse.json({
    students: users.map((student) => {
      const portfolio = portfolioMap.get(student._id.toString());
      return {
        id: student._id.toString(),
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        department: student.department,
        year: student.year,
        status: student.status,
        portfolioStatus: portfolio?.status,
        portfolioSlug: portfolio?.slug,
        updatedAt: portfolio?.updatedAt?.toISOString()
      };
    })
  });
}

export async function POST(request: NextRequest) {
  const { response } = await requireApiUser(["admin"]);
  if (response) return response;

  const body = await request.json().catch(() => null);
  const studentId = String(body?.studentId || "").trim().toLowerCase();
  const firstName = String(body?.firstName || "").trim();
  const lastName = String(body?.lastName || "").trim();
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || studentId);
  const department = String(body?.department || "Computer Engineering").trim();
  const year = Number(body?.year || 1);

  if (!studentId || !firstName || !lastName || !email) {
    return NextResponse.json({ message: "กรุณากรอกข้อมูลนักศึกษาให้ครบ" }, { status: 400 });
  }

  const db = await getDb();
  const duplicate = await db.collection<UserDoc>("users").findOne({ $or: [{ studentId }, { email }] });
  if (duplicate) {
    return NextResponse.json({ message: "รหัสนักศึกษาหรืออีเมลนี้มีอยู่แล้ว" }, { status: 409 });
  }

  const now = new Date();
  const result = await db.collection<Omit<UserDoc, "_id">>("users").insertOne({
    studentId,
    firstName,
    lastName,
    email,
    passwordHash: hashPassword(password),
    role: "student",
    department,
    year,
    status: "active",
    createdAt: now,
    updatedAt: now
  });

  return NextResponse.json({ ok: true, id: result.insertedId.toString() }, { status: 201 });
}
