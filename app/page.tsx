"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import AnimatedBackground from "./components/AnimatedBackground";
import Marquee from "./components/Marquee";
import MagneticButton from "./components/MagneticButton";
import LogoStrip from "./components/LogoStrip";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-dvh bg-[radial-gradient(60%_80%_at_50%_20%,rgba(80,80,255,0.25),transparent),radial-gradient(40%_60%_at_80%_60%,rgba(255,80,200,0.18),transparent),var(--background)] overflow-hidden">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="preloader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black text-white"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 120, damping: 14 }}
              className="text-center px-6"
            >
              <div className="text-3xl sm:text-5xl font-bold tracking-tight">Eureka 2025</div>
              <div className="mt-3 text-sm sm:text-base text-gray-300">
                Hope on to be a bigger part — a small idea is enough. You can get funding.
              </div>
              <motion.div
                className="mt-6 h-1 w-40 bg-white/20 rounded-full overflow-hidden mx-auto"
                initial={{}}
                animate={{}}
              >
                <motion.div
                  className="h-full w-1/3 bg-white"
                  initial={{ x: "-100%" }}
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatedBackground />
      <main className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            Eureka — RIT x IIT Bombay
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            We host the preliminary round on 19th. Scan the QR, register, present your idea, and fast-track to the next round.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/qr" className="contents">
              <MagneticButton className="bg-indigo-600 text-white hover:bg-indigo-500">
                Start registration
              </MagneticButton>
            </Link>
            <a href="#about" className="contents">
              <MagneticButton className="border border-black/10 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5">
                Learn more
              </MagneticButton>
            </a>
          </div>
        </motion.div>

        <div className="mt-14">
          <Marquee
            items={["IIT Bombay", "RIT (NEC)", "Preliminary Round", "Funding", "Pitch", "Innovation"]}
          />
        </div>

        <section id="about" className="mt-16 grid gap-8 sm:grid-cols-3">
          {[
            {
              title: "Preliminary at RIT (NEC)",
              body: "We are the co-host. Pitch your idea to judges and get shortlisted.",
            },
            {
              title: "Go straight to next round",
              body: "Winners here advance directly to Eureka's next round.",
            },
            {
              title: "Funding-focused",
              body: "A small idea is enough—get feedback, traction, and potential funding.",
            },
          ].map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: 0.05 * idx }}
              className="rounded-xl border border-black/10 dark:border-white/15 p-6 backdrop-blur bg-white/60 dark:bg-white/5"
            >
              <div className="text-lg font-semibold">{card.title}</div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">{card.body}</div>
            </motion.div>
          ))}
        </section>

        <LogoStrip />
      </main>
    </div>
  );
}
