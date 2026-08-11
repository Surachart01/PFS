import { redirect } from "next/navigation";

import { AdminPanel } from "@/components/AdminPanel";
import { AdminShell } from "@/components/AdminShell";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import type { PortfolioDoc, UserDoc } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  const db = await getDb();
  const users = await db.collection<UserDoc>("users").find({ role: "student" }).sort({ createdAt: -1 }).toArray();
  const userIds = users.map((s) => s._id);
  const portfolios = await db.collection<PortfolioDoc>("portfolios").find({ userId: { $in: userIds } }).toArray();
  const portfolioMap = new Map(portfolios.map((p) => [p.userId.toString(), p]));

  const students = users.map((s) => {
    const portfolio = portfolioMap.get(s._id.toString());
    return {
      id: s._id.toString(),
      studentId: s.studentId,
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
      department: s.department,
      year: s.year,
      status: s.status,
      portfolioStatus: portfolio?.status,
      portfolioSlug: portfolio?.slug,
      updatedAt: portfolio?.updatedAt?.toISOString()
    };
  });

  const publishedCount = students.filter((s) => s.portfolioStatus === "published").length;

  return (
    <AdminShell
      pageDesc="ภาพรวมนักศึกษา, Portfolio และการจัดการบัญชี"
      pageTitle="Admin Dashboard"
      publishedCount={publishedCount}
      studentCount={students.length}
      user={user}
    >
      <AdminPanel initialStudents={students} />
    </AdminShell>
  );
}
