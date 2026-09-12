import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL_POOLED });
const prisma = new PrismaClient({ adapter });

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Sab fields zaroori hain" },
        { status: 400 }
      );
    }

    // Check karo email already exist to nahi karta
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Is email se already account bana hai" },
        { status: 400 }
      );
    }

    // Password hash karo
    const hashedPassword = await bcrypt.hash(password, 10);

    // Naya user banao
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "CITIZEN", // default role
      },
    });

    return NextResponse.json(
      { message: "Account ban gaya", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Kuch galat ho gaya" },
      { status: 500 }
    );
  }
}