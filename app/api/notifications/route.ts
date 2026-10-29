import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// Notifications fetch karo current user ke liye
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ notifications: [] });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id as string },
      orderBy: { createdAt: "desc" },
      take: 20, // sirf latest 20
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Notifications fetch nahi hue" },
      { status: 500 }
    );
  }
}