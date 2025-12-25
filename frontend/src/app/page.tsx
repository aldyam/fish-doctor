"use client";
import { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import { Upload, Camera, ImageIcon } from "lucide-react";
import Image from "next/image";

export default function Home() {
  // State untuk menyimpan file dan preview gambar
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  
  // Ref untuk input file hidden
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Fungsi saat user memilih file
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const url = URL.createObjectURL(files[0]);
      setSelectedImage(url); // Buat preview
      setFile(files[0]);     // Simpan file asli untuk dikirim nanti
    }
  };

  // Fungsi Reset gambar
  const resetSelection = () => {
    setSelectedImage(null);
    setFile(null);
  };

  return (
    <main className="min-h-screen bg-white dark:bg-[#0b0f19] text-gray-900 dark:text-white pb-20">
      <Navbar />

      <div className="pt-32 px-4 flex flex-col items-center">
        {/* HEADER */}
        <div className="max-w-2xl w-full text-center mb-10 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Machine Learning for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">
              Fish Health
            </span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
            Deteksi penyakit Ikan Air Tawar dengan teknologi AI
          </p>
        </div>

        {/* CARD UTAMA */}
        <div className="w-full max-w-xl bg-white dark:bg-[#111827] shadow-xl rounded-3xl p-1 border border-gray-100 dark:border-gray-800">
          <div className="p-8">
            
            {/* AREA PREVIEW GAMBAR */}
            {selectedImage ? (
              <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 mb-6">
                <Image 
                  src={selectedImage} 
                  alt="Preview" 
                  fill 
                  className="object-cover"
                />
                <button
                  onClick={resetSelection}
                  className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:bg-white text-black transition"
                >
                  Ganti Foto
                </button>
              </div>
            ) : (
              /* AREA PILIH INPUT (GRID) */
              <div className="grid grid-cols-2 gap-4 h-64 mb-6">
                
                {/* TOMBOL GALERI */}
                <div
                  onClick={() => galleryInputRef.current?.click()}
                  className="cursor-pointer group rounded-2xl bg-gray-50 dark:bg-gray-900/50 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 transition flex flex-col items-center justify-center hover:bg-blue-50/50"
                >
                  <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition">
                    <ImageIcon className="text-blue-500 w-7 h-7" />
                  </div>
                  <p className="text-sm font-semibold">Upload</p>
                </div>

                {/* TOMBOL KAMERA */}
                <div
                  onClick={() => cameraInputRef.current?.click()}
                  className="cursor-pointer group rounded-2xl bg-gray-50 dark:bg-gray-900/50 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-orange-500 transition flex flex-col items-center justify-center hover:bg-orange-50/50"
                >
                  <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition">
                    <Camera className="text-orange-500 w-7 h-7" />
                  </div>
                  <p className="text-sm font-semibold">Ambil Foto</p>
                </div>
              </div>
            )}

            {/* INPUT HIDDEN */}
            <input
              type="file"
              ref={galleryInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <input
              type="file"
              ref={cameraInputRef}
              accept="image/*"
              capture="environment" // Fitur kamera HP langsung nyala
              className="hidden"
              onChange={handleFileChange}
            />

            {/* TOMBOL ANALISA */}
            <button
              disabled={!file}
              className={`w-full py-3.5 font-bold text-lg rounded-full transition-all transform active:scale-[0.98] text-white shadow-lg ${
                file
                  ? "bg-gradient-to-r from-orange-500 to-red-600 shadow-orange-500/30 hover:shadow-orange-500/50"
                  : "bg-gray-300 cursor-not-allowed text-gray-500"
              }`}
            >
              Run Analysis 🚀
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="mt-16 text-gray-400 text-xs font-medium">
          Created by Aldy
        </footer>
      </div>
    </main>
  );
}