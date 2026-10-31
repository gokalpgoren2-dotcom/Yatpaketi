"use client";

import { motion } from "motion/react";
import { SearchBar } from "./SearchBar";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-navy">
      {/* Yer tutucu deniz zemini. Gerçek hero fotoğrafı/videosu admin panelinden yüklenecek (Aşama 3-4). */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 80% at 70% 10%, #1bb4c4 0%, rgba(27,180,196,0) 55%), linear-gradient(180deg, #0b3566 0%, #06264b 70%)",
        }}
      />
      <svg className="absolute inset-x-0 bottom-0 -z-10 w-full opacity-30" viewBox="0 0 1440 200" preserveAspectRatio="none" aria-hidden>
        <path d="M0 120c120-40 240-40 360 0s240 40 360 0 240-40 360 0 240 40 360 0v80H0z" fill="#1bb4c4" />
      </svg>

      <div className="mx-auto max-w-7xl px-5 pb-16 pt-32 lg:px-8 lg:pb-24 lg:pt-44">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-turquoise"
        >
          Yat ve Tekne Kiralama
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display max-w-3xl text-4xl font-medium leading-tight text-white sm:text-5xl lg:text-7xl"
        >
          Hayalinizdeki Mavi Yolculuk Burada Başlıyor.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-6 max-w-xl text-base leading-relaxed text-white/80 lg:text-lg"
        >
          Türkiye’nin en özel koylarını ve eşsiz rotalarını, size uygun yat ve tekne seçenekleriyle keşfedin.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-10 lg:mt-14"
        >
          <SearchBar />
        </motion.div>
      </div>
    </section>
  );
}
