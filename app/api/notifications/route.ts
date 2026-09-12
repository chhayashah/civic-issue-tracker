import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { auth } from "@/auth";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL_POOLED });
const prisma = new PrismaClient({ adapter });

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