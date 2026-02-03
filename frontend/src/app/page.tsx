"use client";
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import { Camera, ImageIcon, X, Sparkles, Loader2, CheckCircle, AlertTriangle, RefreshCw, Activity, User, Lock, Facebook, Chrome, Smartphone, ChevronLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

// --- KOMPONEN KETIKAN (TYPEWRITER) ---
const TypewriterEffect = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let i = 0;
    setDisplayText("");
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText((prev) => text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        setTimeout(() => setShowCursor(false), 800);
      }
    }, 30);

    return () => clearInterval(timer);
  }, [text]);

  return (
    <span>
      {displayText}
      {showCursor && (
        <span className="border-r-2 border-orange-500 ml-1 animate-pulse"></span>
      )}
    </span>
  );
};

// --- DATABASE PENYAKIT (Sama seperti sebelumnya) ---
const DISEASE_DB: Record<string, { title: string; desc: string; treatment: string }> = {
  "Aeromoniasis": {
    title: "Aeromoniasis (Infeksi Bakteri)",
    desc: "Infeksi bakteri sistemik yang sering terjadi akibat kualitas air buruk.",
    treatment: "Karantina ikan. Berikan pakan dengan antibiotik Oxytetracycline (50mg/kg). Jaga kebersihan air.",
  },
  "Bacterial Gill Disease": {
    title: "Penyakit Insang Bakteri",
    desc: "Pembengkakan pada insang yang menghambat pernapasan ikan.",
    treatment: "Ganti air segera (30-50%). Berikan garam ikan (1-2 ppt) atau rendaman PK (Kalium Permanganat).",
  },
  "Bacterial Red Disease": {
    title: "Penyakit Bercak Merah",
    desc: "Luka borok kemerahan yang bisa menembus hingga daging.",
    treatment: "Antibiotik spektrum luas (Kanamycin). Tingkatkan aerasi oksigen dan hindari penanganan kasar.",
  },
  "EUS": {
    title: "Wabah Luka (EUS)",
    desc: "Infeksi jamur ganas yang menyebabkan luka kawah dalam.",
    treatment: "Naikkan suhu air >30°C. Taburkan kapur (CaO) di kolam. Pisahkan ikan yang luka parah.",
  },
  "Saprolegniasis": {
    title: "Jamur Kapas (Saprolegniasis)",
    desc: "Jamur putih seperti kapas yang tumbuh pada luka terbuka.",
    treatment: "Oleskan Malachite Green pada area jamur. Berikan garam ikan. Jaga suhu air tetap hangat.",
  },
  "Healthy Fish": {
    title: "Ikan Sehat",
    desc: "Kondisi fisik ikan terlihat prima dan sehat. Tidak ditemukan tanda-tanda penyakit berbahaya.",
    treatment: "Pertahankan kualitas air dan pakan. Lakukan monitoring rutin.",
  },
  "Parasitic Diseases": {
    title: "Penyakit Parasit",
    desc: "Infeksi kutu atau bintik putih yang membuat ikan gatal.",
    treatment: "Gunakan Methylene Blue atau Formalin. Karantina ikan agar tidak menular ke yang lain.",
  },
  "White Tail Disease": {
    title: "Penyakit Ekor Putih",
    desc: "Penyakit viral yang menyebabkan ekor memutih dan rusak.",
    treatment: "Belum ada obat efektif (Virus). Isolasi ikan sakit, berikan Vitamin C untuk menaikkan imun.",
  }
};

