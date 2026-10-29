import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Please log in first" },
        { status: 401 }
      );
    }

    const { title, description, category, imageUrl, latitude, longitude } =
      await request.json();

    if (!title || !description || !category || !latitude || !longitude) {
      return NextResponse.json(
        { error: "All required fields must be filled" },
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
      { error: "Failed to create issue" },
      { status: 500 }
    );
  }
}

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
      { error: "Failed to fetch issues" },
      { status: 500 }
    );
  }
}