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
        { error: "Pehle login karo" },
        { status: 401 }
      );
    }

    const { id: issueId } = await params;
    const userId = session.user.id as string;

    // Check karo already upvote kiya hai ya nahi
    const existingUpvote = await prisma.upvote.findUnique({
      where: {
        userId_issueId: {
          userId,
          issueId,
        },
      },
    });

    if (existingUpvote) {
      // Already upvoted hai -> remove karo (toggle off)
      await prisma.upvote.delete({
        where: { id: existingUpvote.id },
      });
      return NextResponse.json({ upvoted: false });
    } else {
      // Naya upvote add karo
      await prisma.upvote.create({
        data: { userId, issueId },
      });
      return NextResponse.json({ upvoted: true });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Upvote fail hua" },
      { status: 500 }
    );
  }
}