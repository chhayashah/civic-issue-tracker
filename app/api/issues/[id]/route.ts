import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { auth } from "@/auth";

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
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    return NextResponse.json({ issue });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch issue" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Please log in first" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const existingIssue = await prisma.issue.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingIssue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    // Only the owner (or an admin) can edit
    if (
      existingIssue.userId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "You can only edit your own issues" },
        { status: 403 }
      );
    }

    const { title, description, category } = await request.json();

    const issue = await prisma.issue.update({
      where: { id },
      data: { title, description, category },
    });

    return NextResponse.json({ issue });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update issue" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Please log in first" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const existingIssue = await prisma.issue.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingIssue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    // Only the owner (or an admin) can delete
    if (
      existingIssue.userId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "You can only delete your own issues" },
        { status: 403 }
      );
    }

    // Delete related comments and upvotes first (foreign key constraints)
    await prisma.comment.deleteMany({ where: { issueId: id } });
    await prisma.upvote.deleteMany({ where: { issueId: id } });
    await prisma.issue.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete issue" },
      { status: 500 }
    );
  }
}