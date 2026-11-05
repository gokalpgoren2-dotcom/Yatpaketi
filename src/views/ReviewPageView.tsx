import Link from "next/link";
import { Header } from "@/components/Header";
import { ReviewForm } from "@/components/ReviewForm";
import { getReviewRequest } from "@/app/yorum/actions";
import type { Lang } from "@/lib/i18n";

const T = {
  tr: { title: "Yolculuğunuz nasıldı?", sub: (b: string) => `${b || "Turunuz"} hakkındaki yorumunuz, bir sonraki misafirlerimize yol gösterir.`, bad: "Bu bağlantı geçersiz.", badText: "Bağlantıyı e-postanızdan yeniden açmayı deneyin ya da bize yazın.", used: "Bu bağlantı ile zaten yorum gönderildi.", usedText: "Değerli yorumunuz için teşekkür ederiz.", expired: "Bu bağlantının süresi doldu.", expiredText: "Yine de görüşlerinizi duymak isteriz, lütfen bize yazın.", contact: "İletişim sayfası", home: "Ana sayfa", lang: "English" },
  en: { title: "How was your voyage?", sub: (b: string) => `Your review of ${b || "your tour"} helps our next guests.`, bad: "This link is not valid.", badText: "Try opening the link from your email again, or write to us.", used: "A review was already sent with this link.", usedText: "Thank you for your valuable feedback.", expired: "This link has expired.", expiredText: "We'd still love to hear from you, please write to us.", contact: "Contact page", home: "Home", lang: "Türkçe" },
};

export async function ReviewPageView({ lang, token }: { lang: Lang; token: string }) {
  const L = T[lang === "tr" ? "tr" : "en"];
  const info = await getReviewRequest(token);
  const other = lang !== "tr" ? `/yorum/${token}` : `/en/yorum/${token}`;
  const state = !info ? "bad" : info.used ? "used" : info.expired ? "expired" : "ok";
  return (
    <>
      <Header lang={lang} />
      <main className="mx-auto max-w-2xl px-5 pb-20 pt-28 lg:pt-36">
        <p className="text-right text-sm"><Link href={other} className="text-turquoise-dark underline">{L.lang}</Link></p>
        {info && state === "ok" ? (
          <>
            <h1 className="font-display text-4xl font-bold text-navy lg:text-5xl">{L.title}</h1>
            <p className="mt-3 text-lg text-navy/70">{L.sub(info.boat_name)}</p>
            <div className="mt-8 rounded-3xl bg-white p-6 ring-1 ring-navy/10 lg:p-8">
              <ReviewForm token={token} lang={lang} defaultName={info.customer_name ?? ""} />
            </div>
          </>
        ) : (
          <div className="rounded-3xl bg-mist p-8 text-center">
            <h1 className="font-display text-3xl font-bold text-navy">{L[state === "ok" ? "bad" : state]}</h1>
            <p className="mt-3 text-navy/70">{L[(state === "used" ? "usedText" : state === "expired" ? "expiredText" : "badText") as "badText"]}</p>
            <div className="mt-6 flex justify-center gap-3 text-sm font-semibold">
              <Link href={lang !== "tr" ? "/en/iletisim" : "/iletisim"} className="rounded-full bg-turquoise px-5 py-2.5 text-white">{L.contact}</Link>
              <Link href={lang !== "tr" ? "/en" : "/"} className="rounded-full border border-navy/20 px-5 py-2.5 text-navy">{L.home}</Link>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
