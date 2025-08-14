"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = { role: "user" | "assistant"; content: string };

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    content: "Hi! I\'m the Eureka Idea Assistant. Tell me your interests, problems you care about, or a domain (e.g., health, campus, fintech) — I\'ll suggest pitch-ready ideas.",
  }]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = async () => {
    if (pending) return;
    const input = inputRef.current?.value?.trim();
    if (!input) return;
    inputRef.current!.value = "";
    const next = [...messages, { role: "user", content: input }];
    setMessages(next);
    setPending(true);
    try {
      const res = await fetch("/api/idea-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed");
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${e?.message || "Unexpected"}` },
      ]);
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-indigo-600 text-white px-4 py-3 shadow-lg hover:bg-indigo-500"
      >
        {open ? "Close" : "Idea Chat"}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-6 z-50 w-[92vw] max-w-md rounded-xl border border-black/10 dark:border-white/15 bg-white/90 dark:bg-zinc-900/90 backdrop-blur shadow-xl"
          >
            <div className="p-4 border-b border-black/10 dark:border-white/15 font-semibold">Eureka Idea Assistant</div>
            <div className="max-h-[50vh] overflow-y-auto p-4 space-y-3 text-sm">
              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                  <div className={`inline-block rounded-lg px-3 py-2 ${m.role === "user" ? "bg-indigo-600 text-white" : "bg-black/5 dark:bg-white/10"}`}>
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                      </div>
                    ) : (
                      m.content
                    )}
                  </div>
                </div>
              ))}
              {pending && <div className="opacity-60">Thinking…</div>}
              <div ref={endRef} />
            </div>
            <div className="p-3 border-t border-black/10 dark:border-white/15">
              <div className="flex gap-2">
                <textarea ref={inputRef} rows={2} placeholder="Describe your interests or a problem…" className="flex-1 rounded-lg border border-black/10 dark:border-white/15 px-3 py-2" />
                <button onClick={send} disabled={pending} className="rounded-lg bg-emerald-600 text-white px-4 py-2 disabled:opacity-60">Send</button>
              </div>
              <div className="mt-2 text-[11px] opacity-60">
                Tip: Try “I like sustainability and campus life, suggest ideas”. Register at the official site first, then RIT prelims.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


