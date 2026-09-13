import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL_POOLED });
const prisma = new PrismaClient({ adapter });

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { role: "CITIZEN" },
      select: {
        id: true,
        name: true,
        issues: {
          select: {
            upvotes: { select: { id: true } },
          },
        },
      },
    });

    const leaderboard = users
      .map((user) => {
        const issuesReported = user.issues.length;
        const upvotesReceived = user.issues.reduce(
          (sum, issue) => sum + issue.upvotes.length,
          0
        );
        return {
          id: user.id,
          name: user.name,
          issuesReported,
          upvotesReceived,
          score: issuesReported * 2 + upvotesReceived,
        };
      })
      .filter((u) => u.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}