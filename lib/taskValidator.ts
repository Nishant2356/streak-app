export async function validateTaskWithAI(
  title: string,
  description: string,
  difficulty: string
): Promise<{ isRelevant: boolean; reason: string }> {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const modelId = "gemini-2.5-flash"; // Fast + reliable
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`;

    const prompt = `
You are an **AI task validator** for a gamified productivity app.

Your responsibility:
1. Approve **only tasks** that are practical, meaningful, and beneficial for growth or discipline.
2. Be **extremely strict** about difficulty accuracy.
3. Reject **any low-effort, vague, or joke-like** tasks.

Task details:
- Title: "${title}"
- Description: "${description}"
- Claimed Difficulty: ${difficulty}

🔥 STRICT VALIDATION RULES 🔥
--------------------------------
1️⃣ Meaning & Purpose:
- Task must represent a real, productive activity (learning, fitness, creativity, self-care, or work).
- Reject tasks that are jokes, repetitive (e.g., "breathe", "blink"), or trivial ("walk 1 min", "say hello").

2️⃣ Difficulty Enforcement (Very strict):
- EASY → Small, low-effort daily habits or chores taking <15 minutes.
  Examples: "Drink water", "Make bed", "Stretch for 5 min", "homework".
- MEDIUM → Requires focus or consistent effort (30–90 minutes).
  Examples: "Study one topic", "Workout for 45 min", "Solve 2 coding problems".
  ❌ Reject if the task takes less than 20 minutes or lacks substance.
- HARD → Long, challenging, or multi-step task (>2 hours, requiring skill or planning).
  Examples: "Develop a feature", "Prepare for an exam", "Write a report".
  ❌ Reject if too short, easy, or vague.

3️⃣ General Rejections:
- Reject incomplete or unclear tasks.
- Reject unrealistic or impossible tasks.
- Reject mismatched difficulty strictly (like "walk 1 min" marked MEDIUM).

Respond **strictly in JSON format only**:
{
  "isRelevant": true or false,
  "reason": "Choose only from: 'Task valid', 'Invalid task', 'Inappropriate task', 'Difficulty mismatch'"
}
`;

    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    });

    const data = await response.json();
    console.log("🔍 Raw Gemini Response:", data);

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    // 🧩 Clean up AI text (remove markdown fences or explanations)
    const cleanText = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .replace(/^[^{]+/, "") // remove extra leading text
      .replace(/[^}]+$/, "") // remove trailing junk
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleanText);

      // Validate the JSON structure
      if (
        typeof parsed.isRelevant !== "boolean" ||
        typeof parsed.reason !== "string" ||
        !["Task valid", "Invalid task", "Inappropriate task", "Difficulty mismatch"].includes(parsed.reason)
      ) {
        throw new Error("Malformed AI output");
      }
    } catch (err) {
      console.error("JSON parse failed or invalid format:", cleanText);
      parsed = { isRelevant: false, reason: "Invalid AI response" };
    }

    console.log("✅ AI Validation Result:", parsed);
    return parsed;
  } catch (error) {
    console.error("AI validation error:", error);
    return { isRelevant: false, reason: "AI validation failed" };
  }
}
