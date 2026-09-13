import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL_POOLED });
const prisma = new PrismaClient({ adapter });

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, createdAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const issues = await prisma.issue.findMany({
      where: { userId: id },
      select: {
        id: true,
        title: true,
        category: true,
        status: true,
        createdAt: true,
        upvotes: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalUpvotesReceived = issues.reduce(
      (sum, issue) => sum + issue.upvotes.length,
      0
    );
    const resolvedCount = issues.filter((i) => i.status === "RESOLVED").length;

    return NextResponse.json({
      user,
      stats: {
        totalIssues: issues.length,
        resolvedCount,
        totalUpvotesReceived,
      },
      issues,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}