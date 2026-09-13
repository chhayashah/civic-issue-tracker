import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { auth } from "@/auth";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL_POOLED });
const prisma = new PrismaClient({ adapter });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Please log in to comment" },
        { status: 401 }
      );
    }

    const { id: issueId } = await params;
    const { content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Comment cannot be empty" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: session.user.id as string,
        issueId,
      },
      include: {
        user: { select: { name: true } },
      },
    });

    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      select: { userId: true, title: true },
    });

    if (issue && issue.userId !== session.user.id) {
      await prisma.notification.create({
        data: {
          message: `${session.user.name} commented on your issue "${issue.title}"`,
          userId: issue.userId,
          link: `/issues/${issueId}`,
        },
      });
    }

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to post comment" },
      { status: 500 }
    );
  }
}