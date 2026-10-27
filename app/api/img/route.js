import { BASE, UA } from "../../../lib/scrape";

export const runtime = "nodejs";

export async function GET(req) {
  const u = new URL(req.url).searchParams.get("u");
  let target;
  try {
    target = new URL(u);
  } catch {
    return new Response("URL salah", { status: 400 });
  }
  // Hanya boleh domain 3hentai.net (biar bukan open proxy)
  if (target.protocol !== "https:" || !/(^|\.)3hentai\.net$/.test(target.hostname)) {
    return new Response("Dilarang", { status: 403 });
  }
  const r = await fetch(target, { headers: { Referer: BASE + "/", "User-Agent": UA } });
  if (!r.ok) return new Response("Gagal ambil gambar", { status: 502 });
  return new Response(r.body, {
    headers: {
      "Content-Type": r.headers.get("content-type") || "image/jpeg",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
