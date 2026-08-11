import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { requireApiUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getOrCreatePortfolio, serializePortfolio } from "@/lib/portfolio";
import type { PortfolioDoc } from "@/lib/types";

export async function POST() {
  const { user, response } = await requireApiUser(["student"]);
  if (response) return response;

  const db = await getDb();
  const portfolio = await getOrCreatePortfolio(user.id);
  const now = new Date();

  await db.collection<PortfolioDoc>("portfolios").updateOne(
    { _id: portfolio._id, userId: new ObjectId(user.id) },
    {
      $set: {
        status: "unpublished",
        updatedAt: now
      }
    }
  );

  const updated = await db.collection<PortfolioDoc>("portfolios").findOne({ _id: portfolio._id });
  return NextResponse.json({ portfolio: serializePortfolio(updated!) });
}
