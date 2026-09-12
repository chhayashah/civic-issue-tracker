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

    const issue = await prisma.issue.findUnique({
      where: { id },
      include: {
        createdBy: { select: { name: true } },
        upvotes: true,
        comments: {
          include: {
            user: { select: { name: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!issue) {
      return NextResponse.json({ error: "Issue nahi mila" }, { status: 404 });
    }

    return NextResponse.json({ issue });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Issue fetch nahi hua" },
      { status: 500 }
    );
  }
}