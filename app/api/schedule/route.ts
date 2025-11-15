import { NextResponse } from "next/server";
import { schedulerAgent } from "../../agents/schedulerAgent";
import { run } from '@openai/agents';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route"; // Adjust path to your auth config
import { prisma } from "@/lib/prisma"; // Adjust path to your prisma client
import "dotenv/config";

export async function POST(req: Request) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const { tasks, currentTime, prompt } = await req.json();
    
    const formattedTasks = tasks
      .map(
        (t: any) => `title: ${t.title} | Discription: ${t.description} | Difficulty: ${t.difficulty} | Priority: ${t.priority} | XP: ${t.xpReward}`
      )
      .join("\n");

    console.log("Generating schedule with tasks:", formattedTasks);

    // Generate schedule using AI agent
    const result = await run(
      schedulerAgent,
      `
        Tasks for today:
        ${formattedTasks}
        Current time: ${currentTime}
        Extra instructions: ${prompt || "none"}
      `,
    );

    // Get today's date at midnight for consistent date comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Delete all previous schedules for this user before creating new one
    await prisma.schedule.deleteMany({
      where: {
        userId: user.id,
      },
    });

    // Save schedule to database
    const savedSchedule = await prisma.schedule.create({
      data: {
        content: result.finalOutput || "",
        date: today,
        prompt: prompt || null,
        tasksCount: tasks.length,
        userId: user.id,
      },
    });

    return NextResponse.json({
      schedule: result.finalOutput,
      scheduleId: savedSchedule.id,
      savedAt: savedSchedule.createdAt,
    });

  } catch (error) {
    console.error("Schedule generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate schedule" },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to retrieve schedules
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query
    const whereClause: any = { userId: user.id };
    
    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      whereClause.date = targetDate;
    }

    // Fetch schedules
    const schedules = await prisma.schedule.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ schedules });

  } catch (error) {
    console.error("Schedule fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedules" },
      { status: 500 }
    );
  }
}