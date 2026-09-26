"use client";
import { useState, useEffect, useLayoutEffect, useRef, useSyncExternalStore } from "react";
import { Menu as MenuIcon, Moon, Sun, X, ChevronRight, Home, BookOpen } from "lucide-react";
import Link from "next/link";
import { pointerGlow } from "@/utils/pointerGlow";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, animate, useMotionValue } from "framer-motion";

function subscribeTheme(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  window.addEventListener("storage", onChange);
  window.addEventListener("fishdoctor-theme-change", onChange);
  media.addEventListener("change", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("fishdoctor-theme-change", onChange);
    media.removeEventListener("change", onChange);
  };
}

function getThemeSnapshot() {
  return localStorage.theme === "dark" ||
    (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
}

function getServerThemeSnapshot() {
  return false;
}

type IndicatorPosition = { x: number; y: number; width: number; height: number };
const INDICATOR_SPRING = { type: "spring" as const, stiffness: 380, damping: 32, mass: 0.8 };

function useNavigationIndicator(targetPath: string) {
  const navigationRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const initialized = useRef(false);
  const stopAnimation = useRef<(() => void) | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const width = useMotionValue(0);
  const height = useMotionValue(0);

  useLayoutEffect(() => {
    const navigation = navigationRef.current;
    const indicator = indicatorRef.current;
    if (!navigation || !indicator) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const snap = (position: IndicatorPosition) => {
      x.jump(position.x);
      y.jump(position.y);
      width.jump(position.width);
      height.jump(position.height);
      // Paint the first measurement before the browser can show a zero-size pill.
      indicator.style.transform = `translateX(${position.x}px) translateY(${position.y}px)`;
      indicator.style.width = `${position.width}px`;
      indicator.style.height = `${position.height}px`;
    };
    const measure = () => {
      const target = Array.from(navigation.querySelectorAll("a"))
        .find((link) => link.getAttribute("href") === targetPath);
      const track = navigation.getBoundingClientRect();
      if (!target || !track.width) {
        navigation.removeAttribute("data-indicator-ready");
        return;
      }

      const item = target.getBoundingClientRect();
      const position = {
        x: item.left - track.left,
        y: item.top - track.top,
        width: item.width,
        height: item.height,
      };
      stopAnimation.current?.();
      if (!initialized.current) {
        snap(position);
        initialized.current = true;
      }
      if (reducedMotion.matches) {
        snap(position);
      } else {
        const animations = [
          animate(x, position.x, INDICATOR_SPRING),
          animate(y, position.y, INDICATOR_SPRING),
          animate(width, position.width, INDICATOR_SPRING),
          animate(height, position.height, INDICATOR_SPRING),
        ];
        stopAnimation.current = () => animations.forEach((animation) => animation.stop());
      }
      navigation.dataset.indicatorReady = "true";
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(navigation);
    navigation.querySelectorAll("a").forEach((link) => observer.observe(link));
    reducedMotion.addEventListener("change", measure);
    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", measure);
      stopAnimation.current?.();
    };
  }, [targetPath, x, y, width, height]);

  return { navigationRef, indicatorRef, indicatorStyle: { x, y, width, height } };
}

function subscribeScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

function getScrollSnapshot() {
  return window.scrollY > 24;
}

function getServerScrollSnapshot() {
  return false;
}

function NavigationLabel({ text }: { text: string }) {
  return (
    <span className="fd-nav-label">
      {/* Preserve the existing medium-width slot across active weight changes. */}
      <span className="fd-nav-label-size" aria-hidden="true">{text}</span>
      <span className="fd-nav-label-text">{text}</span>
    </span>
  );
}

export default function Navbar() {
  const isScrolled = useSyncExternalStore(subscribeScroll, getScrollSnapshot, getServerScrollSnapshot);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDarkMode = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot);

  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { navigationRef, indicatorRef, indicatorStyle } = useNavigationIndicator(hoveredItem ?? pathname);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => {
    localStorage.theme = isDarkMode ? "light" : "dark";
    window.dispatchEvent(new Event("fishdoctor-theme-change"));
  };

  const isActive = (path: string) => pathname === path;

  const menuItems = [
    { name: "Diagnosa", href: "/", icon: <Home size={22} /> },
    { name: "Ensiklopedia", href: "/ensiklopedia", icon: <BookOpen size={22} /> },
  ];

  if (!menuItems.some((item) => isActive(item.href))) return null;

  return (
    <>
      {/* --- NAVBAR UTAMA --- */}
      <nav
        className={`fd-navbar fixed z-50 left-1/2 -translate-x-1/2 ${isScrolled ? "fd-navbar-compact" : ""}`}
      >
        <div className="w-full h-full flex justify-between items-center relative">

          {/* --- BAGIAN KIRI --- */}
          <div className="flex items-center gap-2 z-10">
            {/* MOBILE: Teks "Menu" */}
            <span className="md:hidden font-bold text-lg tracking-tight text-foreground pl-1">
              Menu
            </span>

            {/* DESKTOP: Logo FishDoctor */}
            <Link
              href="/"
              className="hidden md:flex items-center justify-center"
            >
              <span className="flex h-10 w-10 items-center justify-center">
                <span className="block text-[31px] leading-none -translate-y-[9px]">
                  𓆟
                </span>
              </span>
            </Link>
          </div>

          {/* --- MENU TENGAH (DESKTOP - CLEAN VERSION) --- */}
          {/* HAPUS BACKGROUND CONTAINER, KEMBALIKAN GAP */}
          <div ref={navigationRef} onPointerLeave={() => setHoveredItem(null)} className="fd-nav-track hidden md:flex items-center gap-8 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <motion.span
              ref={indicatorRef}
              aria-hidden="true"
              className="fd-nav-indicator"
              initial={false}
              style={indicatorStyle}
            />
            {menuItems.map((item) => (
              <Link 
                key={item.href}
                {...pointerGlow}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                onPointerEnter={(event) => {
                  if (event.pointerType !== "touch") setHoveredItem(item.href);
                }}
                className={`text-sm font-medium fd-nav-item fd-pointer-glow ${
                  isActive(item.href) 
                    ? "fd-nav-item-active"
                    : ""
                }`}
              >
                <NavigationLabel text={item.name} />
              </Link>
            ))}
          </div>

          {/* --- BAGIAN KANAN --- */}
          <div className="flex items-center gap-2 z-10">
            {/* Desktop buttons */}
            <button aria-label={isDarkMode ? "Aktifkan mode terang" : "Aktifkan mode gelap"} onClick={toggleTheme} className="hidden md:block p-2.5 rounded-full fd-theme-toggle">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* TOMBOL HAMBURGER (Mobile) */}
            <button
              aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-full fd-theme-toggle`}
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
              className="fixed inset-0 z-40 fd-overlay"
            />

            <motion.div
              initial={{ y: "-110%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-110%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 150, damping: 25, mass: 0.8 }}
              className="fixed top-0 left-0 right-0 z-40 pt-28 pb-10 px-6 
                         fd-surface fd-elevated
                         rounded-b-[3rem] border-b"
            >
              <div className="flex flex-col gap-3">
                {/* Menu Navigasi */}
                {menuItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                  <Link 
                    key={item.href}
                    {...pointerGlow}
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`group flex items-center gap-4 p-4 rounded-[2rem] fd-mobile-nav fd-pointer-glow border ${
                      active
                        ? "fd-mobile-nav-active"
                        : ""
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                       active 
                       ? "fd-icon fd-icon-active"
                       : "fd-icon"
                    }`}>
                        {item.icon}
                    </div>
                    <div className="flex-1">
                        <NavigationLabel text={item.name} />
                    </div>
                    {active && <ChevronRight size={20} className="text-inherit" />}
                  </Link>
                )})}

                <div className="h-px w-full fd-divider my-2"></div>

                {/* Tombol Tema */}
                <button 
                    onClick={toggleTheme}
                    className="group flex items-center gap-4 p-4 rounded-[2rem] fd-theme-toggle"
                >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center fd-icon">
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </div>
                    <div className="flex-1 text-left">
                        <span className="block text-lg font-bold tracking-tight text-foreground">
                            Mode {isDarkMode ? "Terang" : "Gelap"}
                        </span>
                    </div>
                </button>

              </div>

              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 fd-divider rounded-full mb-3"></div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}