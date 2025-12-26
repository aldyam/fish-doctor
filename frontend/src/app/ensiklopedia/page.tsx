"use client";
import Navbar from "@/components/Navbar";
import { Search, ArrowRight, Activity, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// TYPE DATA
type Disease = {
  id: number;
  name: string;
  latin: string;
  type: string;
  desc: string;
  symptoms: string[];
  treatment: string;
  color: string;
  badgeColor: string;
};

// DATASET FINAL (SUDAH BERSIH DARI CATATAN FOLDER)
const diseasesData: Disease[] = [
  {
    id: 1,
    name: "Aeromoniasis (Infeksi Bakteri)",
    latin: "Aeromonas hydrophila",
    type: "Bakteri",
    desc: "Infeksi bakteri ganas yang sering menyerang ikan air tawar saat perubahan musim atau kualitas air buruk. Menyebabkan pendarahan internal dan eksternal yang fatal jika tidak segera ditangani.",
    symptoms: [
      "Bercak merah menyebar di kulit",
      "Perut bengkak berisi cairan (Dropsy)",
      "Mata menonjol (Pop-eye)",
      "Sisik terkelupas atau berdiri"
    ],
    treatment: "Karantina ikan. Berikan pakan berantibiotik (Oxytetracycline 50mg/kg). Jaga kebersihan air dan kurangi pakan sementara.",
    color: "bg-red-500",
    badgeColor: "bg-red-500/10 text-red-600 dark:text-red-400",
  },
  {
    id: 2,
    name: "Bacterial Gill Disease (Penyakit Insang)",
    latin: "Flavobacterium branchiophilum",
    type: "Bakteri",
    desc: "Penyakit bakteri yang menyerang filamen insang, menyebabkan pembengkakan dan lendir berlebih sehingga ikan kesulitan mengambil oksigen dari air.",
    symptoms: [
      "Insang bengkak dan pucat (putih)",
      "Ikan sering megap-megap di permukaan",
      "Tutup insang terbuka terus",
      "Lendir berlebih pada area kepala"
    ],
    treatment: "Ganti air segera untuk kurangi amonia. Berikan garam ikan (1-2 ppt). Rendaman Kalium Permanganat (PK) dosis rendah dapat membantu.",
    color: "bg-orange-500",
    badgeColor: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },
  {
    id: 3,
    name: "Bacterial Red Disease (Bercak Merah)",
    latin: "Pseudomonas sp. / Aeromonas",
    type: "Bakteri",
    desc: "Sering disebut 'Red Pest'. Bakteri ini menggerogoti lapisan kulit hingga daging, menyebabkan luka terbuka (borok) yang berwarna merah dan berdarah.",
    symptoms: [
      "Luka borok kemerahan di tubuh",
      "Pendarahan pada pangkal sirip",
      "Gerakan ikan lambat dan lemah",
      "Nafsu makan hilang total"
    ],
    treatment: "Antibiotik spektrum luas (Kanamycin/Erythromycin). Tingkatkan aerasi oksigen. Hindari penanganan kasar yang memperparah luka.",
    color: "bg-red-600",
    badgeColor: "bg-red-600/10 text-red-600 dark:text-red-400",
  },
  {
    id: 4,
    name: "EUS (Wabah Luka Borok)",
    latin: "Epizootic Ulcerative Syndrome",
    type: "Jamur/Bakteri",
    desc: "Infeksi kompleks yang dipicu oleh jamur Aphanomyces invadans. Menyebabkan luka borok yang sangat dalam hingga menembus tulang (kawah). Sangat menular.",
    symptoms: [
      "Luka borok yang dalam dan lebar (kawah)",
      "Jaringan otot terlihat membusuk",
      "Bercak merah yang meluas cepat",
      "Sering terjadi saat suhu air dingin/hujan"
    ],
    treatment: "Sangat sulit diobati jika sudah parah. Tingkatkan suhu air >30°C. Taburkan kapur (CaO) di kolam untuk mematikan spora jamur.",
    color: "bg-purple-600",
    badgeColor: "bg-purple-600/10 text-purple-600 dark:text-purple-400",
  },
  {
    id: 5,
    name: "Saprolegniasis (Jamur Kapas)",
    latin: "Saprolegnia sp.",
    type: "Jamur",
    desc: "Penyakit jamur yang tumbuh menyerupai gumpalan kapas putih atau abu-abu. Biasanya menyerang jaringan kulit mati, luka terbuka, atau telur ikan.",
    symptoms: [
      "Serabut putih/abu-abu mirip kapas di tubuh",
      "Luka terlihat berlendir",
      "Sering menyerang telur ikan",
      "Ikan berdiam diri di dasar kolam"
    ],
    treatment: "Oleskan Malachite Green pada area jamur. Berikan garam ikan (NaCl). Jaga suhu air tetap hangat dan stabil.",
    color: "bg-gray-500",
    badgeColor: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
  },
  {
    id: 6,
    name: "Parasitic Diseases (Penyakit Parasit)",
    latin: "Ichthyophthirius / Argulus / Lernaea",
    type: "Parasit",
    desc: "Kategori umum untuk infeksi parasit eksternal seperti Bintik Putih (Ich), Kutu Jarum (Lernaea), atau Kutu Kura (Argulus) yang menghisap darah atau merusak kulit.",
    symptoms: [
      "Ikan menggesekkan badan ke dinding kolam",
      "Bintik putih atau kutu yang terlihat mata",
      "Produksi lendir berlebih (Cloudy skin)",
      "Sirip menguncup atau robek"
    ],
    treatment: "Obat anti-parasit (Methylene Blue, Formalin, atau Abate untuk kutu). Karantina ikan yang terinfeksi agar tidak menular.",
    color: "bg-blue-500",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    id: 7,
    name: "White Tail Disease (Penyakit Ekor Putih)",
    latin: "Macrobrachium rosenbergii nodavirus",
    type: "Virus",
    desc: "Penyakit viral yang menyebabkan nekrosis otot (kematian jaringan) pada area ekor, sehingga tampak berwarna putih susu atau keruh.",
    symptoms: [
      "Bagian ekor berubah warna menjadi putih susu",
      "Ekor terlihat kaku atau geripis",
      "Ikan kehilangan keseimbangan",
      "Kematian bertahap dalam 2-3 hari"
    ],
    treatment: "Belum ada obat efektif untuk virus. Isolasi ikan sakit segera. Berikan vitamin C dan Immunostimulan untuk meningkatkan daya tahan tubuh.",
    color: "bg-indigo-500",
    badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  },
  {
    id: 8,
    name: "Healthy Fish (Ikan Sehat)",
    latin: "Kondisi Sehat",
    type: "Normal",
    desc: "Ikan dalam kondisi biologis prima, bebas dari patogen, menunjukkan perilaku aktif, nafsu makan baik, dan warna tubuh yang cerah.",
    symptoms: [
      "Berenang lincah dan seimbang",
      "Nafsu makan tinggi (rakus)",
      "Warna tubuh cerah alami",
      "Insang merah segar dan bersih"
    ],
    treatment: "Lanjutkan pemeliharaan rutin. Jaga kualitas air (pH, Suhu, Oksigen) dan berikan pakan berkualitas.",
    color: "bg-green-500",
    badgeColor: "bg-green-500/10 text-green-600 dark:text-green-400",
  },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemAnim = { hidden: { opacity: 0, y: 20, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1 } };

export default function Ensiklopedia() {
  const [search, setSearch] = useState("");
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);

  const filteredDiseases = diseasesData.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="min-h-screen bg-[#FBFBFD] dark:bg-[#000000] text-gray-900 dark:text-white pb-20 overflow-x-hidden">
      <Navbar />
      
      <div className="pt-32 md:pt-36 px-4 md:px-6 max-w-7xl mx-auto">
        
        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }} 
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-6"
        >
          <div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-2 md:mb-3">Ensiklopedia</h1>
            <p className="text-sm md:text-lg text-gray-500 dark:text-gray-400 max-w-md leading-relaxed">Referensi lengkap penyakit ikan air tawar</p>
          </div>
          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
            <input type="text" className="block w-full pl-11 pr-4 py-3 md:py-4 rounded-2xl bg-white dark:bg-[#1c1c1e] border-none ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-blue-500/50 placeholder-gray-400 text-sm md:text-base shadow-sm" placeholder="Cari penyakit..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </motion.div>

        {/* GRID KARTU */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6">
          <AnimatePresence>
            {filteredDiseases.map((data) => (
              <motion.div
                key={data.id}
                variants={itemAnim}
                whileHover={{ y: -10, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedDisease(data)}
                className="group relative bg-white dark:bg-[#1c1c1e] rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 shadow-xl shadow-gray-200/40 dark:shadow-none border border-white/20 dark:border-white/5 overflow-hidden cursor-pointer transition-shadow hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-900/10"
              >
                <div className={`absolute -top-20 -right-20 w-40 md:w-64 h-40 md:h-64 ${data.color} opacity-5 blur-[60px] md:blur-[80px] group-hover:opacity-20 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4 md:mb-6">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:scale-110 transition-transform duration-300">
                      <Activity size={20} />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold tracking-wide uppercase ${data.badgeColor}`}>
                      {data.type}
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{data.name}</h2>
                  <p className="text-xs md:text-sm text-gray-400 italic mb-3 font-serif">{data.latin}</p>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-6 line-clamp-2">{data.desc}</p>
                  
                  <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    Pelajari Detail <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* MODAL DETAIL */}
        <AnimatePresence>
          {selectedDisease && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedDisease(null)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 50 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] md:w-[600px] bg-white dark:bg-[#1c1c1e] rounded-[2rem] p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[85vh] scrollbar-hide"
              >
                <button onClick={() => setSelectedDisease(null)} className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 transition-colors z-50"><X size={20} /></button>
                <div className="mt-2 md:mt-4">
                   <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${selectedDisease.badgeColor}`}>
                      {selectedDisease.type}
                   </span>
                   <h2 className="text-2xl md:text-3xl font-bold mt-3 md:mt-4 mb-1">{selectedDisease.name}</h2>
                   <p className="text-base md:text-lg text-gray-400 italic font-serif mb-4 md:mb-6">{selectedDisease.latin}</p>
                   
                   <p className="text-gray-700 dark:text-gray-300 text-sm md:text-lg leading-relaxed mb-6 md:mb-8">
                     {selectedDisease.desc}
                   </p>

                   <div className="space-y-4 md:space-y-6">
                      <div className="bg-gray-50 dark:bg-black/20 p-5 md:p-6 rounded-3xl border border-gray-100 dark:border-white/5">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2 md:mb-3 flex items-center gap-2">🔍 Gejala Klinis</h3>
                        <ul className="space-y-2">
                          {selectedDisease.symptoms.map((s, i) => (
                             <li key={i} className="flex items-start gap-3 text-sm md:text-base text-gray-600 dark:text-gray-300">
                               <div className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${selectedDisease.color}`} />
                               {s}
                             </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-blue-50 dark:bg-blue-900/10 p-5 md:p-6 rounded-3xl border border-blue-100 dark:border-blue-500/20">
                        <h3 className="font-bold text-blue-700 dark:text-blue-400 mb-2 md:mb-3 flex items-center gap-2">💊 Rekomendasi Penanganan</h3>
                        <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                          {selectedDisease.treatment}
                        </p>
                      </div>
                   </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}