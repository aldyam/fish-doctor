"use client";
import { useState, useEffect } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 1. Efek Blur saat Scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. Cek Dark Mode saat pertama kali load
  useEffect(() => {
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // 3. Fungsi Tombol Ganti Tema
  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
      setIsDarkMode(true);
    }
  };

  return (
    <>
      <nav
        className={`fixed z-50 left-1/2 -translate-x-1/2 top-0 transition-all duration-300 ${
          scrolled
            ? "py-3 w-[90%] max-w-6xl top-5 rounded-full bg-white/30 dark:bg-[#0b0f19]/30 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50"
            : "py-5 w-full bg-transparent border-transparent"
        }`}
      >
        <div className="w-full px-6 h-full flex justify-between items-center relative">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition z-10">
            <span className="text-2xl">🐟</span>
            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
              FishDoctor
            </span>
          </Link>

          {/* MENU TENGAH (DESKTOP) */}
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Link href="/" className="text-sm font-medium text-orange-600 cursor-default">
              Diagnosa
            </Link>
            <Link href="/ensiklopedia" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
              Ensiklopedia
            </Link>
            <Link href="/riwayat" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
              Riwayat
            </Link>
          </div>

          {/* AREA KANAN (DARK MODE & MOBILE MENU) */}
          <div className="flex items-center gap-2 z-10">
            
            {/* Tombol Dark Mode */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-white/10 transition text-gray-600 dark:text-gray-400 focus:outline-none"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Tombol Hamburger Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 rounded-full transition"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white dark:bg-[#111827] pt-24 px-6 animate-fade-in">
          <div className="flex flex-col gap-4">
            <Link href="/" className="p-4 bg-orange-50 text-orange-700 rounded-xl font-medium" onClick={() => setMobileMenuOpen(false)}>
              🩺 Diagnosa
            </Link>
            <Link href="/ensiklopedia" className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium" onClick={() => setMobileMenuOpen(false)}>
              📚 Ensiklopedia
            </Link>
             <Link href="/riwayat" className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium" onClick={() => setMobileMenuOpen(false)}>
              🕓 Riwayat
            </Link>
          </div>
        </div>
      )}
    </>
  );
}