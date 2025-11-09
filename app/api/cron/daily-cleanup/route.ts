import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  // 🔒 Check Authorization header (Vercel Cron sends this automatically)
  const authHeader = req.headers.get("Authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  // Allow if CRON_SECRET is set and matches, or if it's not set (for local testing)
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.log("[Cron] Unauthorized - Invalid or missing CRON_SECRET");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[Cron] Starting daily cleanup at midnight -", new Date().toISOString());
    
    const users = await prisma.user.findMany({
      include: { tasks: true },
    });

    const now = new Date();
    let processedUsers = 0;
    let streakIncrements = 0;
    let streakResets = 0;
    let tasksDeleted = 0;

    for (const user of users) {
      const tasks = user.tasks;
      
      // Skip users with no tasks
      if (tasks.length === 0) {
        continue;
      }

      processedUsers++;

      // Check for tasks whose deadline has exceeded (dueDate < now)
      const exceededTasks = tasks.filter(
        (t) => t.dueDate && new Date(t.dueDate) < now
      );

      // Check for completed tasks
      const completedTasks = tasks.filter((t) => t.completed);
      const hasCompletedTask = completedTasks.length > 0;
      const hasExceededTask = exceededTasks.length > 0;

      // Logic:
      // If (any task deadline exceeded OR no tasks completed) → Reset streak to 0
      // If (at least one task completed AND no tasks exceeded) → Increment streak by 1
      
      if (hasExceededTask || !hasCompletedTask) {
        // ❌ Reset streak: deadline exceeded OR no completed tasks
        await prisma.user.update({
          where: { id: user.id },
          data: { currentStreak: 0 },
        });

        streakResets++;
        console.log(
          `[Cron] User ${user.email}: Streak reset to 0 (exceeded tasks: ${hasExceededTask}, completed tasks: ${completedTasks.length}/${tasks.length})`
        );
      } else if (hasCompletedTask && !hasExceededTask) {
        // ✅ Increment streak: at least one completed AND no exceeded tasks
        const newStreak = user.currentStreak + 1;
        const newLongestStreak = Math.max(newStreak, user.longestStreak);

        await prisma.user.update({
          where: { id: user.id },
          data: {
            currentStreak: newStreak,
            longestStreak: newLongestStreak,
          },
        });

        streakIncrements++;
        console.log(
          `[Cron] User ${user.email}: Streak incremented to ${newStreak} (longest: ${newLongestStreak}) - ${completedTasks.length} task(s) completed`
        );
      }

      // Delete tasks that need cleanup:
      // 1. All completed tasks (regardless of deadline)
      // 2. All exceeded tasks that are not completed
      const tasksToDelete: number[] = [];
      
      // Add all completed tasks
      completedTasks.forEach(task => {
        tasksToDelete.push(task.id);
      });
      
      // Add exceeded tasks that are not completed
      exceededTasks.forEach(task => {
        if (!task.completed && !tasksToDelete.includes(task.id)) {
          tasksToDelete.push(task.id);
        }
      });
      
      if (tasksToDelete.length > 0) {
        const deleteResult = await prisma.task.deleteMany({
          where: { id: { in: tasksToDelete } },
        });
        tasksDeleted += deleteResult.count;
        console.log(
          `[Cron] User ${user.email}: Deleted ${deleteResult.count} task(s) (${completedTasks.length} completed, ${exceededTasks.filter(t => !t.completed).length} exceeded incomplete)`
        );
      }
    }

    console.log(
      `[Cron] Daily cleanup completed: ${processedUsers} users processed, ${streakIncrements} streaks incremented, ${streakResets} streaks reset, ${tasksDeleted} tasks deleted`
    );

    return NextResponse.json({
      success: true,
      processedUsers,
      streakIncrements,
      streakResets,
      tasksDeleted,
      timestamp: now.toISOString(),
    });
  } catch (err) {
    console.error("[Cron] Error in daily cleanup:", err);
    return NextResponse.json(
      { error: "Failed to run daily cleanup", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
