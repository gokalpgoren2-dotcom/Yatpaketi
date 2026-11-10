// 360° görünüm ve etkileşimli plan (maket) bulunan yatlar.
// Her yatın dosyaları public/maket/<slug>/ altında durur; yeni yat eklemek için buraya bir satır yeterli.
export const MAKET: Record<string, { cover: string; cabins: number }> = {
  "queen-atlantis": { cover: "/maket/queen-atlantis/f1.jpg", cabins: 8 },
};

export const hasMaket = (slug: string) => Object.prototype.hasOwnProperty.call(MAKET, slug);
