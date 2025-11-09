import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const taskId = parseInt(id);

  if (isNaN(taskId))
    return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });

  // Fetch the task
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { user: true },
  });

  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  if (task.user.email !== session.user.email)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Pure delete — no XP, no streak changes
  await prisma.task.delete({ where: { id: taskId } });

  return NextResponse.json({ success: true });
}
