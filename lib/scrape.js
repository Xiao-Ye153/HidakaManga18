import * as cheerio from "cheerio";

export const BASE = "https://3hentai.net";
export const UA =
  "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36";

async function getHtml(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, "Accept-Language": "en-US,en;q=0.9" },
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`Situs sumber balas status ${res.status}`);
  return res.text();
}

/* ---------- Listing (beranda dan search) ---------- */

export const SORTS = ["popular-24h", "popular-7d", "popular"];

function parseListing(html) {
  const $ = cheerio.load(html);
  const sections = [];

  const readCard = (el) => {
    const card = $(el);
    const link = card.find("a.cover").attr("href") || "";
    const lang = (card.attr("class") || "").match(/flag-(\w+)/);
    return {
      id: link.split("/").pop() || link,
      url: link,
      title: card.find(".title").first().text().trim(),
      thumb: card.find("img.lazy").attr("data-src") || null,
      pages: Number(card.find(".nb-imgs").attr("data-nb-imgs")) || null,
      lang: lang ? lang[1] : null,
    };
  };

  $(".listing-container").each((_, box) => {
    const name = $(box).prevAll("h1, h2").first().text().trim() || "Daftar";
    const items = $(box).find(".doujin").map((_, el) => readCard(el)).get();
    if (items.length) sections.push({ name, items });
  });

  // Cadangan kalau halaman tidak pakai .listing-container
  if (!sections.length) {
    const items = $(".doujin").map((_, el) => readCard(el)).get();
    if (items.length) sections.push({ name: "Hasil", items });
  }

  const pageLinks = $(".pagination .page-link")
    .map((_, a) => ({ text: $(a).text().trim(), href: $(a).attr("href") || "" }))
    .get()
    .filter((l) => l.href);

  const nums = pageLinks.map((l) => parseInt(l.text)).filter((n) => !isNaN(n));
  const cur = parseInt($(".pagination .page-item.active").first().text());
  if (!isNaN(cur)) nums.push(cur);

  const m = $("#main-content").text().match(/([\d.,]+)\s+results?/i);

  return {
    sections,
    totalPages: nums.length ? Math.max(...nums) : 1,
    total: m ? m[1] : null,
    pageLinks,
  };
}

// Cari URL halaman ke-N dari tautan pagination yang tampil di halaman 1.
export function pageUrl(links, page) {
  const exact = links.find((l) => l.text === String(page));
  if (exact) return new URL(exact.href, BASE).toString();

  for (const l of links) {
    if (!/^\d+$/.test(l.text)) continue;
    const n = l.text;
    const abs = new URL(l.href, BASE).toString();
    const re1 = new RegExp(`([?&]page=)${n}(?=&|$)`);
    if (re1.test(abs)) return abs.replace(re1, (m, p1) => p1 + page);
    const re2 = new RegExp(`/${n}(?=[?#]|$)`);
    if (re2.test(abs)) return abs.replace(re2, "/" + page);
  }
  return null;
}

export async function getListing({ q = "", page = 1, sort = "" }) {
  if (!q) {
    const url = page > 1 ? `${BASE}/${page}` : BASE;
    return parseListing(await getHtml(url));
  }

  const u = new URL(`${BASE}/search`);
  u.searchParams.set("q", q);
  if (SORTS.includes(sort)) u.searchParams.set("sort", sort);

  const first = parseListing(await getHtml(u.toString()));
  if (page <= 1) return first;

  const target = pageUrl(first.pageLinks, page);
  if (!target) {
    return { sections: [], totalPages: first.totalPages, total: first.total, pageLinks: [] };
  }
  const res = parseListing(await getHtml(target));
  return { ...res, total: first.total, totalPages: Math.max(res.totalPages, first.totalPages) };
}

/* ---------- Detail dan reader ---------- */

// Halaman baca menyimpan daftar file gambar di variabel readerPages (base64 JSON).
async function getReaderData(id) {
  try {
    const html = await getHtml(`${BASE}/d/${id}/1`);
    const m = html.match(/var readerPages = JSON\.parse\(atob\("([^"]+)"\)\)/);
    if (!m) return null;
    return JSON.parse(Buffer.from(m[1], "base64").toString("utf8"));
  } catch {
    return null;
  }
}

export async function getGallery(id) {
  const html = await getHtml(`${BASE}/d/${id}`);
  const $ = cheerio.load(html);

  const title = $("#main-info h1").first().text().trim();
  if (!title) throw new Error("Galeri tidak ditemukan");

  const groups = [];
  $("#main-info .tag-container").each((_, el) => {
    const label = $(el).children(".font-weight-bold").first().text().replace(":", "").trim();
    const tags = $(el)
      .find("a.name")
      .map((_, a) => ({
        name: $(a).text().trim(),
        href: $(a).attr("href") || "",
      }))
      .get();
    if (label && tags.length) groups.push({ label, tags });
  });

  const time = $("#main-info time").first().text().trim();
  const cover = $(".main-cover img").first().attr("data-src") || null;

  const thumbs = $("#thumbnail-gallery .single-thumb")
    .map((_, el) => {
      const href = $(el).find("a").attr("href") || "";
      return {
        n: parseInt(href.split("/").pop()),
        thumb: $(el).find("img.lazy").attr("data-src") || null,
      };
    })
    .get()
    .filter((t) => t.n >= 1);

  const reader = await getReaderData(id);

  const pages = thumbs.map((t) => {
    let img = null;
    const info = reader && reader.pages && reader.pages[String(t.n)];
    if (info && reader.baseUriImg) {
      img = reader.baseUriImg.replace("%s", info.f);
    } else if (t.thumb) {
      // cadangan: 1t.jpg menjadi 1.jpg
      img = t.thumb.replace(/(\d+)t\.(\w+)$/, "$1.$2");
    }
    return { n: t.n, thumb: t.thumb, img, w: info ? info.w : null, h: info ? info.h : null };
  });

  return { id, title, groups, time, cover: cover || (thumbs[0] && thumbs[0].thumb) || null, pages };
}

// Ubah tautan tag situs asli menjadi kata kunci search di web kita.
export function tagQuery(href, name) {
  try {
    const u = new URL(href, BASE);
    if (u.pathname === "/search") return u.searchParams.get("q") || name;
    if (u.pathname.startsWith("/tags/")) return `tag:"${name}"`;
  } catch {}
  return name;
}
