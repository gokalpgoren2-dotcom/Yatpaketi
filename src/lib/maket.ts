// 360° görünüm ve etkileşimli plan (maket) bulunan yatlar.
// Dosyalar public/maket/<slug>/ altında durur. Yeni yatlar ortak görüntüleyiciyi (viewer.html + config.json) kullanır.
export type Maket = { cover: string; cabins: number; src: string; bg: string };

export const MAKET: Record<string, Maket> = {
  "queen-atlantis": { cover: "/maket/queen-atlantis/f1.jpg", cabins: 8, src: "/maket/queen-atlantis/index.html?embed=1", bg: "#8998aa" },
  angels: { cover: "/maket/angels/f2.jpg", cabins: 6, src: "/maket/viewer.html?yat=angels&embed=1", bg: "#1d2c42" },
  "all-about-u-2": { cover: "/maket/all-about-u-2/f1.jpg", cabins: 6, src: "/maket/viewer.html?yat=all-about-u-2&embed=1", bg: "#8e7a7c" },
  "lycian-dream": { cover: "/maket/lycian-dream/f2.jpg", cabins: 6, src: "/maket/viewer.html?yat=lycian-dream&embed=1", bg: "#5d7a99" },
};

export const hasMaket = (slug: string) => Object.prototype.hasOwnProperty.call(MAKET, slug);
