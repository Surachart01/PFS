import {
  BookOpen,
  ExternalLink,
  LayoutGrid,
  Share2,
  Sparkles,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { StudentShell } from "@/components/StudentShell";
import { getCurrentUser } from "@/lib/auth";
import { getOrCreatePortfolio, serializePortfolio } from "@/lib/portfolio";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "student") redirect("/dashboard");

  const portfolio = serializePortfolio(await getOrCreatePortfolio(user.id));

  const publishedSections = portfolio.sections.filter((s) => s.visible).length;
  const completionPct = portfolio.sections.length
    ? Math.round((publishedSections / portfolio.sections.length) * 100)
    : 0;

  return (
    <StudentShell
      pageDesc={`Resume: ${portfolio.title} · อัปเดตล่าสุด ${new Date(portfolio.updatedAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}`}
      pageTitle={`ยินดีต้อนรับ, ${user.firstName} 👋`}
      portfolioSlug={portfolio.slug}
      portfolioStatus={portfolio.status}
      user={user}
    >
      {/* ── Stat Row ─────────────────────── */}
      <div className="stu-stats-row">
        <div className="stu-stat-card stu-stat-violet">
          <div className="stu-stat-card-row">
            <div className="stu-stat-icon-box">
              <Sparkles size={20} />
            </div>
            <div className="stu-stat-info">
              <span>ชื่อ Resume</span>
              <strong>{portfolio.title}</strong>
            </div>
          </div>
          <div className="stu-stat-trend">
            <TrendingUp size={13} />
            <span>Portfolio ของฉัน</span>
          </div>
        </div>

        <div className="stu-stat-card stu-stat-indigo">
          <div className="stu-stat-card-row">
            <div className="stu-stat-icon-box">
              <LayoutGrid size={20} />
            </div>
            <div className="stu-stat-info">
              <span>Elements ทั้งหมด</span>
              <strong>{portfolio.sections.length}</strong>
            </div>
          </div>
          <div className="stu-stat-trend">
            <span>{publishedSections} sections แสดงอยู่</span>
          </div>
        </div>

        <div className="stu-stat-card stu-stat-cyan">
          <div className="stu-stat-card-row">
            <div className="stu-stat-icon-box">
              <BookOpen size={20} />
            </div>
            <div className="stu-stat-info">
              <span>ความครบถ้วน</span>
              <strong>{completionPct}%</strong>
            </div>
          </div>
          <div className="stu-stat-trend">
            <span>Sections ที่มองเห็น</span>
          </div>
        </div>

        <div className={`stu-stat-card stu-stat-${portfolio.status === "published" ? "green" : "amber"}`}>
          <div className="stu-stat-card-row">
            <div className="stu-stat-icon-box">
              <Share2 size={20} />
            </div>
            <div className="stu-stat-info">
              <span>สถานะ</span>
              <strong>{portfolio.status === "published" ? "Published" : "Draft"}</strong>
            </div>
          </div>
          <div className="stu-stat-trend">
            <span>/r/{portfolio.slug}</span>
          </div>
        </div>
      </div>


      {/* ── 2-Column Grid ────────────────── */}
      <div className="stu-main-grid">
        {/* Studio Canvas Card */}
        <div className="stu-card stu-card-featured">
          <div className="stu-card-gradient-bg" />
          <div className="stu-card-body">
            <div className="stu-card-header">
              <div className="stu-card-icon-box">
                <LayoutGrid size={22} />
              </div>
              <div>
                <h2 className="stu-card-title">Resume Studio Canvas</h2>
                <p className="stu-card-desc">
                  จัดวาง Element บน Grid 12 คอลัมน์ ปรับธีม ฟอนต์ และสไตล์การ์ดได้อย่างอิสระ
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="stu-progress-wrap">
              <div className="stu-progress-header">
                <span>ความครบถ้วนของ Resume</span>
                <span className="stu-progress-pct">{completionPct}%</span>
              </div>
              <div className="stu-progress-track">
                <div className="stu-progress-fill" style={{ width: `${completionPct}%` }} />
              </div>
            </div>

            {/* Section chips */}
            {portfolio.sections.length > 0 && (
              <div className="stu-section-chips">
                {portfolio.sections.slice(0, 6).map((s) => (
                  <span className={`stu-chip ${s.visible ? "visible" : "hidden"}`} key={s.id}>
                    {s.title}
                  </span>
                ))}
                {portfolio.sections.length > 6 && (
                  <span className="stu-chip-more">+{portfolio.sections.length - 6} อื่นๆ</span>
                )}
              </div>
            )}

            <div className="stu-card-actions">
              <Link className="btn btn-primary" href="/student/editor">
                <LayoutGrid size={16} />
                เปิด Studio Editor
              </Link>
              {portfolio.status === "published" ? (
                <a
                  className="btn"
                  href={`/r/${portfolio.slug}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <ExternalLink size={16} />
                  เปิดดู Resume จริง
                </a>
              ) : null}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="stu-side-col">
          {/* Share link card */}
          <div className="stu-card">
            <div className="stu-card-body">
              <div className="stu-card-header" style={{ marginBottom: 14 }}>
                <div className="stu-card-icon-box stu-icon-cyan">
                  <Share2 size={18} />
                </div>
                <div>
                  <h3 className="stu-card-title" style={{ fontSize: 16 }}>ลิงก์ Portfolio</h3>
                  <p className="stu-card-desc" style={{ fontSize: 12 }}>แชร์ให้ผู้อื่นหรือผู้ว่าจ้าง</p>
                </div>
              </div>
              <div className="stu-link-box">
                <span className="stu-link-text">/r/{portfolio.slug}</span>
                {portfolio.status === "published" ? (
                  <a
                    className="stu-link-btn"
                    href={`/r/${portfolio.slug}`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <ExternalLink size={13} />
                  </a>
                ) : null}
              </div>
              {portfolio.status !== "published" && (
                <p className="stu-card-note">
                  ⚠️ ต้อง Publish ก่อนถึงจะแชร์ลิงก์ได้ — เปิด Studio Editor แล้วกด Publish
                </p>
              )}
            </div>
          </div>

          {/* Quick tips card */}
          <div className="stu-card">
            <div className="stu-card-body">
              <h3 className="stu-tips-title">💡 Tips & Tricks</h3>
              <ul className="stu-tips-list">
                <li>
                  <span className="stu-tips-dot" />
                  เลือก Template Gallery เพื่อจัดวาง Layout อัตโนมัติ
                </li>
                <li>
                  <span className="stu-tips-dot" />
                  ปรับ Col/Row บน Grid Canvas เพื่อจัดบล็อกตามต้องการ
                </li>
                <li>
                  <span className="stu-tips-dot" />
                  เลือก Background Theme สีสันสวยๆ ได้ถึง 6 ธีม
                </li>
                <li>
                  <span className="stu-tips-dot" />
                  กด Publish เพื่อแชร์ลิงก์ Portfolio ให้ผู้อื่นดูได้
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </StudentShell>
  );
}
