"use client";

import AnimatedBackground from "../components/AnimatedBackground";

const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSde3jnqOnvdGj3VfRzyYzl7cR5Dyp5MOJiiYDsL-rHkH9GViw/viewform";

export default function RegisterPage() {
  const embedUrl = `${GOOGLE_FORM_URL}?embedded=true`;
  return (
    <div className="min-h-dvh px-3 sm:px-6 py-6 sm:py-10">
      <AnimatedBackground />
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl sm:text-4xl font-bold">Register for Eureka — RIT (NEC)</h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
          Registration is handled via Google Forms. Use the embedded form below or open it in a new tab.
        </p>
        <div className="mt-4 flex gap-3">
          <a
            href={GOOGLE_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
          >
            Open in new tab
          </a>
        </div>
        <div className="mt-5 rounded-xl border border-black/10 dark:border-white/15 overflow-hidden bg-white/70 dark:bg-white/5">
          <iframe
            title="Eureka Registration Google Form"
            src={embedUrl}
            width="100%"
            height="1400"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}


