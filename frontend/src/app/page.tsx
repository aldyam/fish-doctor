"use client";
import { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import { Camera, ImageIcon, X, Sparkles, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// --- 1. KAMUS TERJEMAHAN (Mapping Nama AI -> Bahasa Indonesia) ---
const DISEASE_TRANSLATIONS: Record<string, string> = {
  "Bacterial Red Disease": "Penyakit Bercak Merah", // Pastikan Key ini ada!
  "Aeromoniasis": "Aeromoniasis (Infeksi Bakteri)",
  "Bacterial Gill Disease": "Penyakit Insang Bakteri",
  "EUS": "Wabah Luka (EUS)",
  "Saprolegniasis": "Jamur Kapas (Saprolegniasis)",
  "Healthy Fish": "Ikan Sehat",
  "Parasitic Diseases": "Penyakit Parasit",
  "White Tail Disease": "Penyakit Ekor Putih"
};

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const file = files[0];
      setFile(file);

      // Preview
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
      setResult(null);

      // Base64 untuk Riwayat
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
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
    if (!file) return;
    setIsAnalyzing(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal memproses gambar");
      }

      const dateWIB = new Date().toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false
      }).replace(".", ":");

      // --- 2. AMBIL NAMA INDONESIA DARI KAMUS ---
      // Kalau nama dari AI ada di kamus, pakai bahasa Indonesia. Kalau tidak, pakai aslinya.
      const indoName = DISEASE_TRANSLATIONS[data.result] || data.result;

      // --- 3. DESKRIPSI LEBIH JELAS ---
      let description = "";
      if (data.healthy) {
        description = "Kondisi fisik ikan terlihat prima dan sehat. Tidak ditemukan tanda-tanda penyakit berbahaya.";
      } else {
        description = `Terdeteksi gejala ${indoName}. Segera pisahkan ikan dari kolam utama dan cek menu Ensiklopedia untuk penanganan obat.`;
      }

      const diagnosisResult = {
        id: Date.now(),
        date: dateWIB + " WIB",
        image: imageBase64, 
        result: indoName,     // <--- Sekarang pakai Nama Indonesia!
        confidence: data.confidence,
        status: data.status,
        color: data.healthy ? "bg-green-500" : "bg-red-500",
        desc: description,
        title: indoName,      // <--- Judul Modal juga pakai Nama Indonesia
        healthy: data.healthy
      };

      setResult(diagnosisResult);

      const existingHistory = JSON.parse(localStorage.getItem("fishHistory") || "[]");
      const newHistory = [diagnosisResult, ...existingHistory].slice(0, 10);
      localStorage.setItem("fishHistory", JSON.stringify(newHistory));

    } catch (error) {
      console.error("Error:", error);
      alert("Gagal terhubung ke AI! Pastikan terminal Python (Backend) sudah jalan.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FBFBFD] dark:bg-[#000000] text-gray-900 dark:text-white pb-20 selection:bg-orange-500/30 overflow-x-hidden">
      <Navbar />

      <div className="pt-32 md:pt-36 px-4 flex flex-col items-center max-w-5xl mx-auto">
        
        <motion.div initial={{ opacity: 0, y: 30, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.8 }} className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 text-xs font-semibold mb-6 text-gray-600 dark:text-gray-300">
            <Sparkles size={12} className="text-orange-500" /> AI-Powered Diagnosis
          </div>
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-600 dark:from-white dark:to-gray-500 leading-tight">
            Machine Learning <br /> <span className="text-gray-900 dark:text-white">Fish Health</span>
          </h1>
          <p className="text-base md:text-xl text-gray-500 dark:text-gray-400 max-w-xs md:max-w-xl mx-auto font-medium leading-relaxed">
            Deteksi penyakit ikan dengan menggunakan teknologi AI
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="w-full max-w-2xl bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-2xl shadow-2xl rounded-[2rem] md:rounded-[2.5rem] p-2 border border-white/20">
          <div className="p-5 md:p-10">
            <AnimatePresence mode="wait">
              {selectedImage ? (
                <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-gray-100 dark:bg-black">
                  <Image src={selectedImage} alt="Preview" fill className="object-cover" />
                  <button onClick={resetSelection} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white z-10 active:scale-90 transition-transform"><X size={20} /></button>
                </motion.div>
              ) : (
                <motion.div key="buttons" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 gap-3 md:gap-4 h-52 md:h-64">
                  <motion.div whileTap={{ scale: 0.95 }} onClick={() => galleryInputRef.current?.click()} className="cursor-pointer rounded-3xl bg-gray-50 dark:bg-[#2c2c2e] border-dashed border border-gray-300 hover:border-blue-500 flex flex-col items-center justify-center gap-3 md:gap-4 transition-colors">
                    <ImageIcon className="w-8 h-8 text-gray-400" /> <span className="text-sm font-semibold text-gray-500">Galeri</span>
                  </motion.div>
                  <motion.div whileTap={{ scale: 0.95 }} onClick={() => cameraInputRef.current?.click()} className="cursor-pointer rounded-3xl bg-gray-50 dark:bg-[#2c2c2e] border-dashed border border-gray-300 hover:border-orange-500 flex flex-col items-center justify-center gap-3 md:gap-4 transition-colors">
                    <Camera className="w-8 h-8 text-gray-400" /> <span className="text-sm font-semibold text-gray-500">Kamera</span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <input type="file" ref={galleryInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />
            <input type="file" ref={cameraInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />

            <motion.button
              onClick={runAnalysis}
              disabled={!file || isAnalyzing}
              whileTap={{ scale: 0.98 }}
              className={`w-full mt-6 py-4 rounded-2xl font-bold text-lg transition-all flex justify-center items-center gap-2 ${file ? "bg-gray-900 dark:bg-white text-white dark:text-black shadow-xl" : "bg-gray-100 dark:bg-[#2c2c2e] text-gray-400 cursor-not-allowed"}`}
            >
              {isAnalyzing ? <><Loader2 className="animate-spin" /> Proses...</> : "Mulai Analisa"}
            </motion.button>
          </div>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-12 text-sm text-gray-400 dark:text-gray-600 font-medium">
          Created by <Link href="https://desty.page/aldyam" target="_blank" className="text-orange-500 hover:text-orange-600 hover:underline transition-colors">Aldy</Link>
        </motion.p>
      </div>

      <AnimatePresence>
        {result && (
          <>
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setResult(null)} className="fixed inset-0 bg-black/60 backdrop-blur-md z-50" />
             <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] md:w-full max-w-sm bg-white dark:bg-[#1c1c1e] p-6 md:p-8 rounded-[2rem] shadow-2xl text-center border border-white/10">
                <div className={`w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full flex items-center justify-center mb-4 md:mb-6 ${result.healthy ? "bg-green-100 text-green-500" : "bg-red-100 text-red-600"}`}>
                  {result.healthy ? <CheckCircle size={40} className="md:w-12 md:h-12" /> : <AlertTriangle size={40} className="md:w-12 md:h-12" />}
                </div>
                
                {/* 👇 HASILNYA SEKARANG SUDAH BAHASA INDONESIA */}
                <h2 className="text-2xl md:text-3xl font-bold mb-2">{result.title}</h2>
                <p className="text-gray-500 text-sm md:text-base mb-6">Akurasi AI: <span className="font-bold text-gray-900 dark:text-white">{result.confidence}</span></p>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setResult(null)} className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold">Selesai</motion.button>
             </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}