import {
  Agent,
  Runner,
  setTracingDisabled,
  tool,
  OpenAIProvider,
  setDefaultOpenAIClient,
  setOpenAIAPI,
  setDefaultOpenAIKey,
} from "@openai/agents";
import OpenAI from "openai";
import { config } from "dotenv";

// Load environment variables from .env file
config();

if (!process.env.BASE_URL || !process.env.API_KEY || !process.env.MODEL_NAME) {
  throw new Error(
    "Please set EXAMPLE_BASE_URL, EXAMPLE_API_KEY, EXAMPLE_MODEL_NAME via env var or code."
  );
}

/**
 * This example uses a custom provider for all requests by default. We do three things:
 * 1. Create a custom client.
 * 2. Set it as the default OpenAI client, and don't use it for tracing.
 * 3. Set the default API as Chat Completions, as most LLM providers don't yet support Responses API.
 *
 * Note that in this example, we do not set up tracing, under the assumption that you don't have an API key
 * from platform.openai.com. If you do have one, you can set the `OPENAI_API_KEY` env var for tracing.
 */

// Create a custom OpenAI client and provider
const openaiClient = new OpenAI({
  apiKey: process.env.API_KEY,
  baseURL: process.env.BASE_URL,
});
const modelProvider = new OpenAIProvider({
  openAIClient: openaiClient,
});
setDefaultOpenAIClient(openaiClient); // Pass the OpenAI client instance
setOpenAIAPI("chat_completions");
setTracingDisabled(true);

export const schedulerAgent = new Agent({
  name: "TaskSchedulerAgent",
  instructions: `
    You are an intelligent schedule planner.
    User will give you:
    - today's tasks (with title, description, difficulty, priority, xp)
    - current time
    - optional special instructions

    Your job:
    - create a perfect schedule from NOW until midnight
    - break tasks into time blocks
    - ensure realistic durations
    - avoid overlaps
    - include small breaks
    - if it is very late at night you can create two schedules: one can be tonight and one can be the tomorrow at perfect time which will be recommended
    - follow any special instructions given by user
    - make realistic schedule with requent breaks if possible
    - output in clean readable format:

    Example format:
    2:00 PM – 2:45 PM → Finish login page (HARD)
    2:45 PM – 3:00 PM → Break
    3:00 PM – 3:30 PM → Solve DSA Task (MEDIUM)
  `,
  model: "gemini-2.5-pro",
});
