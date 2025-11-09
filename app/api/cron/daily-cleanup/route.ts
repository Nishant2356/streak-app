import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// XP rewards per difficulty
const XP_BY_DIFFICULTY = {
  EASY: 10,
  MEDIUM: 25,
  HARD: 50,
};

export async function GET(req: Request) {
  // 🔒 Check Authorization header
  const auth = req.headers.get("Authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      include: { tasks: true },
    });

    const now = new Date();

    for (const user of users) {
      const tasks = user.tasks;

      if (!tasks.length) continue;

      const overdueTasks = tasks.filter(
        (t) => t.dueDate && new Date(t.dueDate) < now
      );

      const completedTasks = tasks.filter((t) => t.completed);

      if (overdueTasks.length > 0 || completedTasks.length === 0) {
        // Reset streak
        await prisma.user.update({
          where: { id: user.id },
          data: { currentStreak: 0 },
        });

        // Delete overdue tasks
        if (overdueTasks.length > 0) {
          const ids = overdueTasks.map((t) => t.id);
          await prisma.task.deleteMany({ where: { id: { in: ids } } });
        }

        console.log(
          `User ${user.email} streak reset due to overdue/no completed tasks.`
        );
      } else if (completedTasks.length > 0 && overdueTasks.length === 0) {
        // Increase streak
        await prisma.user.update({
          where: { id: user.id },
          data: { currentStreak: user.currentStreak + 1 },
        });

        // Delete all tasks
        const taskIds = tasks.map((t) => t.id);
        await prisma.task.deleteMany({ where: { id: { in: taskIds } } });

        console.log(`User ${user.email} streak incremented. All tasks cleared.`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error in daily cleanup:", err);
    return NextResponse.json({ error: "Failed to run daily cleanup" }, { status: 500 });
  }
}
