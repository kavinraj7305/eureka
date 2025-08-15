import { NextResponse } from "next/server";
import PptxGenJS from "pptxgenjs";

export const runtime = "nodejs";

type BuildOutline = {
  title: string;
  slides: { title: string; bullets?: string[] }[];
};

function parseOutline(markdown: string, fallbackTitle?: string): BuildOutline | null {
  try {
    const lines = markdown.split(/\r?\n/);
    let start = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().toLowerCase().startsWith("### slide outline")) {
        start = i + 1;
        break;
      }
    }
    if (start === -1) {
      return null;
    }

    const numbered: { idx: number; raw: string }[] = [];
    for (let i = start; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().startsWith("### ")) break; // end at next section
      const m = line.match(/^\s*(\d+)\.\s+(.*)$/);
      if (m) {
        numbered.push({ idx: parseInt(m[1], 10), raw: m[2].trim() });
      }
    }
    if (numbered.length === 0) return null;

    const outline: BuildOutline = {
      title: fallbackTitle || "Eureka Pitch",
      slides: numbered
        .sort((a, b) => a.idx - b.idx)
        .map((n) => ({ title: n.raw })),
    };
    return outline;
  } catch {
    return null;
  }
}

function stars(n: number): string {
  const clamped = Math.max(0, Math.min(5, Math.round(n)));
  return "★★★★★☆☆☆☆☆".slice(5 - clamped, 10 - clamped);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      outlineMarkdown?: string;
      title?: string;
      idea?: {
        title: string;
        problem?: string;
        solution?: string;
        differentiator?: string;
        validation?: string[];
        pitch?: string;
        market?: string;
        mvpTime?: string;
        ratings?: {
          feasibility?: number;
          innovation?: number;
          publicImpact?: number;
          timeToMvp?: number;
          revenue?: number;
          overall?: number;
        };
        notes?: string[]; // from focused chat
      };
      usePresenton?: boolean;
    };

    const pptx = new PptxGenJS();
    pptx.layout = "LAYOUT_16x9";

    const sanitize = (text?: string) =>
      (text ?? "").replace(/[{}]/g, "");

    if (body?.idea && typeof body.idea.title === "string") {
      // If requested and configured, try Presenton first
      const presentonUrl = process.env.PRESENTON_URL;
      if (body.usePresenton && presentonUrl) {
        try {
          const res = await fetch(`${presentonUrl.replace(/\/$/, "")}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: body.idea.title,
              problem: body.idea.problem,
              solution: body.idea.solution,
              differentiator: body.idea.differentiator,
              market: body.idea.market,
              validation: body.idea.validation,
              mvpTime: body.idea.mvpTime,
              ratings: body.idea.ratings,
              pitch: body.idea.pitch,
              notes: body.idea.notes,
              format: "pptx",
            }),
          });
          if (res.ok) {
            const arrayBuf = await res.arrayBuffer();
            const buffer = Buffer.from(arrayBuf);
            return new Response(buffer, {
              status: 200,
              headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                "Content-Disposition": `attachment; filename=${(body.idea.title || "Eureka_Pitch").replace(/[^a-z0-9_\-]+/gi, "_")}.pptx`,
              },
            });
          }
          // else fall through to local generator
        } catch {
          // fall back to local generator
        }
      }

      const idea = body.idea;

      // Title slide
      {
        const slide = pptx.addSlide();
        slide.addText(sanitize(idea.title), {
          x: 0.5,
          y: 1.2,
          w: 9,
          h: 1.5,
          fontSize: 36,
          bold: true,
        });
        if (idea.pitch) {
          slide.addText(sanitize(idea.pitch), {
            x: 0.6,
            y: 2.6,
            w: 8.6,
            fontSize: 18,
            color: "333333",
          });
        }
        slide.addText("Eureka — RIT x IIT Bombay", {
          x: 0.5,
          y: 3.6,
          w: 9,
          fontSize: 14,
          color: "666666",
        });
      }

      // Problem
      if (idea.problem) {
        const slide = pptx.addSlide();
        slide.addText("Problem", { x: 0.5, y: 0.6, w: 9, h: 1, fontSize: 28, bold: true });
        slide.addText(sanitize(idea.problem), { x: 0.6, y: 1.4, w: 8.6, h: 4.6, fontSize: 18 });
      }

      // Solution
      if (idea.solution) {
        const slide = pptx.addSlide();
        slide.addText("Solution & How it works", { x: 0.5, y: 0.6, w: 9, h: 1, fontSize: 28, bold: true });
        slide.addText(sanitize(idea.solution), { x: 0.6, y: 1.4, w: 8.6, h: 4.6, fontSize: 18 });
      }

      // Market / Why now
      if (idea.market) {
        const slide = pptx.addSlide();
        slide.addText("Market/users & Why now", { x: 0.5, y: 0.6, w: 9, h: 1, fontSize: 28, bold: true });
        slide.addText(sanitize(idea.market), { x: 0.6, y: 1.4, w: 8.6, h: 4.6, fontSize: 18 });
      }

      // Differentiator
      if (idea.differentiator) {
        const slide = pptx.addSlide();
        slide.addText("Edge / Differentiator", { x: 0.5, y: 0.6, w: 9, h: 1, fontSize: 28, bold: true });
        slide.addText(sanitize(idea.differentiator), { x: 0.6, y: 1.4, w: 8.6, h: 4.6, fontSize: 18 });
      }

      // Execution / Feasibility
      if (idea.validation?.length || idea.mvpTime) {
        const slide = pptx.addSlide();
        slide.addText("Execution / Feasibility", { x: 0.5, y: 0.6, w: 9, h: 1, fontSize: 28, bold: true });
        const bullets: string[] = [];
        if (idea.mvpTime) bullets.push(sanitize(`Time to MVP: ${idea.mvpTime}`));
        if (idea.validation?.length) bullets.push(...idea.validation.map((v) => sanitize(`• ${v}`)));
        slide.addText(bullets.join("\n"), { x: 0.6, y: 1.4, w: 8.6, h: 4.6, fontSize: 18 });
      }

      // Ratings slide (if provided)
      if (idea.ratings) {
        const r = idea.ratings;
        const slide = pptx.addSlide();
        slide.addText("Ratings", { x: 0.5, y: 0.6, w: 9, h: 1, fontSize: 28, bold: true });
        const lines: string[] = [];
        if (typeof r.feasibility === "number") lines.push(`Feasibility: ${stars(r.feasibility)}`);
        if (typeof r.innovation === "number") lines.push(`Innovation: ${stars(r.innovation)}`);
        if (typeof r.publicImpact === "number") lines.push(`Public impact/Market: ${stars(r.publicImpact)}`);
        if (typeof r.timeToMvp === "number") lines.push(`Time-to-MVP: ${stars(r.timeToMvp)}`);
        if (typeof r.revenue === "number") lines.push(`Revenue potential: ${stars(r.revenue)}`);
        if (typeof r.overall === "number") lines.push(`Overall: ${r.overall.toFixed(1)} / 5`);
        slide.addText(lines.join("\n"), { x: 0.6, y: 1.4, w: 8.6, h: 4.6, fontSize: 18 });
      }

      // The ask + notes
      if (idea.notes?.length) {
        const slide = pptx.addSlide();
        slide.addText("The ask & Notes", { x: 0.5, y: 0.6, w: 9, h: 1, fontSize: 28, bold: true });
        slide.addText(idea.notes.map((n) => sanitize(`• ${n}`)).join("\n"), { x: 0.6, y: 1.4, w: 8.6, h: 4.6, fontSize: 18 });
      }

      const buffer = (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
      return new Response(buffer, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "Content-Disposition": `attachment; filename=${(idea.title || "Eureka_Pitch").replace(/[^a-z0-9_\-]+/gi, "_")}.pptx`,
        },
      });
    }

    // Fallback: outline-only mode
    if (!body?.outlineMarkdown || typeof body.outlineMarkdown !== "string") {
      return NextResponse.json({ error: "outlineMarkdown or idea is required" }, { status: 400 });
    }

    const parsed = parseOutline(body.outlineMarkdown, body.title);
    if (!parsed) {
      return NextResponse.json({ error: "Could not find a '### Slide outline' section with numbered slides" }, { status: 400 });
    }

    // Title slide
    {
      const slide = pptx.addSlide();
      slide.addText(sanitize(parsed.title), {
        x: 0.5,
        y: 1.5,
        w: 9,
        h: 1.5,
        fontSize: 36,
        bold: true,
      });
      slide.addText("Eureka — RIT x IIT Bombay", {
        x: 0.5,
        y: 3.2,
        w: 9,
        fontSize: 18,
        color: "666666",
      });
    }

    // Content slides
    for (const s of parsed.slides) {
      const slide = pptx.addSlide();
      slide.addText(sanitize(s.title), { x: 0.5, y: 0.6, w: 9, h: 1, fontSize: 28, bold: true });
    }

    const buffer = (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": "attachment; filename=Eureka_Pitch.pptx",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


