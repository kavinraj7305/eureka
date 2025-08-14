import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ChatWidget from "./components/ChatWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eureka — RIT x IIT Bombay | Preliminary Round Registration",
  description:
    "Register for Eureka, co-hosted by IIT Bombay and RIT (NEC). Submit your idea and advance to the next round.",
  metadataBase: new URL("https://eureka.local"),
  openGraph: {
    title: "Eureka — RIT x IIT Bombay | Preliminary Round Registration",
    description:
      "Join the preliminary round at RIT (NEC). A small idea is enough—you can get funding.",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eureka — RIT x IIT Bombay",
    description:
      "Register your idea for Eureka's preliminary round hosted at RIT.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased grid-bg`}
      >
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
