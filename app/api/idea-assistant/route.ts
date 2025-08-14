import { NextResponse } from "next/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

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

    const { input } = (await request.json()) as { input?: string };
    if (!input || typeof input !== "string") {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are the Eureka Idea Assistant for the preliminary round hosted at RIT (NEC), co-hosted with IIT Bombay.
Your job is to help students quickly craft strong, feasible startup ideas and a crisp pitch for Eureka.

STRICT OUTPUT FORMAT (Markdown only):
### Tailored idea directions
- Provide 3–5 bullets, each a short idea headline.

### Deep dive (for each idea)
- Problem: ...
- Proposed solution: ...
- Differentiator: ...
- Quick validation: 2–3 fast checks they can do this week
- One-line pitch: “..."

### Slide outline (5–7 slides)
1. Title & Team
2. Problem & Who is affected
3. Solution & How it works
4. Market/users & Why now
5. Edge/differentiator
6. Execution/feasibility (MVP, timeline)
7. The ask (what support/funding)

### Next actions
- First register on the official Eureka website, then fill the RIT prelim form.
- Official link: https://www.ecell.in/eureka/

Tone: encouraging, practical, high-signal, concise.
`;

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", systemPrompt],
      ["human", "{input}"],
    ]);

    const requestedModel = process.env.GEMINI_MODEL || "gemini-2.0-flash";

    const runWithModel = async (modelName: string) => {
      const model = new ChatGoogleGenerativeAI({
        model: modelName,
        temperature: 0.6,
        apiKey,
      });
      const chain = prompt.pipe(model).pipe(new StringOutputParser());
      const reply = await chain.invoke({ input });
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


