import Image from "next/image";

export default function LogoStrip() {
  const logos = [
    { src: "/rit_e-cell_logo-removebg-preview.png", alt: "RIT E-Cell" },
    { src: "/next.svg", alt: "Next.js" },
    { src: "/vercel.svg", alt: "Vercel" },
  ];
  return (
    <div className="mt-10 flex items-center justify-center gap-10 opacity-80">
      {logos.map((l) => (
        <Image key={l.src} src={l.src} alt={l.alt} width={120} height={48} className="dark:invert-0" />
      ))}
    </div>
  );
}


