"use client";
import { useState, useEffect } from "react";
import { Menu, Moon, Sun, X, ChevronRight, Home, BookOpen, Clock } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const isActive = (path: string) => pathname === path;

  const menuItems = [
    { name: "Diagnosa", href: "/", icon: <Home size={20} /> },
    { name: "Ensiklopedia", href: "/ensiklopedia", icon: <BookOpen size={20} /> },
    { name: "Riwayat", href: "/riwayat", icon: <Clock size={20} /> },
  ];

  return (
    <>
      <nav
        // KONTAINER UTAMA: TETAP KACA (GLASS) + BORDER TIPIS
        className={`fixed z-50 left-1/2 -translate-x-1/2 transition-all duration-500 ease-in-out ${
          scrolled
            ? "top-6 w-[90%] md:w-[85%] max-w-5xl py-4 rounded-full bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-lg"
            : "top-0 w-full max-w-full py-6 bg-transparent border-transparent backdrop-blur-none"
        }`}
      >
        <div className="w-full px-6 md:px-8 h-full flex justify-between items-center relative">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition z-10">
            <span className="text-2xl drop-shadow-md">🐟</span>
            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
              FishDoctor
            </span>
          </Link>

          {/* MENU TENGAH (DESKTOP) - HANYA TULISAN, TANPA BACKGROUND */}
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {menuItems.map((item) => (
              <Link 
                key={item.name}
                href={item.href} 
                className={`text-sm transition-all duration-300 ${
                  isActive(item.href) 
                    ? "font-bold text-orange-600 dark:text-orange-400" // Aktif: Warna Orange, Tebal
                    : "font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white" // Biasa: Abu-abu
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* AREA KANAN - IKON SAJA, TANPA LINGKARAN BACKGROUND */}
          <div className="flex items-center gap-4 z-10">
            <button
              onClick={toggleTheme}
              className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors focus:outline-none"
            >
              {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-900 dark:text-white hover:opacity-70 transition active:scale-90"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU (Top Sheet) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ type: "spring", stiffness: 180, damping: 25 }}
              className="fixed top-0 left-0 right-0 z-40 bg-[#FBFBFD] dark:bg-[#1c1c1e] rounded-b-[2.5rem] shadow-2xl pt-32 pb-8 px-6 border-b border-gray-200 dark:border-white/10"
            >
              <div className="flex flex-col gap-3">
                {menuItems.map((item) => (
                  <Link 
                    key={item.name}
                    href={item.href} 
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-[0.98] ${
                      isActive(item.href)
                        ? "bg-white dark:bg-white/10 shadow-sm border border-gray-100 dark:border-transparent"
                        : "hover:bg-gray-100 dark:hover:bg-white/5"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                       isActive(item.href) 
                       ? "bg-gray-900 text-white dark:bg-white dark:text-black" 
                       : "bg-gray-100 dark:bg-white/5 text-gray-500"
                    }`}>
                        {item.icon}
                    </div>
                    <div className="flex-1">
                        <span className={`block text-base font-semibold ${isActive(item.href) ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>
                          {item.name}
                        </span>
                    </div>
                    {isActive(item.href) && <ChevronRight size={18} className="text-gray-400" />}
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}