// Yat tanıtım PDF'i: /brosur/<yat-adresi>.pdf — yat sayfasındaki güncel bilgilerden anında üretilir.
import { getBoatBySlug, getContact } from "@/lib/content";
import { buildBrochure } from "@/lib/brochure";

export const runtime = "nodejs";
export const revalidate = 3600;

async function bytes(url: string): Promise<Uint8Array | null> {
  try {
    const r = await fetch(url, { next: { revalidate: 86400 } });
    return r.ok ? new Uint8Array(await r.arrayBuffer()) : null;
  } catch {
    return null;
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const slug = file.replace(/\.pdf$/i, "");
  const lang = new URL(req.url).searchParams.get("lang") === "en" ? "en" : "tr";
  const [{ boat }, contact] = await Promise.all([getBoatBySlug(slug, lang), getContact()]);
  if (!boat) return new Response("Bulunamadı", { status: 404 });

  const abs = (p: string) => new URL(p, req.url).toString();
  const [light, regular, medium, bold, logo, ...photos] = await Promise.all([
    bytes(abs("/fonts/Poppins-Light.ttf")), bytes(abs("/fonts/Poppins-Regular.ttf")), bytes(abs("/fonts/Poppins-Medium.ttf")), bytes(abs("/fonts/Poppins-Bold.ttf")),
    bytes(abs("/logo.png")),
    ...(boat.images ?? []).slice(0, 13).map((p) => bytes(abs(p))),
  ]);
  let fontkit: unknown = null;
  try { fontkit = (await import("@pdf-lib/fontkit")).default; } catch { fontkit = null; }
  const fonts = light && regular && medium && bold ? { light, regular, medium, bold } : null;

  const pdf = await buildBrochure(boat, contact, { fonts, fontkit, logo, photos: photos.filter((p): p is Uint8Array => Boolean(p)) }, lang);
  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${slug}-yatpaketi.pdf"`,
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
