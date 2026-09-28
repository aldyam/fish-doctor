"use client";
import { useState, useEffect, useRef } from "react";
import { ImageIcon, X, CheckCircle, AlertTriangle, RefreshCw, Download } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import GlassActionButton from "@/components/GlassActionButton";
import DiagnosisSubtitle from "@/components/DiagnosisSubtitle";
import CameraCapture from "@/components/CameraCapture";
import { motion, AnimatePresence } from "framer-motion";
import type { PredictionResult } from "@/utils/downloadPredictionPdf";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const DISEASE_DB: Record<string, { title: string; desc: string; treatment: string }> = {
  "Aeromoniasis": {
    title: "Aeromoniasis",
    desc:
      "Ditandai luka atau borok hemoragik pada kulit, pendarahan pada tubuh maupun pangkal sirip, serta pada infeksi sistemik dapat disertai pembengkakan abdomen atau ascites.",
    treatment:
      "Pisahkan ikan yang menunjukkan gejala dan perbaiki faktor lingkungan seperti kualitas air serta tingkat stres. Oxytetracycline dapat digunakan pada indikasi yang sesuai dengan mengikuti ketentuan veteriner dan dosis yang dianjurkan.",
  },

  "Bacterial Gill Disease": {
    title: "Bacterial Gill Disease",
    desc:
      "Ikan dapat tampak megap-megap dan lemah, sedangkan insang mengalami perubahan warna serta dapat dipenuhi material atau lendir yang mengganggu fungsi respirasi.",
    treatment:
      "Perbaiki kualitas air, aerasi, dan kondisi pemeliharaan. Chloramine-T dapat digunakan pada kondisi dan spesies yang sesuai dengan tetap memperhatikan dosis serta ketentuan penggunaan yang berlaku.",
  },

  "Bacterial Red Disease": {
    title: "Bacterial Red Disease",
    desc:
      "Ditandai area kemerahan pada tubuh, lesi atau luka pada kulit, dan pendarahan. Pada kondisi sistemik dapat disertai pembengkakan abdomen maupun mata.",
    treatment:
      "Pisahkan ikan yang menunjukkan gejala, perbaiki kualitas air dan sanitasi kolam, serta kurangi stres dan kepadatan berlebih. Identifikasi penyebab sebaiknya dilakukan sebelum menentukan terapi antimikroba yang sesuai.",
  },

  "EUS": {
    title: "Epizootic Ulcerative Syndrome (EUS)",
    desc:
      "Diawali bercak kemerahan pada kulit yang dapat berkembang menjadi lesi ulseratif dan nekrosis jaringan. Pada kondisi lanjut, luka dapat menembus hingga lapisan otot.",
    treatment:
      "Belum tersedia pengobatan kuratif yang efektif untuk ikan yang telah terinfeksi berat. Perbaiki kualitas air, pisahkan ikan terinfeksi, serta lakukan pengelolaan kolam melalui penggunaan garam atau pengapuran sesuai kondisi budidaya.",
  },

  "Saprolegniasis": {
    title: "Saprolegniasis",
    desc:
      "Ditandai pertumbuhan miselium berwarna putih hingga abu-abu menyerupai kapas pada permukaan tubuh, sirip, atau bagian kulit yang mengalami luka. Ikan juga dapat menjadi lemah dan mengalami ulserasi kulit.",
    treatment:
      "Perbaiki kualitas lingkungan dan kurangi kondisi yang memicu luka atau stres. NaCl dapat digunakan sebagai salah satu tindakan pengendalian pada kondisi budidaya tertentu dengan konsentrasi yang disesuaikan terhadap spesies dan sistem pemeliharaan.",
  },

  "Healthy Fish": {
    title: "Ikan Sehat",
    desc:
      "Ikan menunjukkan aktivitas berenang yang normal dan responsif, warna tubuh tampak cerah, serta tidak terlihat bercak, pendarahan, perubahan warna, maupun kelainan pada tubuh, insang, dan sirip.",
    treatment:
      "Pertahankan kualitas air, kepadatan pemeliharaan yang sesuai, nutrisi yang mencukupi, serta sanitasi lingkungan budidaya. Lakukan pemantauan kondisi ikan secara berkala.",
  },

  "Parasitic Diseases": {
    title: "Parasitic Diseases",
    desc:
      "Manifestasi klinis dapat berbeda tergantung jenis parasit. Secara umum dapat ditemukan lendir berlebih, iritasi atau lesi pada kulit, sirip maupun insang, perilaku menggosokkan tubuh, gangguan pernapasan, serta pada beberapa jenis parasit dapat terlihat organisme yang menempel pada tubuh ikan.",
    treatment:
      "Penanganan harus disesuaikan dengan jenis parasit yang menginfeksi. Pisahkan ikan yang menunjukkan gejala, perbaiki kualitas air dan sanitasi, serta lakukan pemeriksaan kulit, sirip, atau insang sebelum menentukan terapi antiparasit yang sesuai.",
  },

  "White Tail Disease": {
    title: "White Tail Disease",
    desc:
      "White Tail Disease digunakan sebagai kategori diagnostik sesuai dengan pelabelan pada dataset sumber. Kelas ini dipertahankan sebagai label visual pada model dan tidak merujuk secara spesifik pada satu agen penyebab tanpa pemeriksaan lanjutan.",
    treatment:
      "Pisahkan ikan yang menunjukkan kelainan dari populasi sehat bila memungkinkan, perbaiki kualitas air dan sanitasi lingkungan budidaya, serta lakukan pemeriksaan lebih lanjut untuk menentukan penyebab sebelum memberikan terapi spesifik.",
  },
};

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedImage) return;
    return () => URL.revokeObjectURL(selectedImage);
  }, [selectedImage]);

  const selectImage = (selectedFile: File) => {
    if (isAnalyzing || isDownloading) return;
    setFile(selectedFile);
    setSelectedImage(URL.createObjectURL(selectedFile));
    setResult(null);
    setError(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    selectImage(selectedFile);
    // Allow selecting the same image again after resetting.
    event.target.value = "";
  };

  const resetSelection = () => {
    if (isAnalyzing || isDownloading) return;
    setSelectedImage(null);
    setFile(null);
    setResult(null);
    setError(null);
  };

  const runAnalysis = async () => {
    if (!file || isAnalyzing) return;
    setIsAnalyzing(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      if (!API_URL) {
        throw new Error("NEXT_PUBLIC_API_URL belum dikonfigurasi.");
      }

      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        body: formData,
      });
      const data: {
        result: string;
        confidence: string;
        status: "safe" | "danger";
        healthy: boolean;
        error?: string;
        detail?: string;
      } = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          data.detail ||
          "Gagal memproses gambar"
        );
      }

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
        predictedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Prediksi gagal:", error);
      setError("Gagal menganalisis gambar. Pastikan backend aktif dan gambar valid, lalu coba lagi.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownload = async () => {
    if (!result || !file || isDownloading) return;
    setIsDownloading(true);
    setError(null);
    try {
      const { downloadPredictionPdf } = await import("@/utils/downloadPredictionPdf");
      await downloadPredictionPdf(result, file);
    } catch (error) {
      console.error("Download PDF gagal:", error);
      setError("PDF gagal dibuat. Silakan coba download kembali.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <main className="min-h-screen fd-page pb-20 overflow-x-hidden">
      <div className="pt-32 md:pt-36 px-4 flex flex-col items-center max-w-5xl mx-auto">

        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-7xl font-bold tracking-[0.065em] md:tracking-tight mb-4 md:mb-6 bg-clip-text text-transparent fd-heading leading-tight">
            Machine Learning<br /> <span className="text-foreground">Fish Health</span>
          </h1>
          <p className="text-base md:text-xl text-secondary max-w-xs md:max-w-xl mx-auto font-medium leading-relaxed tracking-[0.025em] md:tracking-normal"><DiagnosisSubtitle /></p>
        </div>

        <div className="w-full max-w-2xl fd-surface fd-diagnosis-card rounded-[2rem] md:rounded-[2.5rem] p-2 border">
          <div className="p-5 md:p-10">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center text-center">
                  <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden mb-6 border border-border shadow-sm">
                    <Image src={selectedImage!} alt="Preview" fill className="object-cover" />
                    <div className="fd-glass-surface fd-glass-media absolute top-3 right-3 text-xs font-bold px-3 py-1.5 rounded-full border">Keyakinan AI {result.confidence}</div>
                  </div>
                  <div className="fd-glass-surface mb-4 px-5 py-2.5 rounded-full inline-flex items-center gap-2">
                    {result.healthy ? <CheckCircle size={20} className="text-green-500 fill-green-500/10" /> : <AlertTriangle size={20} className="text-red-500 fill-red-500/10" />}
                    <span className="font-bold text-base text-foreground">{result.result}</span>
                  </div>
                  <p className="text-secondary text-xs mb-4">
                    {new Intl.DateTimeFormat("id-ID", {
                      dateStyle: "long",
                      timeStyle: "long",
                    }).format(new Date(result.predictedAt))}
                  </p>
                  <p className="text-secondary text-sm leading-relaxed mb-6 px-2">{result.desc}</p>
                  {!result.healthy && (
                    <div className="fd-glass-surface w-full border rounded-2xl p-5 mb-6 text-left">
                      <h3 className="text-foreground font-bold text-sm mb-2">Rekomendasi Pengobatan</h3>
                      <p className="text-secondary text-sm leading-relaxed">{result.treatment}</p>
                    </div>
                  )}
                  <GlassActionButton
                    fullWidth
                    onClick={handleDownload}
                    loading={isDownloading}
                    loadingLabel="Menyiapkan PDF..."
                    disabled={isDownloading}
                    icon={<Download size={18} />}
                    className="py-4 mb-3 px-4 text-sm md:text-base"
                  >
                    Download Hasil Prediksi (PDF)
                  </GlassActionButton>
                  <GlassActionButton
                    fullWidth
                    disabled={isDownloading}
                    onClick={resetSelection}
                    icon={<RefreshCw size={18} />}
                    className="py-4 text-base"
                  >
                    Diagnosa Ikan Lain
                  </GlassActionButton>
                </motion.div>
              ) : (
                <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                   {selectedImage ? (
                    <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden fd-soft mb-6 border">
                      <Image src={selectedImage} alt="Preview" fill className="object-cover" />
                  <button aria-label="Batalkan gambar" disabled={isAnalyzing} onClick={resetSelection} className="absolute top-4 right-4 fd-button fd-media p-2 rounded-full z-10"><X size={20} /></button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 md:gap-4 h-52 md:h-64 mb-2">
                      <motion.div onClick={() => galleryInputRef.current?.click()} className="cursor-pointer rounded-3xl fd-upload border-dashed border flex flex-col items-center justify-center gap-3 md:gap-4">
                        <ImageIcon className="w-8 h-8 text-muted" /> <span className="text-sm font-semibold text-secondary">Galeri</span>
                      </motion.div>
                      <CameraCapture disabled={isAnalyzing || isDownloading} onCapture={selectImage} />
                    </div>
                  )}
                  <input type="file" ref={galleryInputRef} disabled={isAnalyzing || isDownloading} accept="image/*" className="hidden" onChange={handleFileChange} />
                  <GlassActionButton
                    fullWidth
                    onClick={runAnalysis}
                    disabled={!file || isAnalyzing}
                    loading={isAnalyzing}
                    loadingLabel="Proses..."
                    className="mt-6 py-4 fd-action-analysis"
                  >
                    Mulai Analisa
                  </GlassActionButton>
                </motion.div>
              )}
            </AnimatePresence>
            {error && <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
          </div>
        </div>
      </div>
      <footer className="mt-12 px-4 text-center text-xs leading-relaxed text-secondary">
        FishDoctor © 2026 • Powered by TensorFlow &amp; Next.js <br />
        Created by <Link href="https://aldybuilds.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:underline">アルディ</Link>
      </footer>
    </main>
  );
}