import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getOrCreatePortfolio, serializePortfolio } from "@/lib/portfolio";
import type { PortfolioDoc } from "@/lib/types";

/**
 * ฟังก์ชัน 4.6: เผยแพร่ผลงานสู่สาธารณะ (Publish Portfolio API)
 * หน้าที่: ตรวจสอบความซ้ำซ้อนของ slug แล้วปรับสถานะของแฟ้มผลงานจาก draft เป็น published พร้อมบันทึกเวลาเผยแพร่
 * เมธอด: POST /api/portfolio/me/publish
 * คืนค่า: NextResponse JSON { portfolio: SerializedPortfolio }
 */
export async function POST() {
  const { user, response } = await requireApiUser(["student"]);
  if (response) return response;

  const db = await getDb();
  const portfolio = await getOrCreatePortfolio(user.id);
  const duplicateSlug = await db.collection<PortfolioDoc>("portfolios").findOne({
    slug: portfolio.slug,
    _id: { $ne: portfolio._id }
  });

  if (duplicateSlug) {
    return NextResponse.json({ message: "slug นี้ถูกใช้งานแล้ว กรุณาแก้ไข slug ก่อนเผยแพร่" }, { status: 409 });
  }

  const now = new Date();
  await db.collection<PortfolioDoc>("portfolios").updateOne(
    { _id: portfolio._id, userId: new ObjectId(user.id) },
    {
      $set: {
        status: "published",
        publishedAt: now,
        updatedAt: now
      }
    }
  );

  const updated = await db.collection<PortfolioDoc>("portfolios").findOne({ _id: portfolio._id });
  return NextResponse.json({ portfolio: serializePortfolio(updated!) });
}
