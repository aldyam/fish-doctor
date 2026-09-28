"use client";
import { Search, ArrowRight, Activity, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Disease = { id: number; name: string; latin: string; type: string; desc: string; symptoms: string[]; treatment: string; color: string; badgeColor: string; };

// DATASET FINAL (Validasi Medis/Jurnal Perikanan)
const diseasesData: Disease[] = [
  {
    id: 1,
    name: "Aeromoniasis",
    latin: "Aeromonas hydrophila",
    type: "Bakteri",
    desc:
      "Aeromoniasis merupakan penyakit bakterial yang dapat menyebabkan luka atau borok hemoragik pada kulit, pendarahan pada tubuh maupun pangkal sirip, serta pada infeksi sistemik dapat disertai pembengkakan abdomen atau ascites.",
    symptoms: [
      "Luka atau borok hemoragik pada kulit",
      "Pendarahan pada tubuh atau pangkal sirip",
      "Pembengkakan abdomen pada infeksi sistemik",
      "Dapat disertai penumpukan cairan atau ascites",
    ],
    treatment:
      "Pisahkan ikan yang menunjukkan gejala dan perbaiki faktor lingkungan seperti kualitas air serta tingkat stres. Oxytetracycline dapat digunakan pada indikasi yang sesuai dengan mengikuti ketentuan veteriner dan dosis yang dianjurkan.",
    color: "from-rose-500/20 to-orange-500/20",
    badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  },

  {
    id: 2,
    name: "Bacterial Gill Disease",
    latin: "Flavobacterium branchiophilum",
    type: "Bakteri",
    desc:
      "Bacterial Gill Disease merupakan penyakit yang menyerang jaringan insang dan dapat mengganggu fungsi respirasi ikan. Kondisi ini sering berkaitan dengan kualitas lingkungan dan pemeliharaan yang kurang optimal.",
    symptoms: [
      "Ikan tampak megap-megap di permukaan",
      "Ikan terlihat lemah",
      "Insang mengalami perubahan warna",
      "Material atau lendir dapat menutupi bagian insang",
    ],
    treatment:
      "Perbaiki kualitas air, aerasi, dan kondisi pemeliharaan. Chloramine-T dapat digunakan pada kondisi dan spesies yang sesuai dengan tetap memperhatikan dosis serta ketentuan penggunaan yang berlaku.",
    color: "from-orange-500/20 to-yellow-500/20",
    badgeColor: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },

  {
    id: 3,
    name: "Bacterial Red Disease",
    latin: "Berbagai bakteri Gram-negatif",
    type: "Bakteri",
    desc:
      "Bacterial Red Disease merupakan kategori penyakit bakterial yang ditandai dengan kemerahan, lesi, dan pendarahan pada tubuh ikan. Kondisi ini dapat melibatkan berbagai bakteri Gram-negatif dan tidak terbatas pada satu spesies bakteri tertentu.",
    symptoms: [
      "Area kemerahan pada permukaan tubuh",
      "Lesi atau luka pada kulit",
      "Pendarahan pada bagian tubuh",
      "Pada kondisi sistemik dapat terjadi pembengkakan abdomen atau mata",
    ],
    treatment:
      "Pisahkan ikan yang menunjukkan gejala, perbaiki kualitas air dan sanitasi kolam, serta kurangi stres dan kepadatan berlebih. Identifikasi penyebab sebaiknya dilakukan sebelum menentukan terapi antimikroba yang sesuai.",
    color: "from-red-600/20 to-rose-600/20",
    badgeColor: "bg-red-600/10 text-red-600 dark:text-red-400",
  },

  {
    id: 4,
    name: "Epizootic Ulcerative Syndrome (EUS)",
    latin: "Aphanomyces invadans",
    type: "Oomycete",
    desc:
      "Epizootic Ulcerative Syndrome (EUS) merupakan penyakit ulseratif yang berkaitan dengan Aphanomyces invadans. Lesi dapat berkembang dari bercak kemerahan menjadi luka dalam dan nekrosis jaringan hingga lapisan otot.",
    symptoms: [
      "Bercak kemerahan pada kulit",
      "Lesi ulseratif atau luka terbuka",
      "Nekrosis atau kematian jaringan",
      "Pada kondisi lanjut luka dapat menembus lapisan otot",
    ],
    treatment:
      "Belum tersedia pengobatan kuratif yang efektif untuk ikan yang telah terinfeksi berat. Perbaiki kualitas air, pisahkan ikan terinfeksi, serta lakukan pengelolaan kolam melalui penggunaan garam atau pengapuran sesuai kondisi budidaya.",
    color: "from-purple-600/20 to-indigo-600/20",
    badgeColor: "bg-purple-600/10 text-purple-600 dark:text-purple-400",
  },

  {
    id: 5,
    name: "Saprolegniasis",
    latin: "Saprolegnia spp.",
    type: "Oomycete",
    desc:
      "Saprolegniasis ditandai dengan pertumbuhan miselium berwarna putih hingga abu-abu menyerupai kapas pada permukaan tubuh, sirip, atau jaringan ikan yang mengalami luka.",
    symptoms: [
      "Pertumbuhan seperti kapas putih atau abu-abu",
      "Miselium menempel pada tubuh atau sirip",
      "Dapat muncul pada bagian kulit yang terluka",
      "Ikan dapat menjadi lemah dan mengalami ulserasi kulit",
    ],
    treatment:
      "Perbaiki kualitas lingkungan dan kurangi kondisi yang memicu luka atau stres. NaCl dapat digunakan sebagai salah satu tindakan pengendalian pada kondisi budidaya tertentu dengan konsentrasi yang disesuaikan terhadap spesies dan sistem pemeliharaan.",
    color: "from-gray-500/20 to-slate-500/20",
    badgeColor: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
  },

  {
    id: 6,
    name: "Parasitic Diseases",
    latin: "Berbagai jenis parasit",
    type: "Parasit",
    desc:
      "Dalam penelitian ini, Parasitic Diseases digunakan sebagai kategori umum sesuai pelabelan pada dataset sumber dan tidak merujuk pada satu spesies atau genus parasit tertentu. Manifestasi klinis dapat berbeda tergantung jenis parasit yang menginfeksi.",
    symptoms: [
      "Lendir berlebih pada permukaan tubuh",
      "Iritasi atau lesi pada kulit, sirip, maupun insang",
      "Ikan dapat menggosokkan tubuh ke permukaan benda atau flashing",
      "Pada beberapa jenis infeksi dapat terlihat organisme yang menempel pada tubuh ikan",
    ],
    treatment:
      "Penanganan harus disesuaikan dengan jenis parasit yang menginfeksi. Pisahkan ikan yang menunjukkan gejala, perbaiki kualitas air dan sanitasi, serta lakukan pemeriksaan kulit, sirip, atau insang sebelum menentukan terapi antiparasit yang sesuai.",
    color: "from-blue-500/20 to-cyan-500/20",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },

  {
    id: 7,
    name: "White Tail Disease",
    latin: "Label kelas pada dataset sumber",
    type: "Kategori Dataset",
    desc:
      "Dalam penelitian ini, White Tail Disease digunakan sebagai kategori diagnostik sesuai dengan pelabelan pada dataset sumber. Kelas ini dipertahankan sebagai label visual pada model dan tidak merujuk secara spesifik pada satu agen penyebab tanpa pemeriksaan lebih lanjut.",
    symptoms: [
      "Perubahan visual pada bagian ekor atau area kaudal",
      "Kelainan warna atau kondisi jaringan pada bagian ekor",
      "Karakteristik visual mengikuti pola citra pada dataset sumber",
      "Diagnosis etiologis tetap memerlukan pemeriksaan lanjutan",
    ],
    treatment:
      "Pisahkan ikan yang menunjukkan kelainan dari populasi sehat bila memungkinkan, perbaiki kualitas air dan sanitasi lingkungan budidaya, serta lakukan pemeriksaan lebih lanjut untuk menentukan penyebab sebelum memberikan terapi spesifik.",
    color: "from-indigo-500/20 to-blue-600/20",
    badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  },

  {
    id: 8,
    name: "Healthy Fish",
    latin: "Kondisi normal",
    type: "Normal",
    desc:
      "Healthy Fish merupakan kategori ikan yang tidak menunjukkan anomali visual penyakit. Ikan tampak aktif dan responsif, warna tubuh terlihat normal, serta kondisi tubuh, insang, sisik, dan sirip tidak menunjukkan kelainan yang jelas.",
    symptoms: [
      "Aktivitas berenang normal dan responsif",
      "Warna tubuh tampak cerah dan normal",
      "Tidak terlihat bercak atau pendarahan",
      "Tubuh, insang, sisik, dan sirip tidak menunjukkan kelainan visual",
    ],
    treatment:
      "Pertahankan kualitas air, kepadatan pemeliharaan yang sesuai, nutrisi yang mencukupi, serta sanitasi lingkungan budidaya. Lakukan pemantauan kondisi ikan secara berkala untuk mencegah berkembangnya faktor stres dan penyakit oportunistik.",
    color: "from-emerald-500/20 to-green-500/20",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
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