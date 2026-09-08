import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { applyTemplate, getOrCreatePortfolio, sanitizeSections, serializePortfolio, uniqueSlug } from "@/lib/portfolio";
import type { PortfolioDoc, PortfolioStatus, TemplateId } from "@/lib/types";

const allowedThemes = ["modern", "classic", "minimal"] as const;
const allowedTemplates: TemplateId[] = ["professional", "modern", "creative", "minimal", "academic", "compact"];

/**
 * ฟังก์ชัน 4.4: ดึงข้อมูล Portfolio ของนักศึกษาปัจจุบัน (Get My Portfolio API)
 * หน้าที่: ดึงข้อมูลแฟ้มสะสมผลงานของนักศึกษาที่กำลังล็อกอินอยู่ เพื่อนำไปแสดงผลบนหน้าสตูดิโอออกแบบ
 * เมธอด: GET /api/portfolio/me
 * คืนค่า: NextResponse JSON { portfolio: SerializedPortfolio }
 */
export async function GET() {
  const { user, response } = await requireApiUser(["student"]);
  if (response) return response;

  const portfolio = await getOrCreatePortfolio(user.id);
  return NextResponse.json({ portfolio: serializePortfolio(portfolio) });
}

/**
 * ฟังก์ชัน 4.5: บันทึกข้อมูลและสไตล์เรซูเม่ (Save / Update Portfolio API)
 * หน้าที่: บันทึกการแก้ไขบล็อกเนื้อหา, เทมเพลต, และการจัดวางลงฐานข้อมูล พร้อมคลีนข้อมูลผ่าน sanitizeSections
 * เมธอด: PUT /api/portfolio/me
 * พารามิเตอร์: request (NextRequest) บรรจุ JSON { title, slug, templateId, styleSettings, sections }
 * คืนค่า: NextResponse JSON { portfolio: SerializedPortfolio }
 */
export async function PUT(request: NextRequest) {
  const { user, response } = await requireApiUser(["student"]);
  if (response) return response;

  const current = await getOrCreatePortfolio(user.id);
  const body = await request.json().catch(() => null);

  const title = String(body?.title || current.title).trim().slice(0, 120);
  const requestedSlug = String(body?.slug || current.slug).trim().toLowerCase();
  const slug = await uniqueSlug(requestedSlug, current._id);
  const theme = allowedThemes.includes(body?.theme) ? body.theme : current.theme;
  const status: PortfolioStatus = current.status === "published" ? "published" : "draft";
  const templateId: TemplateId = allowedTemplates.includes(body?.templateId) ? body.templateId : (current.templateId || "professional");
  const styleSettings = {
    primaryColor: /^#[0-9a-f]{6}$/i.test(body?.styleSettings?.primaryColor) ? body.styleSettings.primaryColor : current.styleSettings.primaryColor,
    fontFamily: "Inter",
    fontSize: Math.max(14, Math.min(20, Number(body?.styleSettings?.fontSize || current.styleSettings.fontSize))),
    layout: body?.styleSettings?.layout || current.styleSettings.layout
  };

  let sections;
  if (body?.applyTemplate && allowedTemplates.includes(body?.templateId)) {
    // Apply template layout to existing sections
    const existingSections = Array.isArray(body?.sections) ? sanitizeSections(body.sections) : current.sections;
    sections = sanitizeSections(applyTemplate(body.templateId, existingSections));
  } else {
    sections = Array.isArray(body?.sections) ? sanitizeSections(body.sections) : current.sections;
  }

  const db = await getDb();
  const now = new Date();
  await db.collection<PortfolioDoc>("portfolios").updateOne(
    { _id: current._id, userId: new ObjectId(user.id) },
    {
      $set: {
        title,
        slug,
        theme,
        status,
        templateId,
        styleSettings,
        sections,
        updatedAt: now
      }
    }
  );

  const updated = await db.collection<PortfolioDoc>("portfolios").findOne({ _id: current._id });
  return NextResponse.json({ portfolio: serializePortfolio(updated!) });
}

