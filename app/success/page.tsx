"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useEffect } from "react";

export default function SuccessPage() {
  useEffect(() => {
    const end = Date.now() + 800;
    const colors = ["#6366F1", "#06B6D4", "#22C55E", "#F472B6"];
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 65, origin: { x: 0 }, colors });
      confetti({ particleCount: 4, angle: 120, spread: 65, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);
  return (
    <div className="min-h-dvh px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-4xl font-bold"
        >
          Registration received!
        </motion.h1>
        <p className="mt-3 text-gray-600 dark:text-gray-300">
          Thank you for registering for Eureka. Well email you the schedule and venue details shortly.
        </p>
        <Link
          href="/"
          className="inline-block mt-8 px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}


