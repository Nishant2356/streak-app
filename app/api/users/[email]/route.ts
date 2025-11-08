import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { email: string } | Promise<{ email: string }> }
) {
  try {
    // Handle both sync (Next.js 16.0.1) and async (Next.js 15+) params
    const emailParam = params instanceof Promise ? await params : params;
    const decodedEmail = decodeURIComponent(emailParam.email);

    const user = await prisma.user.findUnique({
      where: { email: decodedEmail },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        image: true,
        currentStreak: true,
        longestStreak: true,
        xp: true,
        level: true,
        badges: true,
        lastCompletedAt: true,
        createdAt: true,
        updatedAt: true,
        // Don't return password
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
