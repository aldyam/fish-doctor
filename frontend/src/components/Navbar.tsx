"use client";
import { useState, useEffect } from "react";
import { Menu as MenuIcon, Moon, Sun, X, ChevronRight, Home, BookOpen, Clock, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    
    const checkLogin = () => {
      if (localStorage.getItem("fishDoctorUser")) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    };
    
    checkLogin();
    window.addEventListener('storage', checkLogin);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener('storage', checkLogin);
    };
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

  const handleLogout = () => {
    if (confirm("Yakin ingin keluar?")) {
      localStorage.removeItem("fishDoctorUser");
      setIsLoggedIn(false);
      setMobileMenuOpen(false);
      window.location.href = "/";
    }
  };

  const isActive = (path: string) => pathname === path;

  const menuItems = [
    { name: "Diagnosa", href: "/", icon: <Home size={22} /> },
    { name: "Ensiklopedia", href: "/ensiklopedia", icon: <BookOpen size={22} /> },
    { name: "Riwayat", href: "/riwayat", icon: <Clock size={22} /> },
  ];

  return (
    <>
      {/* --- NAVBAR UTAMA --- */}
      <nav
        className={`fixed z-50 left-1/2 -translate-x-1/2 transition-all duration-500 ease-in-out ${
          scrolled
            ? "top-4 w-[92%] md:w-[85%] max-w-5xl py-3 px-4 rounded-full bg-white/70 dark:bg-black/70 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-lg shadow-black/5"
            : "top-0 w-full max-w-full py-6 px-6 bg-transparent border-transparent backdrop-blur-none"
        }`}
      >
        <div className="w-full h-full flex justify-between items-center relative">
          
          {/* --- BAGIAN KIRI --- */}
          <div className="flex items-center gap-2 z-10">
            {/* MOBILE: Teks "Menu" */}
            <span className="md:hidden font-bold text-lg tracking-tight text-gray-900 dark:text-white pl-1">
              Menu
            </span>

            {/* DESKTOP: Logo FishDoctor */}
            <Link href="/" className="hidden md:flex items-center gap-2 hover:opacity-80 transition">
              <span className="text-2xl drop-shadow-sm">🐟</span>
              <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
                FishDoctor
              </span>
            </Link>
          </div>

          {/* --- MENU TENGAH (DESKTOP - CLEAN VERSION) --- */}
          {/* HAPUS BACKGROUND CONTAINER, KEMBALIKAN GAP */}
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {menuItems.map((item) => (
              <Link 
                key={item.name}
                href={item.href} 
                className={`text-sm font-medium transition-all duration-300 ${
                  isActive(item.href) 
                    ? "text-orange-500 font-bold" 
                    : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* --- BAGIAN KANAN --- */}
          <div className="flex items-center gap-2 z-10">
            {/* Desktop buttons */}
            <button onClick={toggleTheme} className="hidden md:block p-2.5 rounded-full text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 transition-all">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {isLoggedIn && (
              <button onClick={handleLogout} className="hidden md:block p-2.5 rounded-full text-red-500 hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-all">
                <LogOut size={20} />
              </button>
            )}

            {/* TOMBOL HAMBURGER (Mobile) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-full transition-all active:scale-90 text-gray-900 dark:text-white hover:opacity-70`}
            >
              {mobileMenuOpen ? <X size={26} /> : <MenuIcon size={26} />}
            </button>
          </div>
        </div>
      </nav>

      {/* --- MENU MOBILE (DRAWER MODERN) --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ y: "-110%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-110%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 150, damping: 25, mass: 0.8 }}
              className="fixed top-0 left-0 right-0 z-40 pt-28 pb-10 px-6 
                         bg-white/80 dark:bg-[#121212]/80 backdrop-blur-2xl 
                         rounded-b-[3rem] border-b border-white/40 dark:border-white/10
                         shadow-2xl"
            >
              <div className="flex flex-col gap-3">
                {/* Menu Navigasi */}
                {menuItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                  <Link 
                    key={item.name}
                    href={item.href} 
                    onClick={() => setMobileMenuOpen(false)}
                    className={`group flex items-center gap-4 p-4 rounded-[2rem] transition-all duration-300 active:scale-[0.97] border ${
                      active
                        ? "bg-white dark:bg-white/10 border-gray-200 dark:border-white/10 shadow-sm"
                        : "bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-white/5"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                       active 
                       ? "bg-orange-500 text-white shadow-orange-500/30" 
                       : "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400"
                    }`}>
                        {item.icon}
                    </div>
                    <div className="flex-1">
                        <span className={`block text-lg font-bold tracking-tight ${active ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-300"}`}>
                          {item.name}
                        </span>
                    </div>
                    {active && <ChevronRight size={20} className="text-orange-500" />}
                  </Link>
                )})}

                <div className="h-px w-full bg-gray-200 dark:bg-white/10 my-2"></div>

                {/* Tombol Tema */}
                <button 
                    onClick={toggleTheme}
                    className="group flex items-center gap-4 p-4 rounded-[2rem] transition-all duration-300 active:scale-[0.97] hover:bg-gray-100 dark:hover:bg-white/5"
                >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300">
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </div>
                    <div className="flex-1 text-left">
                        <span className="block text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                            Mode {isDarkMode ? "Terang" : "Gelap"}
                        </span>
                    </div>
                </button>

                {/* Tombol Keluar */}
                {isLoggedIn && (
                  <button 
                    onClick={handleLogout}
                    className="group flex items-center gap-4 p-4 rounded-[2rem] transition-all duration-300 active:scale-[0.97] hover:bg-red-50 dark:hover:bg-red-900/10 mt-1"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100 dark:bg-red-900/20 text-red-500">
                        <LogOut size={20} />
                    </div>
                    <div className="flex-1 text-left">
                        <span className="block text-lg font-bold tracking-tight text-red-500">Keluar Akun</span>
                    </div>
                  </button>
                )}
              </div>
              
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-300 dark:bg-white/20 rounded-full mb-3"></div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}