export default function Home() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"landing" | "auth">("landing");
  const [authType, setAuthType] = useState<"login" | "register">("login");
  
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("fishDoctorUser");
    if (savedUser) setCurrentUser(savedUser);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    const cleanUsername = usernameInput.trim();

    try {
        if (authType === "login") {
            const { data, error } = await supabase.from('users').select('*').eq('username', cleanUsername).single();
            if (error || !data) {
                alert("Nama pengguna tidak ditemukan! Silakan daftar dulu.");
            } else if (data.password !== passwordInput) {
                alert("Kata sandi salah!");
            } else {
                localStorage.setItem("fishDoctorUser", cleanUsername);
                setCurrentUser(cleanUsername);
                setViewMode("landing");
                window.location.reload(); // Refresh biar Navbar baca status login
            }
        } else {
            const { data: existingUser } = await supabase.from('users').select('username').eq('username', cleanUsername).single();
            if (existingUser) {
                alert("Nama ini sudah dipakai. Coba nama lain.");
            } else {
                const { error } = await supabase.from('users').insert([{ username: cleanUsername, password: passwordInput }]);
                if (error) throw error;
                alert("Pendaftaran Berhasil! Silakan masuk.");
                setAuthType("login");
            }
        }
    } catch (err: any) {
        alert("Error: " + err.message);
    } finally {
        setAuthLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const file = files[0];
      setFile(file);
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
      setResult(null);
      const reader = new FileReader();
      reader.onloadend = () => setImageBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const resetSelection = () => {
    setSelectedImage(null);
    setImageBase64(null);
    setFile(null);
    setResult(null);
  };

  const runAnalysis = async () => {
    if (!file || !currentUser) return;
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal memproses gambar");

      const diseaseInfo = DISEASE_DB[data.result] || {
        title: data.result,
        desc: "Penyakit belum terdaftar.",
        treatment: "Hubungi ahli.",
      };

      setResult({
        result: diseaseInfo.title,
        confidence: data.confidence,
        status: data.status,
        healthy: data.healthy,
        desc: diseaseInfo.desc,
        treatment: diseaseInfo.treatment,
      });

      await supabase.from('history').insert([{ 
        user_name: currentUser, 
        result: diseaseInfo.title,
        confidence: data.confidence,
        healthy: data.healthy,
        image_base64: imageBase64,
        description: diseaseInfo.desc,
        treatment: diseaseInfo.treatment
      }]);

    } catch (error) {
      console.error("Error:", error);
      alert("Gagal terhubung ke AI!");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- UI JIKA BELUM LOGIN ---
  if (!currentUser) {
    return (
      <main className="min-h-screen bg-[#F5F5F7] dark:bg-[#050505] text-gray-900 dark:text-white flex flex-col relative overflow-hidden font-sans transition-colors duration-500">
        <div className="absolute top-0 w-full z-20">
          <Navbar />
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/10 dark:bg-orange-500/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 z-10 pt-40 pb-48">
          <AnimatePresence mode="wait">
            
            {/* LANDING PAGE */}
            {viewMode === "landing" && (
              <motion.div 
                key="landing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center"
              >
                <div className="w-24 h-24 mb-8 bg-gradient-to-tr from-orange-500 to-amber-400 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(249,115,22,0.4)]">
                    <Activity size={48} className="text-white" />
                </div>

                <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
                  Welcome to Fish Doctor!
                </h1>
                
                <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl max-w-xl leading-relaxed mb-10 h-16 md:h-auto flex items-center justify-center">
                  <TypewriterEffect text="Temukan status kesehatan ikan Anda dengan wawasan AI, analisa penyakit secara instan." />
                </p>

                <button 
                  onClick={() => setViewMode("auth")}
                  className="px-12 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold text-lg shadow-xl shadow-orange-500/20 transition-all hover:scale-105 active:scale-95 mb-8"
                >
                  Login
                </button>
              </motion.div>
            )}

            {/* AUTH FORM */}
            {viewMode === "auth" && (
              <motion.div 
                key="auth"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="w-full max-w-md bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 p-8 rounded-3xl shadow-2xl relative"
              >
                <button 
                    onClick={() => setViewMode("landing")}
                    className="absolute top-6 left-6 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>

                <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-500">
                        <User size={24} />
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-1">{authType === 'login' ? 'Masuk Akun' : 'Daftar Baru'}</h2>
                <p className="text-sm text-gray-500 mb-6">
                   {authType === 'login' ? 'Masukkan Nama & Sandi Anda.' : 'Buat nama unik & sandi rahasia.'}
                </p>

                <form onSubmit={handleAuth} className="flex flex-col gap-4 text-left">
                    <div className="relative group">
                        <User className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder="Nama Pengguna (Contoh: Budi)" 
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-orange-500 outline-none transition-all font-medium"
                            value={usernameInput}
                            onChange={(e) => setUsernameInput(e.target.value)}
                            required
                        />
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                        <input 
                            type="password" 
                            placeholder="Kata Sandi" 
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-orange-500 outline-none transition-all font-medium"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={authLoading}
                        className="mt-2 w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        {authLoading ? <Loader2 className="animate-spin" /> : (authType === 'login' ? 'Masuk' : 'Daftar')}
                    </button>
                </form>

                <p className="mt-8 text-xs text-center text-gray-500">
                    {authType === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
                    <button 
                        onClick={() => setAuthType(authType === 'login' ? 'register' : 'login')} 
                        className="text-orange-500 font-bold hover:underline"
                    >
                        {authType === 'login' ? 'Daftar di sini' : 'Login di sini'}
                    </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* FOOTER */}
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute bottom-6 w-full text-center text-xs text-gray-500 dark:text-gray-600 z-30 px-4 leading-relaxed"
        >
            FishDoctor © 2026 • Powered byTensorFlow & Next.js <br />
            Created by <Link href="https://aldyam-portfolio.vercel.app" target="_blank" className="font-bold text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:underline transition-colors">aldy</Link>
        </motion.div>

      </main>
    );
  }

  // --- UI SUDAH LOGIN ---
  return (
    <main className="min-h-screen bg-[#F5F5F7] dark:bg-[#000000] text-gray-900 dark:text-white pb-20 overflow-x-hidden transition-colors duration-500">
      <Navbar />
      <div className="pt-32 md:pt-36 px-4 flex flex-col items-center max-w-5xl mx-auto">
        
        {/* Tombol Logout LAMA SUDAH DIHAPUS DARI SINI ✅ */}

        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 text-xs font-semibold mb-6 text-gray-600 dark:text-gray-300">
            <Sparkles size={12} className="text-orange-500" /> AI-Powered Diagnosis
          </div>
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-600 dark:from-white dark:to-gray-500 leading-tight">
            Machine Learning <br /> <span className="text-gray-900 dark:text-white">Fish Health</span>
          </h1>
          <p className="text-base md:text-xl text-gray-500 dark:text-gray-400 max-w-xs md:max-w-xl mx-auto font-medium leading-relaxed">Deteksi penyakit ikan air tawar dengan teknologi AI</p>
        </div>

        <div className="w-full max-w-2xl bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-2xl shadow-2xl rounded-[2rem] md:rounded-[2.5rem] p-2 border border-white/20">
          <div className="p-5 md:p-10">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center text-center">
                  <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden mb-6 border border-gray-100 dark:border-white/5 shadow-sm">
                    <Image src={selectedImage!} alt="Preview" fill className="object-cover" />
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20">Akurasi {result.confidence}</div>
                  </div>
                  <div className="mb-4 px-5 py-2.5 rounded-full inline-flex items-center gap-2 bg-gray-100 dark:bg-white/10">
                    {result.healthy ? <CheckCircle size={20} className="text-green-500 fill-green-500/10" /> : <AlertTriangle size={20} className="text-red-500 fill-red-500/10" />}
                    <span className="font-bold text-base text-gray-900 dark:text-white">{result.result}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6 px-2">{result.desc}</p>
                  {!result.healthy && (
                    <div className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-5 mb-6 text-left">
                      <h3 className="text-gray-900 dark:text-white font-bold text-sm mb-2">Rekomendasi Pengobatan</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{result.treatment}</p>
                    </div>
                  )}
                  <button onClick={resetSelection} className="w-full py-4 rounded-2xl font-bold text-base transition-all bg-gray-900 dark:bg-white text-white dark:text-black hover:opacity-90 flex items-center justify-center gap-2"><RefreshCw size={18} /> Diagnosa Ikan Lain</button>
                </motion.div>
              ) : (
                <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                   {selectedImage ? (
                    <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-gray-100 dark:bg-black mb-6 border border-gray-200 dark:border-white/10">
                      <Image src={selectedImage} alt="Preview" fill className="object-cover" />
                      <button onClick={resetSelection} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white z-10 active:scale-90 transition-transform"><X size={20} /></button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 md:gap-4 h-52 md:h-64 mb-2">
                      <motion.div whileHover={{ scale: 1.02, backgroundColor: "rgba(0,0,0,0.02)" }} whileTap={{ scale: 0.95 }} onClick={() => galleryInputRef.current?.click()} className="cursor-pointer rounded-3xl bg-gray-50 dark:bg-[#2c2c2e] border-dashed border border-gray-300 hover:border-blue-500 flex flex-col items-center justify-center gap-3 md:gap-4 transition-colors">
                        <ImageIcon className="w-8 h-8 text-gray-400" /> <span className="text-sm font-semibold text-gray-500">Galeri</span>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02, backgroundColor: "rgba(0,0,0,0.02)" }} whileTap={{ scale: 0.95 }} onClick={() => cameraInputRef.current?.click()} className="cursor-pointer rounded-3xl bg-gray-50 dark:bg-[#2c2c2e] border-dashed border border-gray-300 hover:border-orange-500 flex flex-col items-center justify-center gap-3 md:gap-4 transition-colors">
                        <Camera className="w-8 h-8 text-gray-400" /> <span className="text-sm font-semibold text-gray-500">Kamera</span>
                      </motion.div>
                    </div>
                  )}
                  <input type="file" ref={galleryInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />
                  <input type="file" ref={cameraInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />
                  <motion.button onClick={runAnalysis} disabled={!file || isAnalyzing} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className={`w-full mt-6 py-4 rounded-2xl font-bold text-lg transition-all flex justify-center items-center gap-2 ${file ? "bg-gray-900 dark:bg-white text-white dark:text-black shadow-xl" : "bg-gray-100 dark:bg-[#2c2c2e] text-gray-400 cursor-not-allowed"}`}>
                    {isAnalyzing ? <><Loader2 className="animate-spin" /> Proses...</> : "Mulai Analisa"}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}