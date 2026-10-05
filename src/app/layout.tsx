import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VORTEX 3D | Industrial Machine Configurator",
  description:
    "Production-ready 3D web application for visually configuring, assembling, and quoting industrial machinery with real-time CAD snapping, compatibility validation, and automated BOM generation.",
  keywords: [
    "Industrial Configurator",
    "3D Machine Configurator",
    "WebCAD",
    "BOM Generator",
    "Automation Machinery",
    "Conveyor Configurator",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#070b14] text-slate-100 font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
