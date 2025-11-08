import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// XP rewards for each difficulty
const XP_BY_DIFFICULTY = {
  EASY: 10,
  MEDIUM: 25,
  HARD: 50,
};

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const taskId = parseInt(id);

  if (isNaN(taskId))
    return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });

  // Fetch the task and user
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { user: true },
  });

  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  if (task.user.email !== session.user.email)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const xpToAdd = XP_BY_DIFFICULTY[task.difficulty] || 0;

  // Calculate streak updates
  const today = new Date();
  const lastCompleted = task.user.lastCompletedAt
    ? new Date(task.user.lastCompletedAt)
    : null;

  let newStreak = task.user.currentStreak;
  if (lastCompleted) {
    const diffDays = Math.floor((today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) newStreak += 1;
    else if (diffDays > 1) newStreak = 1;
  } else {
    newStreak = 1;
  }

  const newLongest = Math.max(newStreak, task.user.longestStreak);

  // Update the user (XP, streak, etc.)
  await prisma.user.update({
    where: { id: task.userId },
    data: {
      xp: { increment: xpToAdd },
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastCompletedAt: today,
    },
  });

  // Delete the completed task
  await prisma.task.delete({ where: { id: taskId } });

  return NextResponse.json({
    success: true,
    xpGained: xpToAdd,
    newStreak,
  });
}
