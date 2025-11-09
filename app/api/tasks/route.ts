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

    const xpReward =
      XP_BY_DIFFICULTY[difficulty as keyof typeof XP_BY_DIFFICULTY] ?? 0;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    // 🕛 Get next midnight (tomorrow at 00:00:00 UTC) as default
    const getNextMidnight = () => {
      const tomorrow = new Date();
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      tomorrow.setUTCHours(0, 0, 0, 0);
      return tomorrow;
    };

    // Helper to parse date string and set to midnight (00:00:00 UTC)
    const parseDateToMidnight = (dateString: string): Date => {
      // Parse the date string (format: YYYY-MM-DD)
      const [year, month, day] = dateString.split('-').map(Number);
      // Create date in UTC at midnight to avoid timezone issues
      const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      return date;
    };

    // Check if dueDate is provided and is a valid non-empty string
    let finalDueDate: Date;
    console.log('Received dueDate:', dueDate, 'Type:', typeof dueDate);
    
    if (dueDate && typeof dueDate === 'string' && dueDate.trim() !== '') {
      try {
        // Parse the date string and set to midnight UTC
        finalDueDate = parseDateToMidnight(dueDate.trim());
        // Validate the parsed date
        if (isNaN(finalDueDate.getTime())) {
          // Invalid date, use next midnight
          console.log('Invalid date, using next midnight');
          finalDueDate = getNextMidnight();
        } else {
          console.log('Parsed date:', finalDueDate.toISOString());
        }
      } catch (error) {
        // Error parsing date, use next midnight
        console.log('Error parsing date, using next midnight:', error);
        finalDueDate = getNextMidnight();
      }
    } else {
      // No date provided, use next midnight
      console.log('No date provided, using next midnight');
      finalDueDate = getNextMidnight();
    }
    
    console.log('Final dueDate:', finalDueDate.toISOString());

    const task = await prisma.task.create({
      data: {
        title,
        description,
        difficulty,
        priority,
        xpReward,
        dueDate: finalDueDate,
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
