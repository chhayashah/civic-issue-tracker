import { prisma } from "@/lib/prisma";
import HomeHero from "@/components/HomeHero";

export const dynamic = "force-dynamic";

export default async function Home() {
  try {
    const [total, resolved, pending, recentIssues] = await Promise.all([
      prisma.issue.count(),
      prisma.issue.count({ where: { status: "RESOLVED" } }),
      prisma.issue.count({ where: { status: { in: ["PENDING", "IN_REVIEW"] } } }),
      prisma.issue.findMany({
        select: {
          id: true,
          title: true,
          category: true,
          latitude: true,
          longitude: true,
          status: true,
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    return (
      <HomeHero
        stats={{ total, resolved, pending }}
        recentIssues={recentIssues}
      />
    );
  } catch (error) {
    console.error("Failed to load home metrics from database:", error);
    return (
      <HomeHero
        stats={{ total: 0, resolved: 0, pending: 0 }}
        recentIssues={[]}
      />
    );
  }
}
