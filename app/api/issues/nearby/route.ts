import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL_POOLED });
const prisma = new PrismaClient({ adapter });

// Haversine formula: do lat/lng points ke beech distance (meters mein) nikalta hai
function getDistanceInMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") || "");
    const lng = parseFloat(searchParams.get("lng") || "");
    const category = searchParams.get("category");

    if (isNaN(lat) || isNaN(lng) || !category) {
      return NextResponse.json({ nearby: [] });
    }

    // Same category ke saare open issues fetch karo (Resolved wale skip)
    const candidates = await prisma.issue.findMany({
      where: {
        category: category as any,
        status: { in: ["PENDING", "IN_REVIEW"] },
      },
      select: {
        id: true,
        title: true,
        latitude: true,
        longitude: true,
        status: true,
      },
    });

    // 200 meter ke andar wale filter karo
    const nearby = candidates.filter((issue) => {
      const distance = getDistanceInMeters(lat, lng, issue.latitude, issue.longitude);
      return distance <= 200;
    });

    return NextResponse.json({ nearby });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ nearby: [] });
  }
}