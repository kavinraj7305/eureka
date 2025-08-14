"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import MagneticButton from "../components/MagneticButton";

export default function QRFlowPage() {
  const [ack, setAck] = useState(false);
  return (
    <div className="min-h-dvh px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-4xl font-bold"
        >
          Two-step registration
        </motion.h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          First complete your official Eureka registration, then fill the RIT preliminary round form.
        </p>

        <ol className="mt-8 space-y-6">
          <li className="rounded-xl border border-black/10 dark:border-white/15 p-6 bg-white/70 dark:bg-white/5">
            <div className="font-semibold">Step 1 — Official Eureka</div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Open the official Eureka registration page and finish your signup there.
            </p>
            <MagneticButton asLinkHref="https://www.ecell.in/eureka/" className="mt-4 bg-indigo-600 text-white hover:bg-indigo-500">
              Open Eureka site
            </MagneticButton>
            <label className="mt-4 flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1 size-4"
                checked={ack}
                onChange={(e) => setAck(e.target.checked)}
              />
              <span>I have completed the registration on the Eureka website.</span>
            </label>
          </li>

          <li className="rounded-xl border border-black/10 dark:border-white/15 p-6 bg-white/70 dark:bg-white/5">
            <div className="font-semibold">Step 2 — RIT Preliminary Round</div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              After finishing Step 1, proceed to our local registration for the prelims hosted at RIT (NEC).
            </p>
            {ack ? (
              <Link href="/register" className="contents">
                <MagneticButton className="mt-4 bg-emerald-600 text-white hover:bg-emerald-500">
                  Continue to RIT registration
                </MagneticButton>
              </Link>
            ) : (
              <button disabled className="mt-4 px-5 py-3 rounded-lg bg-gray-300 text-gray-600 cursor-not-allowed">
                Continue to RIT registration
              </button>
            )}
          </li>
        </ol>
      </div>
    </div>
  );
}


