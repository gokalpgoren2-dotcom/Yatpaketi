// Sayfa geçişlerinde anında görünen hafif iskelet: menüye dokununca ekran donmuş gibi beklemez.
export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite" className="min-h-[70vh]">
      <span className="sr-only">Yükleniyor…</span>
      <div className="fixed inset-x-0 top-0 z-[100] h-[3px] overflow-hidden bg-turquoise/15">
        <div className="h-full w-1/3 animate-[yp-load_1.1s_ease-in-out_infinite] rounded-full bg-turquoise" />
      </div>
      <div className="h-16 bg-navy lg:h-20" />
      <div className="mx-auto max-w-7xl animate-pulse px-5 pt-10 lg:px-8">
        <div className="h-3 w-32 rounded-full bg-navy/10" />
        <div className="mt-4 h-9 w-2/3 max-w-xl rounded-xl bg-navy/10" />
        <div className="mt-8 aspect-[16/9] w-full rounded-3xl bg-navy/[0.07] lg:aspect-[21/9]" />
        <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {Array.from({ length: 6 }, (_, i) => <div key={i} className="h-14 rounded-2xl bg-navy/[0.06]" />)}
        </div>
      </div>
    </div>
  );
}
