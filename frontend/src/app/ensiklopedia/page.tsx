"use client";
import { Search, ArrowRight, Activity, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Disease = { id: number; name: string; latin: string; type: string; desc: string; symptoms: string[]; treatment: string; color: string; badgeColor: string; };

// DATASET FINAL (Validasi Medis/Jurnal Perikanan)
const diseasesData: Disease[] = [
  { 
    id: 1, 
    name: "Aeromoniasis (Infeksi Bakteri)", 
    latin: "Aeromonas hydrophila", 
    type: "Bakteri", 
    desc: "Dikenal sebagai Motile Aeromonas Septicemia (MAS). Bakteri oportunistik ini menyerang sistemik saat kualitas air buruk (tinggi bahan organik) atau fluktuasi suhu.", 
    symptoms: [
      "Pendarahan (bercak merah) di kulit & sirip", 
      "Perut bengkak berisi cairan (Dropsy)", 
      "Mata menonjol keluar (Exophthalmia)", 
      "Sisik kusam dan berdiri (Nanas)"
    ], 
    treatment: "Perbaiki kualitas air (Ganti air 30%). Pakan + Antibiotik Oxytetracycline (50mg/kg bobot) selama 5-7 hari. Herbal: Ekstrak daun ketapang/bawang putih.", 
    color: "from-rose-500/20 to-orange-500/20", 
    badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400" 
  },
  { 
    id: 2, 
    name: "Bacterial Gill (Penyakit Insang)", 
    latin: "Flavobacterium branchiophilum", 
    type: "Bakteri", 
    desc: "Menyerang epitel insang menyebabkan hiperplasia (penebalan), sehingga menghambat pertukaran oksigen. Sering terjadi pada kepadatan tebar tinggi.", 
    symptoms: [
      "Insang bengkak, pucat, atau geripis", 
      "Ikan megap-megap di permukaan (Hipoksia)", 
      "Operkulum (tutup insang) terbuka", 
      "Produksi lendir insang berlebih"
    ], 
    treatment: "Kurangi kepadatan & stop pakan sementara. Rendaman Garam (1-3 ppt) atau Kalium Permanganat (PK) 2-4 ppm untuk mengikat bahan organik.", 
    color: "from-orange-500/20 to-yellow-500/20", 
    badgeColor: "bg-orange-500/10 text-orange-600 dark:text-orange-400" 
  },
  { 
    id: 3, 
    name: "Red Disease (Bercak Merah)", 
    latin: "Pseudomonas sp. / A. hydrophila", 
    type: "Bakteri", 
    desc: "Sering disebut 'Red Pest' atau Pseudomonas Septicemia. Bakteri ini proteolitik (menghancurkan protein), menyebabkan kulit terkelupas hingga daging terekspos.", 
    symptoms: [
      "Luka borok (ulcer) kemerahan terbuka", 
      "Pendarahan pada pangkal sirip/mulut", 
      "Gerakan lambat & berada di dasar", 
      "Nafsu makan hilang total"
    ], 
    treatment: "Karantina ikan sakit. Berikan antibiotik spektrum luas (Kanamycin/Erythromycin). Jaga pH air tetap stabil di 7-8.", 
    color: "from-red-600/20 to-rose-600/20", 
    badgeColor: "bg-red-600/10 text-red-600 dark:text-red-400" 
  },
  { 
    id: 4, 
    name: "EUS (Wabah Luka)", 
    latin: "Aphanomyces invadans", 
    type: "Jamur", 
    desc: "Epizootic Ulcerative Syndrome (EUS). Infeksi jamur ganas yang masuk lewat kulit, menembus daging hingga tulang (nekrotik). Dipicu suhu air dingin (<24°C).", 
    symptoms: [
      "Luka dalam & lebar menyerupai kawah", 
      "Jaringan otot membusuk (nekrosis)", 
      "Bercak merah meluas cepat", 
      "Kematian massal saat hujan/dingin"
    ], 
    treatment: "Sangat sulit diobati jika parah. Pencegahan: Tabur Kapur (CaO) untuk naikkan pH. Naikkan suhu air >30°C (Jamur mati di suhu panas).", 
    color: "from-purple-600/20 to-indigo-600/20", 
    badgeColor: "bg-purple-600/10 text-purple-600 dark:text-purple-400" 
  },
  { 
    id: 5, 
    name: "Saprolegniasis (Jamur Kapas)", 
    latin: "Saprolegnia sp.", 
    type: "Jamur", 
    desc: "Infeksi sekunder pada luka fisik atau telur ikan. Jamur tumbuh membentuk koloni seperti kapas yang menghancurkan jaringan epidermis.", 
    symptoms: [
      "Tumbuh serabut halus putih/kelabu (kapas)", 
      "Luka terlihat berlendir/kotor", 
      "Sering menyerang telur ikan yang mati", 
      "Ikan lemah dan berdiam di sudut"
    ], 
    treatment: "Oleskan Malachite Green (pada ikan hias) atau Methylene Blue. Rendaman Garam Ikan (NaCl) dosis tinggi singkat. Jemur kolam saat persiapan.", 
    color: "from-gray-500/20 to-slate-500/20", 
    badgeColor: "bg-gray-500/10 text-gray-600 dark:text-gray-400" 
  },
  { 
    id: 6, 
    name: "Parasitic Diseases", 
    latin: "Ichthyophthirius / Argulus", 
    type: "Parasit", 
    desc: "Gabungan infeksi ektoparasit: 'Ich' (White Spot) yang mikroskopis atau 'Kutu Ikan' (Argulus) yang terlihat mata. Menyebabkan iritasi hebat.", 
    symptoms: [
      "Ikan menggesekkan badan ke dinding (Flashing)", 
      "Bintik putih kecil / kutu menempel", 
      "Produksi lendir berlebih (Cloudy skin)", 
      "Sirip menguncup/robek"
    ], 
    treatment: "Ich: Naikkan suhu 30°C + Methylene Blue. Kutu: Cabut manual atau gunakan obat organofosfat (Abate) dengan dosis ketat.", 
    color: "from-blue-500/20 to-cyan-500/20", 
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400" 
  },
  { 
    id: 7, 
    name: "White Tail Disease", 
    latin: "Macrobrachium rosenbergii Nodavirus", 
    type: "Virus", 
    desc: "Penyakit viral (MrNV) yang menyebabkan nekrosis otot (jaringan mati memutih). Sangat mematikan pada larva/benih, terutama udang galah/ikan air tawar tertentu.", 
    symptoms: [
      "Bagian ekor berubah warna putih susu", 
      "Ekor terlihat geripis/rusak", 
      "Ikan berenang miring/hilang keseimbangan", 
      "Kematian bertahap dalam 2-3 hari"
    ], 
    treatment: "Virus tidak ada obatnya. Isolasi total ikan sakit. Berikan Vitamin C & Immunostimulan untuk tingkatkan daya tahan tubuh ikan yang sehat.", 
    color: "from-indigo-500/20 to-blue-600/20", 
    badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" 
  },
  { 
    id: 8, 
    name: "Healthy Fish (Sehat)", 
    latin: "Kondisi Normal", 
    type: "Normal", 
    desc: "Ikan dalam kondisi biologis prima (homeostasis terjaga). Bebas patogen, respon saraf aktif, dan metabolisme berjalan baik.", 
    symptoms: [
      "Berenang lincah dan responsif", 
      "Nafsu makan tinggi (rakus)", 
      "Warna tubuh cerah alami/mengkilap", 
      "Insang berwarna merah segar dan bersih"
    ], 
    treatment: "Lanjutkan Standard Operational Procedure (SOP). Jaga parameter air (pH 6.5-8, DO >4 ppm, Amonia <0.02 ppm).", 
    color: "from-emerald-500/20 to-green-500/20", 
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
  },
];

export default function Ensiklopedia() {
  const [search, setSearch] = useState("");
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  const filtered = diseasesData.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="min-h-screen fd-page pb-20 overflow-x-hidden">
      <div className="pt-32 md:pt-40 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Ensiklopedia</h1>
            <p className="text-secondary text-lg">Referensi medis penyakit ikan</p>
          </div>
          <div className="relative w-full md:w-96 rounded-2xl fd-search fd-search-field">
             <div className="absolute inset-y-0 left-0 z-10 pl-4 flex items-center pointer-events-none"><Search className="h-5 w-5 text-muted" /></div>
             <input type="text" className="block w-full pl-11 pr-4 py-3.5 rounded-2xl bg-transparent border-none text-sm" placeholder="Cari penyakit..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {/* APPLE HEALTH STYLE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
            {filtered.map((data) => (
              <motion.div key={data.id} onClick={() => setSelectedDisease(data)} className="group relative fd-surface fd-encyclopedia-card rounded-[2rem] p-6 border cursor-pointer overflow-hidden">
                {/* Subtle Gradient Background */}
                <div className={`absolute inset-0 fd-card-tint ${data.color}`} />
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl fd-icon flex items-center justify-center">
                      <Activity size={22} />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase fd-category ${data.badgeColor}`}>{data.type}</span>
                  </div>
                  <h2 className="text-xl font-bold mb-1 tracking-tight text-foreground">{data.name}</h2>
                  <p className="text-sm text-muted italic font-serif mb-4">{data.latin}</p>
                  <p className="text-sm text-secondary leading-relaxed mb-4 line-clamp-2">{data.desc}</p>
                  <div className="flex items-center gap-2 text-xs font-bold fd-detail-link">
                    Lihat Detail <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-200" />
                  </div>
                </div>
              </motion.div>
            ))}
        </div>

        {/* MODAL DETAIL */}
        <AnimatePresence>
          {selectedDisease && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedDisease(null)} className="fixed inset-0 fd-overlay z-50" />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] md:w-[600px] fd-surface fd-elevated rounded-[2.5rem] p-8 overflow-y-auto max-h-[85vh] scrollbar-hide border">
                <button onClick={() => setSelectedDisease(null)} className="absolute top-6 right-6 p-2 rounded-full fd-button"><X size={20} /></button>
                <div className="mt-2">
                   <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase fd-category ${selectedDisease.badgeColor}`}>{selectedDisease.type}</span>
                   <h2 className="text-3xl font-bold mt-4 mb-1 tracking-tight">{selectedDisease.name}</h2>
                   <p className="text-lg text-muted italic font-serif mb-6">{selectedDisease.latin}</p>
                   <p className="text-secondary text-lg leading-relaxed mb-8">{selectedDisease.desc}</p>
                   <div className="space-y-4">
                      <div className="fd-soft p-6 rounded-3xl border">
                        <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">Gejala</h3>
                        <ul className="space-y-2">{selectedDisease.symptoms.map((s, i) => (<li key={i} className="flex items-start gap-3 text-sm text-secondary"><div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-muted flex-shrink-0" />{s}</li>))}</ul>
                      </div>
                      <div className="fd-accent-panel p-6 rounded-3xl border">
                        <h3 className="font-bold text-accent-text mb-3 flex items-center gap-2">Pengobatan</h3>
                        <p className="text-sm text-secondary leading-relaxed">{selectedDisease.treatment}</p>
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