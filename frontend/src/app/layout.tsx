import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FishDoctor AI",
  description: "Deteksi Penyakit Ikan dengan AI",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans bg-white dark:bg-[#0b0f19] text-gray-900 dark:text-white`}
      >
        {children}
      </body>
    </html>
  );
}