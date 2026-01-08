import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function PATCH(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();

  try {
    // Check if the user is trying to change their email
    if (data.email && data.email !== session.user.email) {
      // Check if the new email is already taken by another user
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 400 }
        );
      }
    }

    // Check if username is being changed and if it's unique
    if (data.username) {
      const existingUsername = await prisma.user.findFirst({
        where: {
          username: data.username,
          NOT: {
            email: session.user.email,
          },
        },
      });

      if (existingUsername) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 400 }
        );
      }
    }

    // Update the user
    const updated = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: data.name,
        username: data.username,
        email: data.email,
        image: data.image,
        githubId: data.githubId,
        leetcodeId: data.leetcodeId,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}