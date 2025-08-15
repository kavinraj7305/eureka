"use client";

import { useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Step = 1 | 2 | 3;

export default function AssistantPage() {
  const [step, setStep] = useState<Step>(1);
  const [pending, setPending] = useState(false);
  const [assistantReply, setAssistantReply] = useState<string>("");
  const [ideasJson, setIdeasJson] = useState<any[] | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const [focusedMessages, setFocusedMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [manualTitle, setManualTitle] = useState("");
  const [selectedTitle, setSelectedTitle] = useState("");
  const [downloadPending, setDownloadPending] = useState(false);
  const [usePresenton, setUsePresenton] = useState(false);

  const interestsRef = useRef<HTMLTextAreaElement>(null);
  const targetUserRef = useRef<HTMLInputElement>(null);
  const skillsRef = useRef<HTMLTextAreaElement>(null);
  const contextRef = useRef<HTMLSelectElement>(null);
  const mvpTimeRef = useRef<HTMLSelectElement>(null);
  const budgetRef = useRef<HTMLInputElement>(null);

  const submitStep1 = async () => {
    if (pending) return;
    const interests = interestsRef.current?.value?.trim();
    const targetUser = targetUserRef.current?.value?.trim();
    const skills = skillsRef.current?.value?.trim();
    const context = contextRef.current?.value?.trim();
    const mvpTime = mvpTimeRef.current?.value?.trim();
    const budget = budgetRef.current?.value?.trim();

    if (!interests) return;

    const content = `Here are my constraints and preferences for Eureka idea suggestions:\n\n` +
      `- Interests/domains: ${interests}\n` +
      `- Target user: ${targetUser || "(not specified)"}\n` +
      `- Skills/resources: ${skills || "(not specified)"}\n` +
      `- Context/location: ${context || "(not specified)"}\n` +
      `- Time to MVP: ${mvpTime || "(not specified)"}\n` +
      `- Budget constraints: ${budget || "(not specified)"}\n\n` +
      `Please proceed with the structured flow: propose exactly 5 ideas, include the ratings table with stars and overall score, the deep dives, and the section titled "### Slide outline (7 slides)" as instructed.`;

    setPending(true);
    try {
      const res = await fetch("/api/idea-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content }] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed");
      setAssistantReply(data.reply);
      // 1) Try to extract a JSON block
      let candidates: any[] | null = null;
      try {
        const jsonMatch = data.reply.match(/```json\s*([\s\S]*?)```/i);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[1]);
          if (Array.isArray(parsed)) candidates = parsed;
        }
      } catch {}
      // 2) Fallback: parse from Markdown bullets in "Tailored idea directions"
      if (!candidates) {
        const titles = extractIdeaTitles(data.reply);
        if (titles.length) candidates = titles.map((t) => ({ title: t }));
      }
      setIdeasJson(candidates);
      setStep(2);
    } catch (e: any) {
      setAssistantReply(`Error: ${e?.message || "Unexpected"}`);
      setStep(2);
    } finally {
      setPending(false);
    }
  };

  const latestOutline = useMemo(() => {
    if (/###\s*Slide outline/i.test(assistantReply)) {
      return assistantReply;
    }
    return null;
  }, [assistantReply]);

  const regenerateIdeas = async () => {
    if (pending) return;
    setPending(true);
    try {
      const res = await fetch("/api/idea-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [
          { role: "user", content: assistantReply },
          { role: "user", content: "Please generate 5 different ideas (not overlapping) with ratings and the slide outline section." }
        ] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed");
      setAssistantReply(data.reply);
      setSelectedIdx(null);
      setIdeasJson(null);
    } catch (e: any) {
      alert(e?.message || "Failed to regenerate");
    } finally {
      setPending(false);
    }
  };

  const proceedWithSelection = (customTitle?: string) => {
    const idx = selectedIdx;
    const chosen = idx != null ? ideasJson?.[idx] : null;
    const title = (customTitle && customTitle.trim()) || chosen?.title || (idx != null ? `Idea ${idx + 1}` : "Selected idea");
    if (!title) return;
    setSelectedTitle(title);
    setFocusedMessages([
      { role: "assistant", content: `You selected: ${title}. Ask me anything to refine this idea—problem, features, GTM, MVP plan, metrics, or risks. When ready, click Download PPT.` },
    ]);
    setStep(3);
  };

  const addNote = (text: string) => {
    if (!text.trim()) return;
    setNotes((n) => [...n, text.trim()]);
  };

  const downloadPpt = async () => {
    if (!latestOutline) return;
    try {
      const res = await fetch("/api/idea-assistant/ppt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outlineMarkdown: latestOutline }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to generate PPT");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Eureka_Pitch.pptx";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e?.message || "Failed to generate PPT");
    }
  };

  return (
    <div className="min-h-dvh px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">Eureka Idea Assistant</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Step-by-step flow to craft your pitch-ready idea.</p>

        <div className="mt-6 flex items-center gap-2 text-xs">
          <div className={`h-2 w-24 rounded-full ${step === 1 ? "bg-indigo-600" : "bg-indigo-300"}`} />
          <div className={`h-2 w-24 rounded-full ${step === 2 ? "bg-indigo-600" : "bg-indigo-300"}`} />
          <div className={`h-2 w-24 rounded-full ${step === 3 ? "bg-indigo-600" : "bg-indigo-300"}`} />
        </div>

        {step === 1 && (
          <div className="mt-8 space-y-5 rounded-xl border border-black/10 dark:border-white/15 p-5 bg-white/70 dark:bg-zinc-900/70 backdrop-blur">
            <div>
              <label className="text-sm font-medium">Interests/domains</label>
              <textarea ref={interestsRef} rows={3} placeholder="e.g., sustainability, campus life, health-tech, fintech" className="mt-2 w-full rounded-lg border border-black/10 dark:border-white/15 px-3 py-2" />
            </div>
            <div>
              <label className="text-sm font-medium">Target user</label>
              <input ref={targetUserRef} placeholder="e.g., college students, small shops, admin" className="mt-2 w-full rounded-lg border border-black/10 dark:border-white/15 px-3 py-2" />
            </div>
            <div>
              <label className="text-sm font-medium">Skills/resources</label>
              <textarea ref={skillsRef} rows={2} placeholder="e.g., React, Python, design, lab access, club network" className="mt-2 w-full rounded-lg border border-black/10 dark:border-white/15 px-3 py-2" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Context/location</label>
                <select ref={contextRef} className="mt-2 w-full rounded-lg border border-black/10 dark:border-white/15 px-3 py-2">
                  <option value="Campus">Campus</option>
                  <option value="City/Local">City/Local</option>
                  <option value="Regional/National">Regional/National</option>
                  <option value="Online/Global">Online/Global</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Time to MVP</label>
                <select ref={mvpTimeRef} className="mt-2 w-full rounded-lg border border-black/10 dark:border-white/15 px-3 py-2">
                  <option value="1–4 weeks">1–4 weeks</option>
                  <option value="1–3 months">1–3 months</option>
                  <option value=">3 months">&gt; 3 months</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Budget constraints</label>
                <input ref={budgetRef} placeholder="e.g., under ₹5k, need free tools" className="mt-2 w-full rounded-lg border border-black/10 dark:border-white/15 px-3 py-2" />
              </div>
            </div>
            <div className="pt-2">
              <button onClick={submitStep1} disabled={pending} className="rounded-lg bg-emerald-600 text-white px-4 py-2 disabled:opacity-60">
                {pending ? "Thinking…" : "Generate 5 ideas"}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-8 rounded-xl border border-black/10 dark:border-white/15 p-5 bg-white/70 dark:bg-zinc-900/70 backdrop-blur">
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{assistantReply}</ReactMarkdown>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => setStep(1)} className="rounded-lg border border-black/10 dark:border-white/20 px-4 py-2">Back</button>
              <button onClick={regenerateIdeas} disabled={pending} className="rounded-lg border border-black/10 dark:border-white/20 px-4 py-2 disabled:opacity-60">{pending ? "…" : "Generate another 5 ideas"}</button>
              {ideasJson && (
                <>
                  <select value={selectedIdx ?? ""} onChange={(e) => setSelectedIdx(e.target.value ? Number(e.target.value) : null)} className="rounded-lg border border-black/10 dark:border-white/20 px-3 py-2">
                    <option value="">Select one idea…</option>
                    {ideasJson.map((it, idx) => (
                      <option key={idx} value={idx}>{it?.title || `Idea ${idx + 1}`}</option>
                    ))}
                  </select>
                  <button onClick={proceedWithSelection} disabled={selectedIdx == null} className="rounded-lg bg-emerald-600 text-white px-4 py-2 disabled:opacity-60">Continue with selected idea</button>
                </>
              )}
              {!ideasJson && (
                <>
                  <input value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} placeholder="Type the idea title you like…" className="rounded-lg border border-black/10 dark:border-white/20 px-3 py-2 w-64" />
                  <button onClick={() => proceedWithSelection(manualTitle)} disabled={!manualTitle.trim()} className="rounded-lg bg-emerald-600 text-white px-4 py-2 disabled:opacity-60">Continue</button>
                  {latestOutline && (
                    <button onClick={downloadPpt} className="rounded-lg bg-indigo-600 text-white px-4 py-2">Download PPT</button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-8 rounded-xl border border-black/10 dark:border-white/15 p-5 bg-white/70 dark:bg-zinc-900/70 backdrop-blur space-y-4">
            <div className="text-lg font-semibold">Focused chat for your chosen idea</div>
            <div className="space-y-3 max-h-[45vh] overflow-y-auto p-2 rounded-lg bg-black/5 dark:bg-white/5">
              {focusedMessages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                  <div className={`inline-block rounded-lg px-3 py-2 ${m.role === "user" ? "bg-emerald-600 text-white" : "bg-black/5 dark:bg-white/10"}`}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
            <FocusedInput
              onSend={async (text) => {
                const chosen = ideasJson?.[selectedIdx ?? -1];
                if (!text.trim()) return;
                const titleCtx = chosen?.title || selectedTitle || manualTitle || "our selected idea";
                const baseContext = `We have selected the idea titled "${titleCtx}". From now on, answer ONLY about this idea.`;
                const newMsgs = [...focusedMessages, { role: "user", content: text.trim() }];
                setFocusedMessages(newMsgs);
                try {
                  const res = await fetch("/api/idea-assistant", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      messages: [
                        { role: "user", content: baseContext },
                        ...newMsgs,
                      ],
                    }),
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data?.error || "Failed");
                  setFocusedMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
                } catch (e: any) {
                  setFocusedMessages((prev) => [...prev, { role: "assistant", content: `Error: ${e?.message || "Unexpected"}` }]);
                }
              }}
            />
            <div className="pt-2">
              <div className="text-sm font-medium mb-2">Optional: notes for final slide</div>
              <NotesEditor onAdd={addNote} notes={notes} />
            </div>
            <div className="pt-2 flex gap-2">
              <button onClick={() => setStep(2)} className="rounded-lg border border-black/10 dark:border-white/20 px-4 py-2">Back</button>
              <button
                onClick={async () => {
                  const chosen = ideasJson?.[selectedIdx ?? -1];
                  // Ask the assistant to output ONLY JSON for the chosen idea
                  let structured: any = null;
                  setDownloadPending(true);
                  try {
                    const titleForStructure = chosen?.title || selectedTitle || manualTitle;
                    if (!titleForStructure) { alert("Please select or enter an idea title first."); return; }
                    const structurePrompt = `We have selected the idea titled "${titleForStructure}". Based on our discussion, output ONLY minified JSON (no markdown, no text) with this exact schema:\n{\n  "title": string,\n  "problem": string,\n  "solution": string,\n  "differentiator": string,\n  "market": string,\n  "validation": string[],\n  "mvpTime": string,\n  "ratings": {\n    "feasibility": number,\n    "innovation": number,\n    "publicImpact": number,\n    "timeToMvp": number,\n    "revenue": number,\n    "overall": number\n  },\n  "pitch": string\n}`;
                    const res0 = await fetch("/api/idea-assistant", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        messages: [
                          { role: "user", content: structurePrompt },
                          ...focusedMessages,
                        ],
                      }),
                    });
                    const data0 = await res0.json();
                    if (!res0.ok) throw new Error(data0?.error || "Failed to structure");
                    const replyText = String(data0.reply || "");
                    const codeFence = replyText.match(/```json\s*([\s\S]*?)```/i);
                    const rawCandidate = codeFence ? codeFence[1] : replyText;
                    const match = rawCandidate.match(/\{[\s\S]*\}/);
                    const jsonText = match ? match[0] : rawCandidate;
                    structured = JSON.parse(jsonText);
                  } catch (e: any) {
                    // Fallback to minimal PPT with at least a title and notes
                    const fallbackTitle = chosen?.title || selectedTitle || manualTitle || "Eureka Pitch";
                    structured = { title: fallbackTitle, validation: [], ratings: {}, notes } as any;
                  }

                  const res = await fetch("/api/idea-assistant/ppt", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ idea: { ...structured, notes }, usePresenton }),
                  });
                  if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    alert(data?.error || "Failed to generate PPT");
                    setDownloadPending(false);
                    return;
                  }
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${(structured?.title || chosen?.title || selectedTitle || "Eureka_Pitch").replace(/[^a-z0-9_\-]+/gi, "_")}.pptx`;
                  a.click();
                  URL.revokeObjectURL(url);
                  setDownloadPending(false);
                }}
                disabled={downloadPending}
                className="rounded-lg bg-indigo-600 text-white px-4 py-2 disabled:opacity-60"
              >
                {downloadPending ? "Generating…" : "Download PPT"}
              </button>
              <label className="ml-2 inline-flex items-center gap-2 text-sm opacity-80">
                <input type="checkbox" checked={usePresenton} onChange={(e) => setUsePresenton(e.target.checked)} />
                Use Presenton (if configured)
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NotesEditor({ onAdd, notes }: { onAdd: (text: string) => void; notes: string[] }) {
  const [val, setVal] = useState("");
  return (
    <div>
      <div className="flex gap-2">
        <input value={val} onChange={(e) => setVal(e.target.value)} placeholder="Add a note…" className="flex-1 rounded-lg border border-black/10 dark:border-white/15 px-3 py-2" />
        <button onClick={() => { onAdd(val); setVal(""); }} className="rounded-lg border border-black/10 dark:border-white/20 px-4 py-2">Add</button>
      </div>
      {!!notes.length && (
        <ul className="mt-3 list-disc pl-6 text-sm">
          {notes.map((n, i) => (<li key={i}>{n}</li>))}
        </ul>
      )}
    </div>
  );
}

function FocusedInput({ onSend }: { onSend: (text: string) => void }) {
  const [val, setVal] = useState("");
  return (
    <div className="flex gap-2">
      <input value={val} onChange={(e) => setVal(e.target.value)} placeholder="Ask or add details…" className="flex-1 rounded-lg border border-black/10 dark:border-white/15 px-3 py-2" />
      <button onClick={() => { onSend(val); setVal(""); }} className="rounded-lg bg-emerald-600 text-white px-4 py-2">Send</button>
    </div>
  );
}

function extractIdeaTitles(md: string): string[] {
  const lines = md.split(/\r?\n/);
  let i = lines.findIndex((l) => /^\s*###\s*Tailored idea directions/i.test(l));
  if (i === -1) return [];
  const titles: string[] = [];
  for (let j = i + 1; j < lines.length; j++) {
    const line = lines[j];
    if (/^\s*###\s+/.test(line)) break;
    const bullet = line.match(/^\s*(?:[-*]|\d+\.)\s+(.*)$/);
    if (bullet) {
      const text = bullet[1].trim();
      if (text) titles.push(text.replace(/\*|\_/g, ""));
    }
  }
  return titles.slice(0, 5);
}


