"use client";

import { useRef } from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asLinkHref?: string;
};

export default function MagneticButton({ asLinkHref, children, className = "", ...rest }: Props) {
  const ref = useRef<HTMLButtonElement>(null);

  const onMouseMove = (e: React.MouseEvent) => {
    // Skip magnetic hover on touch devices
    if ("ontouchstart" in window) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    const moveX = (relX - rect.width / 2) * 0.1;
    const moveY = (relY - rect.height / 2) * 0.2;
    el.style.transform = `translate(${moveX}px, ${moveY}px)`;
  };

  const onMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate(0, 0)";
  };

  const base = `relative inline-flex items-center justify-center rounded-lg px-6 py-3 transition-colors ${className}`;

  if (asLinkHref) {
    return (
      <a
        href={asLinkHref}
        onMouseMove={onMouseMove as unknown as React.MouseEventHandler<HTMLAnchorElement>}
        onMouseLeave={onMouseLeave as unknown as React.MouseEventHandler<HTMLAnchorElement>}
        className={base}
      >
        {children}
      </a>
    );
  }

  return (
    <button ref={ref} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} className={base} {...rest}>
      {children}
    </button>
  );
}


