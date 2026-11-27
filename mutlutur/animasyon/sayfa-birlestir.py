"""Ekran kaydındaki kaydırma karelerini tek uzun sayfa görüntüsünde birleştirir.

Kullanım: python3 sayfa-birlestir.py kayit.mov baslangic bitis cikti.jpg [--ilk-sabit Y]
  - Her kare, bir öncekine göre ne kadar kaydığı ölçülerek tuvale yerleştirilir.
  - Aynı satır birden çok karede görünüyorsa EN SON kare kazanır (geç yüklenen
    fotoğraflar ve yavaş beliren yazılar böylece tam hâliyle kalır).
  - --ilk-sabit Y: tuvalin ilk Y pikseli yalnızca ilk kareden alınır
    (arka planında video oynayan üst bölüm için, dikiş izi olmasın diye).
Çıktı: birleşik sayfa (750 px genişlik) + her karenin kaydırma konumu (JSON).
"""
import json, subprocess, sys
import numpy as np
from PIL import Image

kayit, bas, bit, cikti = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4]
ilk_sabit = int(sys.argv[sys.argv.index("--ilk-sabit") + 1]) if "--ilk-sabit" in sys.argv else 0

W, H = 750, 1624
UST, ALT = 88, 1360          # durum çubuğu altı .. tarayıcı çubuğu üstü
FPS = 30
# WhatsApp butonu (sayfa en üstteyken bulunduğu yer) — bu bölge güvenilmez sayılır
WA = (20, 1140, 190, 1330)

ham = subprocess.run(["ffmpeg", "-loglevel", "error", "-ss", str(bas), "-i", kayit, "-t", str(bit - bas),
                      "-vf", f"fps={FPS}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                     capture_output=True, check=True).stdout
kareler = np.frombuffer(ham, np.uint8).reshape(-1, H, W, 3)
n = len(kareler)

def gri(k):
    g = k[UST:ALT, 200:740].astype(np.float32).mean(2)
    return g[::2, ::2]

# Ardışık kareler arası kayma (piksel, aşağı kaydırma pozitif)
konum = [0]
onceki = gri(kareler[0])
for i in range(1, n):
    simdi = gri(kareler[i])
    h = onceki.shape[0]
    en_iyi, en_d = 1e9, 0
    for d in range(0, 260):               # yarım çözünürlükte 0..520 px
        a = onceki[d:h]; b = simdi[0:h - d]
        if len(a) < 120: break
        hata = np.abs(a - b).mean()
        if hata < en_iyi: en_iyi, en_d = hata, d
    konum.append(konum[-1] + en_d * 2)
    onceki = simdi

yukseklik = konum[-1] + (ALT - UST)
tuval = np.zeros((yukseklik, W, 3), np.uint8)
dolu = np.zeros(yukseklik, bool)
# İlk karede WhatsApp'ın kapattığı pikseller: sonraki karelerden ilk temiz görüntüyle doldurulur
wa_bos = np.zeros((yukseklik, W), bool)
wa_bos[WA[1] - UST:WA[3] - UST, WA[0]:WA[2]] = True
for i, k in enumerate(kareler):
    y0 = konum[i]
    parca = k[UST:ALT].copy()
    gecerli = np.ones((ALT - UST, W), bool)
    gecerli[WA[1] - UST:WA[3] - UST, WA[0]:WA[2]] = False
    for satir in range(ALT - UST):
        ty = y0 + satir
        m = gecerli[satir]
        if ty < ilk_sabit and i > 0:
            bos = wa_bos[ty] & m
            if bos.any():
                tuval[ty][bos] = parca[satir][bos]; wa_bos[ty][bos] = False
            continue
        if not dolu[ty]:
            tuval[ty] = parca[satir]; dolu[ty] = True
        else:
            tuval[ty][m] = parca[satir][m]

Image.fromarray(tuval).save(cikti, quality=92)
json.dump({"kare_konum": konum, "fps": FPS, "bas": bas, "yukseklik": yukseklik},
          open(cikti.rsplit(".", 1)[0] + ".json", "w"))
print(cikti, "kare:", n, "yükseklik:", yukseklik)
