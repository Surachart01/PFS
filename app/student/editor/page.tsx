import { redirect } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { StudentEditor } from "@/components/StudentEditor";
import { getCurrentUser } from "@/lib/auth";
import { getOrCreatePortfolio, serializePortfolio } from "@/lib/portfolio";

export const dynamic = "force-dynamic";

export default async function StudentEditorPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "student") redirect("/dashboard");

  const portfolio = serializePortfolio(await getOrCreatePortfolio(user.id));

  return (
    <AppShell user={user}>
      <StudentEditor initialPortfolio={portfolio} />
    </AppShell>
  );
}
