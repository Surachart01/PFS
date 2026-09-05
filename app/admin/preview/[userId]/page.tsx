import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Clock } from "lucide-react";
import { ObjectId } from "mongodb";

import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { serializePortfolio } from "@/lib/portfolio";
import { ResumeRenderer } from "@/components/ResumeRenderer";
import type { PortfolioDoc, UserDoc } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPortfolioPreviewPage({
  params
}: {
  params: Promise<{ userId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  const { userId } = await params;
  if (!ObjectId.isValid(userId)) notFound();

  const db = await getDb();
  const student = await db.collection<UserDoc>("users").findOne({ _id: new ObjectId(userId) });
  if (!student) notFound();

  const portfolio = await db.collection<PortfolioDoc>("portfolios").findOne({ userId: new ObjectId(userId) });
  if (!portfolio) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center", color: "#64748b" }}>
        <h2>นักศึกษายังไม่ได้เริ่มสร้าง Portfolio</h2>
        <p>นักศึกษา: {student.firstName} {student.lastName} ({student.studentId})</p>
        <Link href="/admin" className="btn btn-primary" style={{ marginTop: 20, display: "inline-flex" }}>
          <ArrowLeft size={16} /> กลับหน้า Admin
        </Link>
      </div>
    );
  }

  const resume = serializePortfolio(portfolio);

  return (
    <div>
      {/* Admin Inspection Banner */}
      <div style={{
        background: "#0F172A",
        color: "#F8FAFC",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #334155",
        fontSize: "14px",
        position: "sticky",
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/admin" className="btn" style={{ padding: "6px 12px", fontSize: "13px", background: "#1E293B", color: "#F1F5F9" }}>
            <ArrowLeft size={14} /> กลับสู่ Admin
          </Link>
          <span>
            กำลังตรวจผลงาน: <strong>{student.firstName} {student.lastName}</strong> ({student.studentId})
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 10px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: 600,
            background: resume.status === "published" ? "#065F46" : "#78350F",
            color: resume.status === "published" ? "#A7F3D0" : "#FDE68A"
          }}>
            {resume.status === "published" ? <CheckCircle size={13} /> : <Clock size={13} />}
            {resume.status === "published" ? "เผยแพร่แล้ว (Published)" : "ฉบับร่าง (Draft)"}
          </span>
          <span style={{ color: "#94A3B8", fontSize: "12px" }}>
            อัปเดตล่าสุด: {new Date(resume.updatedAt).toLocaleString("th-TH")}
          </span>
        </div>
      </div>

      <main className="preview-page">
        <ResumeRenderer
          sections={resume.sections}
          styleSettings={resume.styleSettings}
          templateId={resume.templateId}
          title={resume.title}
        />
      </main>
    </div>
  );
}
