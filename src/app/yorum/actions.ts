"use server";

import { portalDb } from "@/lib/portal";

export type ReviewRequestInfo = { boat_name: string; customer_name: string | null; used: boolean; expired: boolean };

const okToken = (t: string) => /^[a-f0-9]{48}$/.test(t);

export async function getReviewRequest(token: string): Promise<ReviewRequestInfo | null> {
  if (!okToken(token)) return null;
  const { data, error } = await portalDb().rpc("review_request_get", { p_token: token });
  if (error || !data) return null;
  return data as ReviewRequestInfo;
}

export async function startReviewPhoto(token: string): Promise<{ path?: string; error?: string }> {
  if (!okToken(token)) return { error: "Bağlantı geçersiz." };
  const { data, error } = await portalDb().rpc("review_upload_slot", { p_token: token, p_ext: "jpg" });
  if (error || !data) return { error: "Fotoğraf yüklemesi başlatılamadı." };
  return { path: data as string };
}

export async function submitReview(token: string, name: string, rating: number, body: string, photo: string | null): Promise<{ ok: boolean; error?: string }> {
  if (!okToken(token)) return { ok: false, error: "Bağlantı geçersiz." };
  const { data, error } = await portalDb().rpc("review_submit", { p_token: token, p_name: name, p_rating: rating, p_body: body, p_photo: photo ?? "" });
  if (error || data !== true) return { ok: false, error: "Yorum gönderilemedi. Alanları kontrol edip tekrar deneyin." };
  return { ok: true };
}
