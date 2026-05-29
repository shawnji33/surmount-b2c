import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import { FigmaCaptureLoader } from "@/components/FigmaCaptureLoader";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Surmount — Log in",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${inter.variable}`}>
      <body>
        {children}
        <FigmaCaptureLoader />
      </body>
    </html>
  );
}
