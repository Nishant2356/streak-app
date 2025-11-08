import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const XP_BY_DIFFICULTY = {
  EASY: 10,
  MEDIUM: 25,
  HARD: 50,
} as const;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, difficulty, priority, dueDate } = await req.json();

    if (!title || !difficulty || !priority) {
      return NextResponse.json(
        { error: "Title, difficulty, and priority are required" },
        { status: 400 }
      );
    }

    // ✅ Safely cast difficulty to keyof typeof XP_BY_DIFFICULTY
    const xpReward =
      XP_BY_DIFFICULTY[difficulty as keyof typeof XP_BY_DIFFICULTY] ?? 0;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const task = await prisma.task.create({
      data: {
        title,
        description,
        difficulty,
        priority,
        xpReward,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: user.id,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
