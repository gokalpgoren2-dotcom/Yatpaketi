"use client";

import Image from "next/image";
import { useState } from "react";

// next/image ile gösterir; optimizasyon başarısız olursa fotoğrafı doğrudan adresinden yükler.
// Üst öğe "relative" olmalıdır.
export function Photo({ src, alt, sizes, className = "", priority = false, quality = 90 }: { src: string; alt: string; sizes: string; className?: string; priority?: boolean; quality?: number }) {
  const [raw, setRaw] = useState(false);
  if (raw) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} loading={priority ? "eager" : "lazy"} className={`absolute inset-0 h-full w-full ${className}`} />;
  }
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} quality={quality} className={className} onError={() => setRaw(true)} />;
}
