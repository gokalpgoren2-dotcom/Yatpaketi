"use client";

import { useRef, useState } from "react";
import { PortalUpload } from "./PortalUpload";

function Step({ n, done, title, children }: { n: number; done?: boolean; title: string; children?: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${done ? "bg-emerald-500 text-white" : "bg-navy text-white"}`}>{done ? "✓" : n}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-navy">{title}</p>
        {children}
      </div>
    </li>
  );
}

// Sözleşmeyi görüntüleme/indirme ve imzalı hâlini yükleme. İndirmeye basınca yükleme alanı vurgulanır.
export function ContractSection({ viewUrl, downloadUrl, signedAt }: { viewUrl: string | null; downloadUrl: string | null; signedAt: string | null }) {
  const [downloaded, setDownloaded] = useState(false);
  const upload = useRef<HTMLDivElement>(null);

  function onDownload() {
    setDownloaded(true);
    setTimeout(() => upload.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 400);
  }

  if (!viewUrl) return <p className="mt-4 rounded-2xl bg-mist p-4 text-sm text-navy/70 ring-1 ring-navy/5">Sözleşmeniz hazırlandığında burada görünecek. Hazır olunca size e-posta ile haber veririz.</p>;

  return (
    <div className="mt-4">
      <ol className="space-y-5">
        <Step n={1} done={downloaded || Boolean(signedAt)} title="Sözleşmeyi inceleyin ve indirin">
          <div className="mt-2 flex flex-wrap gap-2">
            <a href={viewUrl} target="_blank" rel="noopener" className="inline-block rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-sm font-semibold text-navy">Görüntüle</a>
            {downloadUrl && <a href={downloadUrl} onClick={onDownload} className="inline-block rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white">İndir</a>}
          </div>
          {downloaded && (
            <p role="status" className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-800 ring-1 ring-emerald-100">
              İndirme başlatıldı. Dosya telefonunuzda <b>Dosyalar</b> uygulamasının İndirilenler klasöründe görünür.
            </p>
          )}
        </Step>
        <Step n={2} done={Boolean(signedAt)} title="İmzalayın">
          <p className="mt-1 text-sm text-navy/65">Parmakla işaretleyebilir ya da çıktı alıp imzalayıp fotoğrafını çekebilirsiniz.</p>
        </Step>
        <Step n={3} done={Boolean(signedAt)} title="İmzalı sözleşmeyi yükleyin">
          <div ref={upload} className={`mt-2 rounded-2xl p-4 transition ${downloaded && !signedAt ? "bg-turquoise/10 ring-2 ring-turquoise" : "bg-mist ring-1 ring-navy/5"}`}>
            {signedAt && (
              <p className="mb-3 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-800 ring-1 ring-emerald-100">İmzalı sözleşmeniz alındı ({new Date(signedAt).toLocaleDateString("tr-TR")}). İsterseniz yeniden yükleyebilirsiniz.</p>
            )}
            <PortalUpload replace={Boolean(signedAt)} />
          </div>
        </Step>
      </ol>
    </div>
  );
}
