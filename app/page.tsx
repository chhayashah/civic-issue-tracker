import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import HomeHero from "@/components/HomeHero";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL_POOLED,
});
const prisma = new PrismaClient({ adapter });

export default async function Home() {
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
}
