import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { auth } from "@/auth";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL_POOLED });
const prisma = new PrismaClient({ adapter });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can change status" },
        { status: 403 }
      );
    }

    const { id: issueId } = await params;
    const { status } = await request.json();

    const validStatuses = ["PENDING", "IN_REVIEW", "RESOLVED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const issue = await prisma.issue.update({
      where: { id: issueId },
      data: { status },
    });

    const statusLabels: Record<string, string> = {
      PENDING: "Pending",
      IN_REVIEW: "In Review",
      RESOLVED: "Resolved",
    };

    await prisma.notification.create({
      data: {
        message: `Your issue "${issue.title}" status changed to "${statusLabels[status]}"`,
        userId: issue.userId,
        link: `/issues/${issueId}`,
      },
    });

    return NextResponse.json({ issue });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}