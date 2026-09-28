import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  variable: "--font-inter",
  display: "swap",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fish Doctor",
  description: "Sistem deteksi penyakit ikan air tawar berbasis AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* TAMBAHKAN 'font-sans' DISINI 👇 */}
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased font-sans bg-background text-foreground`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}