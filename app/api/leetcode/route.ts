import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username"); // ✅ CORRECT

  if (!username) {
    return NextResponse.json(
      { error: "Username required" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Referer": "https://leetcode.com",
      },
      body: JSON.stringify({
        query: `
          query getUserProfile($username: String!) {
            matchedUser(username: $username) {
              submitStatsGlobal {
                acSubmissionNum {
                  difficulty
                  count
                }
              }
            }
          }
        `,
        variables: { username },
      }),
    });

    const data = await res.json();
    const stats = data.data.matchedUser.submitStatsGlobal.acSubmissionNum;

    return NextResponse.json({
      easy: stats.find((s: any) => s.difficulty === "Easy")?.count || 0,
      medium: stats.find((s: any) => s.difficulty === "Medium")?.count || 0,
      hard: stats.find((s: any) => s.difficulty === "Hard")?.count || 0,
      total: stats.find((s: any) => s.difficulty === "All")?.count || 0,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch LeetCode data" },
      { status: 500 }
    );
  }
}
