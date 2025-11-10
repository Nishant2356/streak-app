import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const authHeader = req.headers.get("Authorization");
  const cronSecret = process.env.CRON_SECRET;

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
    let totalXpDistributed = 0;

    for (const user of users) {
      const tasks = user.tasks;
      if (tasks.length === 0) continue;

      processedUsers++;

      const exceededTasks = tasks.filter(
        (t) => t.dueDate && new Date(t.dueDate) < now
      );
      const completedTasks = tasks.filter((t) => t.completed);

      const hasCompletedTask = completedTasks.length > 0;
      const hasExceededTask = exceededTasks.length > 0;

      // ---- 🧠 XP CALCULATION ----
      const earnedXp = completedTasks.reduce(
        (sum, t) => sum + (t.xpReward || 0),
        0
      );

      let newXp = user.xp;
      let newLevel = user.level;

      if (earnedXp > 0) {
        newXp += earnedXp;
        totalXpDistributed += earnedXp;

        // Optional: Level-up logic (1 level per 100 XP, for example)
        const levelThreshold = 100;
        const extraLevels = Math.floor(newXp / levelThreshold) - Math.floor(user.xp / levelThreshold);
        if (extraLevels > 0) {
          newLevel += extraLevels;
        }
      }

      // ---- 🔥 STREAK LOGIC ----
      if (hasExceededTask || !hasCompletedTask) {
        await prisma.user.update({
          where: { id: user.id },
          data: { currentStreak: 0 },
        });

        streakResets++;
        console.log(
          `[Cron] ${user.email}: Streak reset (exceeded=${hasExceededTask}, completed=${completedTasks.length}/${tasks.length})`
        );
      } else if (hasCompletedTask && !hasExceededTask) {
        const newStreak = user.currentStreak + 1;
        const newLongest = Math.max(newStreak, user.longestStreak);

        await prisma.user.update({
          where: { id: user.id },
          data: {
            currentStreak: newStreak,
            longestStreak: newLongest,
            xp: newXp,
            level: newLevel,
          },
        });

        streakIncrements++;
        console.log(
          `[Cron] ${user.email}: Streak ${newStreak}, XP +${earnedXp} → ${newXp}, Level ${newLevel}`
        );
      } else {
        // even if streak resets, still update XP if earned
        if (earnedXp > 0) {
          await prisma.user.update({
            where: { id: user.id },
            data: { xp: newXp, level: newLevel },
          });
        }
      }

      // ---- 🧹 TASK CLEANUP ----
      const completedIds = completedTasks.map((t) => t.id);
      const exceededIncompleteIds = exceededTasks
        .filter((t) => !t.completed)
        .map((t) => t.id);
      const tasksToDelete = [...new Set([...completedIds, ...exceededIncompleteIds])];

      if (tasksToDelete.length > 0) {
        const result = await prisma.task.deleteMany({
          where: { id: { in: tasksToDelete } },
        });
        tasksDeleted += result.count;
        console.log(
          `[Cron] ${user.email}: Deleted ${result.count} tasks (completed=${completedTasks.length}, exceeded=${exceededIncompleteIds.length})`
        );
      }
    }

    console.log(
      `[Cron] ✅ Cleanup done: ${processedUsers} users, ${streakIncrements} streak↑, ${streakResets} streak reset, ${tasksDeleted} tasks deleted, +${totalXpDistributed} XP distributed`
    );

    return NextResponse.json({
      success: true,
      processedUsers,
      streakIncrements,
      streakResets,
      tasksDeleted,
      totalXpDistributed,
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
