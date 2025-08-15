import { NextResponse } from "next/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server missing GOOGLE_API_KEY" },
        { status: 500 }
      );
    }

    const body = (await request.json()) as {
      input?: string;
      messages?: { role: "user" | "assistant"; content: string }[];
    };
    const { input, messages } = body || {};
    if ((!input || typeof input !== "string") && !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid input: provide `input` string or `messages` array" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are the Eureka Idea Assistant for the preliminary round hosted at RIT (NEC), co-hosted with IIT Bombay.
Your job is to take students through a short, structured flow that results in 5 rated ideas and a crisp slide outline for a PPT.

Conversation policy (stateful, follow strictly):
1) If interests/constraints are not yet collected, ASK QUESTIONS ONLY. Ask 4–6 short questions to learn: interests/domains, target user, skills/resources, location/context (campus/city), time to MVP, budget constraints.
2) Once you have answers, propose exactly 5 idea candidates.
3) Output a ratings table (1–5 stars plus numeric) with columns: Feasibility, Innovation, Public impact/Market, Time-to-MVP (lower time = higher stars), Revenue potential. Include an Overall score (avg of criteria) as a number 1–5.
4) For each idea, output a brief deep dive: Problem, Proposed solution, Differentiator, Quick validation (2–3 checks), One-line pitch.
5) Output a section titled exactly: "### Slide outline (7 slides)" with 7 numbered slides:
   1. Title & Team
   2. Problem & Who is affected
   3. Solution & How it works
   4. Market/users & Why now
   5. Edge/differentiator
   6. Execution/feasibility (MVP, timeline)
   7. The ask (what support/funding)

General rules:
- Use Markdown only. Tables must be GitHub-flavored Markdown.
- Use the star glyph \u2B50 to render stars, e.g., ★★★★☆.
- If interests/constraints are unclear, do NOT propose ideas yet—ask clarifying questions first.
- Keep tone encouraging, practical, and concise.
- Always include a "### Next actions" section with the official link: https://www.ecell.in/eureka/.
`;

    let prompt: ChatPromptTemplate;
    let promptVars: Record<string, unknown> = {};
    if (Array.isArray(messages)) {
      // Build a chat prompt with history in a placeholder to avoid template parsing of braces
      const history = messages.map((m) =>
        m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content)
      );
      prompt = ChatPromptTemplate.fromMessages([
        ["system", systemPrompt],
        new MessagesPlaceholder("history"),
      ]);
      promptVars = { history };
    } else {
      prompt = ChatPromptTemplate.fromMessages([
        ["system", systemPrompt],
        ["human", "{input}"],
      ]);
      promptVars = { input: input ?? "" };
    }

    const requestedModel = process.env.GEMINI_MODEL || "gemini-2.0-flash";

    const runWithModel = async (modelName: string) => {
      const model = new ChatGoogleGenerativeAI({
        model: modelName,
        temperature: 0.6,
        apiKey,
      });
      const chain = prompt.pipe(model).pipe(new StringOutputParser());
      const reply = await chain.invoke(promptVars);
      return reply;
    };

    let reply: string;
    let modelUsed = requestedModel;
    try {
      reply = await runWithModel(requestedModel);
    } catch (err) {
      console.error("Primary model failed", requestedModel, err);
      modelUsed = "gemini-1.5-flash";
      reply = await runWithModel(modelUsed);
    }

    return NextResponse.json({ reply, modelUsed });
  } catch (err) {
    console.error("/api/idea-assistant error", err);
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


