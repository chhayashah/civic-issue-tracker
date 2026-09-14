import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { auth } from "@/auth";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL_POOLED });
const prisma = new PrismaClient({ adapter });

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const issues = await prisma.issue.findMany({
      select: { category: true, status: true, createdAt: true },
    });

    type IssueForAnalytics = {
  category: string;
  status: string;
  createdAt: Date;
};

    // Category-wise count
    const categoryCounts: Record<string, number> = {};
    issues.forEach((issue: IssueForAnalytics) => {
      categoryCounts[issue.category] = (categoryCounts[issue.category] || 0) + 1;
    });
    const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({
      name,
      value,
    }));

    // Status-wise count
    const statusCounts: Record<string, number> = {};
    issues.forEach((issue: IssueForAnalytics) => {
      statusCounts[issue.status] = (statusCounts[issue.status] || 0) + 1;
    });
    const statusData = Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
    }));

    // Monthly trend (last 6 months)
    const monthlyMap: Record<string, number> = {};
    issues.forEach((issue: IssueForAnalytics) => {
      const date = new Date(issue.createdAt);
      const key = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;
      monthlyMap[key] = (monthlyMap[key] || 0) + 1;
    });
    const monthlyData = Object.entries(monthlyMap).map(([month, count]) => ({
      month,
      count,
    }));

    return NextResponse.json({
      categoryData,
      statusData,
      monthlyData,
      totalIssues: issues.length,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}