"use client";

import { useRef, useState } from "react";
import { PortalUpload } from "./PortalUpload";

// Sözleşmeyi görüntüleme/indirme ve imzalı hâlini yükleme. İndirmeye basınca yükleme alanı vurgulanır.
export function ContractSection({ viewUrl, downloadUrl, signedAt }: { viewUrl: string | null; downloadUrl: string | null; signedAt: string | null }) {
  const [downloaded, setDownloaded] = useState(false);
  const upload = useRef<HTMLDivElement>(null);

  function onDownload() {
    setDownloaded(true);
    setTimeout(() => upload.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 400);
  }

  if (!viewUrl) return <p className="mt-3 text-sm text-navy/65">Sözleşmeniz hazırlandığında burada görünecek.</p>;

  return (
    <div>
      <p className="mt-3 flex flex-wrap gap-2">
        <a href={viewUrl} target="_blank" rel="noopener" className="inline-block rounded-xl border border-navy/15 px-4 py-2.5 text-sm font-semibold text-navy">Görüntüle</a>
        {downloadUrl && <a href={downloadUrl} onClick={onDownload} className="inline-block rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white">İndir</a>}
      </p>

      {downloaded && (
        <p role="status" className="mt-3 rounded-xl bg-green-50 p-3 text-sm font-medium text-green-800 ring-1 ring-green-200">
          İndirme başlatıldı. Dosya telefonunuzda <b>Dosyalar</b> uygulamasının İndirilenler klasöründe görünür. İmzaladıktan sonra imzalı hâlini aşağıdan yükleyin.
        </p>
      )}

      <div ref={upload} className={`mt-5 rounded-2xl p-4 transition ${downloaded && !signedAt ? "bg-turquoise/10 ring-2 ring-turquoise" : "bg-mist"}`}>
        <p className="mb-1 text-sm font-semibold text-navy">İmzalı sözleşmeyi yükleyin</p>
        {signedAt ? (
          <p className="mb-3 rounded-xl bg-green-50 p-3 text-sm font-medium text-green-800">İmzalı sözleşmeniz alındı ({new Date(signedAt).toLocaleDateString("tr-TR")}). İsterseniz yeniden yükleyebilirsiniz.</p>
        ) : (
          <p className="mb-3 text-sm text-navy/70">Sözleşmeyi imzalayın (parmakla işaretleyebilir ya da çıktı alıp imzalayıp fotoğrafını çekebilirsiniz), sonra buradan PDF veya fotoğraf olarak yükleyin.</p>
        )}
        <PortalUpload replace={Boolean(signedAt)} />
      </div>
    </div>
  );
}
