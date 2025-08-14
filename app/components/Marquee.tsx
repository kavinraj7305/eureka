"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Marquee({ items }: { items: string[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trackRef.current) return;
    const width = trackRef.current.scrollWidth / 2;
    const tween = gsap.to(trackRef.current, {
      x: -width,
      repeat: -1,
      duration: 16,
      ease: "none",
    });
    return () => tween.kill();
  }, []);

  return (
    <div className="overflow-hidden w-full">
      <div ref={trackRef} className="flex gap-8 whitespace-nowrap will-change-transform">
        {[...items, ...items].map((text, i) => (
          <span key={i} className="text-sm opacity-80">
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}


