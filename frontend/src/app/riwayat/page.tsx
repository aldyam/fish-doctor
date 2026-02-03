"use client";
import Navbar from "@/components/Navbar";
import { Calendar, Trash2, ChevronRight, Activity, X, ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

export default function Riwayat() {
  const [history, setHistory] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("fishDoctorUser");
    setCurrentUser(savedUser);

    if (savedUser) {
      fetchHistory(savedUser);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchHistory = async (user: string) => {
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from('history')
      .select('*')
      .eq('user_name', user)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Gagal ambil data:", error);
    } else {
      setHistory(data || []);
    }
    
    setIsLoading(false);
  };

  const deleteItem = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (!confirm("Hapus riwayat ini?")) return;
    
    const { error } = await supabase.from('history').delete().eq('id', id);

    if (!error) {
      setHistory(history.filter(item => item.id !== id));
    } else {
      alert("Gagal menghapus data. Cek koneksi.");
    }
  };

  // 4. FORMAT TANGGAL (FIX WIB)
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    
    // Ini akan otomatis mendeteksi zona waktu HP/Laptop pengguna (WIB)
    const date = new Date(dateString);
    
    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric", 
        month: "long", // Pakai nama bulan lengkap (Februari)
        year: "numeric", 
        hour: "2-digit", 
        minute: "2-digit",
        hour12: false // Format 24 Jam (misal 14:00)
    }).format(date);
  };

  return (
    <main className="min-h-screen bg-[#F5F5F7] dark:bg-[#000000] text-gray-900 dark:text-white pb-20 overflow-x-hidden">
      <Navbar />

      <div className="pt-32 md:pt-36 px-4 md:px-0 max-w-3xl mx-auto">
        <div className="flex justify-between items-end mb-6 md:mb-8 px-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Riwayat Diagnosa</h1>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
              {currentUser ? `Data milik ${currentUser}` : "Silakan login untuk melihat data."}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1c1c1e] rounded-[1.5rem] md:rounded-3xl shadow-sm border border-gray-200/50 dark:border-white/10 overflow-hidden min-h-[200px]">
          
          {isLoading ? (
             <div className="py-20 text-center flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <p className="text-gray-400 text-sm">Mengambil data...</p>
             </div>
          ) : !currentUser ? (
             <div className="py-20 text-center text-gray-500 px-4">
               <p>Anda belum login.</p>
               <p className="text-xs mt-2 text-gray-400">Masuk di halaman utama untuk menyimpan riwayat.</p>
             </div>
          ) : history.length > 0 ? (
            history.map((item, index) => (
              <div
                key={item.id || index}
                onClick={() => setSelectedItem(item)}
                className={`group relative flex items-center gap-3 md:gap-4 p-4 cursor-pointer transition-all duration-200 ease-out hover:bg-gray-50 dark:hover:bg-white/5 active:scale-[0.99] ${index !== history.length - 1 ? "border-b border-gray-100 dark:border-white/5" : ""}`}
              >
                <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-white/5">
                  {item.image_base64 ? (
                      <Image src={item.image_base64} alt="Ikan" fill className="object-cover" />
                  ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={20} /></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col justify-center h-full gap-1">
                  <h3 className="font-bold text-base md:text-lg truncate text-gray-900 dark:text-white">
                    {item.result || "Tidak terdeteksi"}
                  </h3>
                  <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 font-medium">
                    <Calendar size={14} className="text-orange-500" /> 
                    {formatDate(item.created_at)}
                  </div>
                </div>
                
                <div className="flex items-center gap-3 md:gap-4 pl-2">
                  <span className={`text-[10px] md:text-xs font-bold font-mono ${item.healthy ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'} px-2 py-1 md:px-3 md:py-1.5 rounded-lg flex-shrink-0`}>
                    {item.confidence || "0%"}
                  </span>
                  
                  <button 
                    onClick={(e) => deleteItem(item.id, e)} 
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
                    title="Hapus"
                  >
                    <Trash2 size={18} />
                  </button>
                  
                  <ChevronRight size={18} className="text-gray-300 hidden md:block group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 text-gray-400"><Activity size={32} /></div>
              <p className="text-gray-900 dark:text-white font-bold">Belum ada riwayat.</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Diagnosa ikan Anda sekarang untuk melihat hasil di sini.</p>
            </div>
          )}
        </div>
        
        <AnimatePresence>
            {selectedItem && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedItem(null)} className="fixed inset-0 bg-black/60 backdrop-blur-md z-50" />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] md:w-[90%] max-w-md bg-white dark:bg-[#1c1c1e] p-6 md:p-8 rounded-[2rem] shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto scrollbar-hide">
                        <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 z-10 bg-white/50 dark:bg-black/20 text-gray-900 dark:text-white transition-colors"><X size={20}/></button>
                        
                        <div className="w-full h-48 md:h-56 relative rounded-2xl overflow-hidden mb-6 bg-gray-100 dark:bg-gray-800 shadow-inner">
                             {selectedItem.image_base64 ? (
                                <Image src={selectedItem.image_base64} alt="Detail Ikan" fill className="object-cover" />
                             ) : (
                                <div className="flex items-center justify-center h-full text-gray-400"><ImageIcon size={40}/></div>
                             )}
                        </div>

                        <div className="text-center mb-6">
                            <h2 className="text-2xl md:text-3xl font-bold mb-1 text-gray-900 dark:text-white leading-tight">{selectedItem.result}</h2>
                            <p className="text-gray-500 text-sm">{formatDate(selectedItem.created_at)}</p>
                        </div>

                        <div className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl mb-6 border border-gray-100 dark:border-white/5">
                            <div className="flex justify-between mb-2 text-sm">
                                <span className="text-gray-500">Tingkat Keyakinan AI</span>
                                <span className="font-bold text-gray-900 dark:text-white">{selectedItem.confidence}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }} 
                                  animate={{ width: selectedItem.confidence }} 
                                  transition={{ duration: 1, delay: 0.2 }}
                                  className={`h-2.5 rounded-full ${selectedItem.healthy ? "bg-green-500" : "bg-red-500"}`} 
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">Deskripsi</h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">"{selectedItem.description}"</p>
                            </div>
                            
                            {!selectedItem.healthy && (
                                <div className="p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-500/20 rounded-2xl">
                                    <h3 className="font-bold text-orange-700 dark:text-orange-400 text-sm mb-1 flex items-center gap-2">
                                      <Activity size={16} /> Saran Pengobatan
                                    </h3>
                                    <p className="text-orange-800 dark:text-orange-200 text-sm leading-relaxed">{selectedItem.treatment}</p>
                                </div>
                            )}
                        </div>

                    </motion.div>
                </>
            )}
        </AnimatePresence>
      </div>
    </main>
  );
}