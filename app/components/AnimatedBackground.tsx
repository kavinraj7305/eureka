"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function AnimatedBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      const blobs = gsap.utils.toArray<HTMLElement>(".bg-blob");
      blobs.forEach((el, i) => {
        gsap.to(el, {
          x: `+=${i % 2 === 0 ? 60 : -60}`,
          y: `+=${i % 2 === 0 ? -40 : 40}`,
          scale: gsap.utils.random(0.95, 1.1),
          filter: "blur(40px)",
          duration: gsap.utils.random(6, 10),
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: 0.2,
        });
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="bg-blob absolute -top-20 -left-10 size-[40vmax] rounded-full bg-indigo-500/20" />
      <div className="bg-blob absolute top-1/3 -right-10 size-[35vmax] rounded-full bg-fuchsia-500/20" />
      <div className="bg-blob absolute -bottom-20 left-1/4 size-[30vmax] rounded-full bg-sky-500/20" />
    </div>
  );
}


