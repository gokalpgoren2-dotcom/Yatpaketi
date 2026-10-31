import Image from "next/image";

// Orijinal logo, değiştirilmeden kullanılır (public/logo.png). Beyaz zeminli olduğu için
// beyaz/açık alanlarda gösterilir. Daha net sonuç için yüksek çözünürlüklü/şeffaf PNG veya SVG verin.
export function Logo({ height = 40 }: { height?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="yatpaketi"
      width={573}
      height={143}
      priority
      style={{ height, width: "auto" }}
    />
  );
}
