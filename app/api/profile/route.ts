import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { auth } from "@/auth";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL_POOLED });
const prisma = new PrismaClient({ adapter });

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Please log in first" }, { status: 401 });
    }

    const userId = session.user.id as string;

    const issues = await prisma.issue.findMany({
      where: { userId },
      include: {
        upvotes: true,
        comments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const totalUpvotesReceived = issues.reduce(
      (sum, issue) => sum + issue.upvotes.length,
      0
    );
    const resolvedCount = issues.filter((i) => i.status === "RESOLVED").length;

    return NextResponse.json({
      user: {
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      },
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
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}