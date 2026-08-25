import type { Metadata } from "next";
import { Geist, Inter, Instrument_Serif } from "next/font/google";
import { FigmaCaptureLoader } from "@/components/FigmaCaptureLoader";
import { LapseDevPanel } from "@/components/LapseDevPanel";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Surmount — Log in",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${inter.variable} ${instrumentSerif.variable}`}>
      <body>
        {children}
        <FigmaCaptureLoader />
        <LapseDevPanel />
      </body>
    </html>
  );
}
