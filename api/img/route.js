import { BASE, UA } from "../../../lib/scrape";

export const runtime = "nodejs";

async function tryFetch(target, referer) {
  const headers = {
    "User-Agent": UA,
    Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
  };
  if (referer) headers.Referer = referer;
  return fetch(target, { headers });
}

export async function GET(req) {
  const sp = new URL(req.url).searchParams;
  const u = sp.get("u");
  const debug = sp.get("debug");

  let target;
  try {
    target = new URL(u);
  } catch {
    return new Response("URL salah", { status: 400 });
  }
  if (target.protocol !== "https:" || !/(^|\.)3hentai\.net$/.test(target.hostname)) {
    return new Response("Dilarang", { status: 403 });
  }

  // Coba dengan referer situs asli, kalau gagal coba tanpa referer.
  const attempts = [BASE + "/", null];
  const log = [];
  for (const ref of attempts) {
    try {
      const r = await tryFetch(target, ref);
      log.push({ referer: ref, status: r.status, type: r.headers.get("content-type") });
      if (r.ok && (r.headers.get("content-type") || "").startsWith("image")) {
        if (debug) return Response.json({ ok: true, log });
        return new Response(r.body, {
          headers: {
            "Content-Type": r.headers.get("content-type"),
            "Cache-Control": "public, max-age=86400, s-maxage=86400",
          },
        });
      }
    } catch (e) {
      log.push({ referer: ref, error: e.message });
    }
  }
  if (debug) return Response.json({ ok: false, log });
  return new Response("Gagal ambil gambar", { status: 502 });
}
