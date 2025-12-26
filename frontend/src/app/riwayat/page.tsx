"use client";
import Navbar from "@/components/Navbar";
import { Calendar, Trash2, ChevronRight, Activity, CheckCircle, AlertTriangle, X, ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Riwayat() {
  const [history, setHistory] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    const savedData = localStorage.getItem("fishHistory");
    if (savedData) {
      try {
        setHistory(JSON.parse(savedData));
      } catch (e) {
        console.error("Gagal load history", e);
      }
    }
  }, []);

  const deleteItem = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem("fishHistory", JSON.stringify(updatedHistory));
  };

  const clearAll = () => {
    if (confirm("Yakin ingin menghapus semua riwayat?")) {
      setHistory([]);
      localStorage.removeItem("fishHistory");
    }
  };

  return (
    <main className="min-h-screen bg-[#FBFBFD] dark:bg-[#000000] text-gray-900 dark:text-white pb-20 overflow-x-hidden">
      <Navbar />

      <div className="pt-32 md:pt-36 px-4 md:px-0 max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="flex justify-between items-end mb-6 md:mb-8 px-2"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Riwayat</h1>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">Diagnosa terbaru Anda.</p>
          </div>
          {history.length > 0 && (
            <button onClick={clearAll} className="text-red-500 text-xs md:text-sm font-medium bg-red-50 dark:bg-red-900/10 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors">
              Hapus Semua
            </button>
          )}
        </motion.div>

        {/* CONTAINER LIST */}
        <div className="bg-white dark:bg-[#1c1c1e] rounded-[1.5rem] md:rounded-3xl shadow-sm border border-gray-200/50 dark:border-white/10 overflow-hidden min-h-[100px]">
          <AnimatePresence mode="popLayout">
            {history.length > 0 ? (
              history.map((item, index) => (
                <motion.div
                  key={item.id || index}
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => setSelectedItem(item)}
                  className={`group relative flex items-center gap-3 md:gap-4 p-3 md:p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${index !== history.length - 1 ? "border-b border-gray-100 dark:border-white/5" : ""}`}
                >
                  
                  {/* 1. GAMBAR IKAN (KIRI) */}
                  <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-white/5">
                    {item.image ? (
                        <Image src={item.image} alt="Ikan" fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ImageIcon size={20} />
                        </div>
                    )}
                  </div>
                  
                  {/* 2. TEKS (TENGAH) */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center h-full gap-1">
                    <h3 className="font-bold text-base md:text-lg truncate text-gray-900 dark:text-white">
                      {item.result || "Tidak diketahui"}
                    </h3>
                    <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 font-medium">
                      <Calendar size={14} className="text-orange-500" /> 
                      {item.date || "-"}
                    </div>
                  </div>
                  
                  {/* 3. AKURASI & ACTION (KANAN) */}
                  <div className="flex items-center gap-3 md:gap-4 pl-2">
                    <span className={`text-[10px] md:text-xs font-bold font-mono ${item.status === 'safe' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'} px-2 py-1 md:px-3 md:py-1.5 rounded-lg flex-shrink-0`}>
                      {item.confidence || "0%"}
                    </span>

                    <button onClick={(e) => deleteItem(item.id, e)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all">
                      <Trash2 size={18} />
                    </button>
                    
                    <ChevronRight size={18} className="text-gray-300 hidden md:block" />
                  </div>

                </motion.div>
              ))
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 text-center px-4">
                <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 text-gray-400">
                  <Activity size={32} />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Belum ada riwayat diagnosa.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* MODAL DETAIL - TOMBOL 'TUTUP' SUDAH DIHAPUS 🗑️ */}
        <AnimatePresence>
            {selectedItem && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedItem(null)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
                    <motion.div initial={{ opacity: 0, scale: 0.9, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 50 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] md:w-[90%] max-w-md bg-white dark:bg-[#1c1c1e] p-6 md:p-8 rounded-[2rem] shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto scrollbar-hide">
                        
                        {/* Tombol X (Satu-satunya cara menutup) */}
                        <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 z-10 bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white"><X size={20}/></button>
                        
                        <div className="w-full h-48 md:h-56 relative rounded-2xl overflow-hidden mb-6 bg-gray-100 dark:bg-gray-800">
                             {selectedItem.image ? (
                                <Image src={selectedItem.image} alt="Detail Ikan" fill className="object-cover" />
                             ) : (
                                <div className="flex items-center justify-center h-full text-gray-400"><ImageIcon size={40}/></div>
                             )}
                        </div>

                        <div className="text-center mb-6">
                            <h2 className="text-2xl md:text-3xl font-bold mb-1 text-gray-900 dark:text-white">{selectedItem.result}</h2>
                            <p className="text-gray-500 text-sm">{selectedItem.date}</p>
                        </div>

                        <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-2xl mb-6 border border-gray-100 dark:border-white/5">
                            <div className="flex justify-between mb-2 text-sm">
                                <span className="text-gray-500">Akurasi AI</span>
                                <span className="font-bold text-gray-900 dark:text-white">{selectedItem.confidence}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div className={`h-2 rounded-full ${selectedItem.color}`} style={{ width: selectedItem.confidence }}></div>
                            </div>
                        </div>

                        <p className="text-center text-gray-600 dark:text-gray-300 text-sm px-2 mb-2">"{selectedItem.desc}"</p>
                        
                        {/* AREA TOMBOL BAWAH KOSONG (CLEAN) ✨ */}

                    </motion.div>
                </>
            )}
        </AnimatePresence>
      </div>
    </main>
  );
}