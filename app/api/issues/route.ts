import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { auth } from "@/auth";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL_POOLED });
const prisma = new PrismaClient({ adapter });

// Naya issue create karo
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Pehle login karo" },
        { status: 401 }
      );
    }

    const { title, description, category, imageUrl, latitude, longitude } =
      await request.json();

    if (!title || !description || !category || !latitude || !longitude) {
      return NextResponse.json(
        { error: "Sab zaroori fields bharo" },
        { status: 400 }
      );
    }

    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        category,
        imageUrl: imageUrl || null,
        latitude,
        longitude,
        userId: session.user.id as string,
      },
    });

    return NextResponse.json({ issue }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Issue create nahi ho paya" },
      { status: 500 }
    );
  }
}

// Sab issues fetch karo (list/map view ke liye)
export async function GET() {
  try {
    const issues = await prisma.issue.findMany({
      include: {
        createdBy: {
          select: { name: true },
        },
        upvotes: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ issues });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Issues fetch nahi hue" },
      { status: 500 }
    );
  }
}