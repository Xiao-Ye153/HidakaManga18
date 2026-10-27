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

function parse(html) {
  const $ = cheerio.load(html);
  const sections = [];

  $(".listing-container").each((_, box) => {
    const name = $(box).prevAll("h1, h2").first().text().trim() || "Daftar";
    const items = [];
    $(box)
      .find(".doujin")
      .each((_, el) => {
        const card = $(el);
        const link = card.find("a.cover").attr("href") || "";
        const lang = (card.attr("class") || "").match(/flag-(\w+)/);
        items.push({
          id: link.split("/").pop() || link,
          url: link,
          title: card.find(".title").first().text().trim(),
          thumb: card.find("img.lazy").attr("data-src") || null,
          pages: Number(card.find(".nb-imgs").attr("data-nb-imgs")) || null,
          lang: lang ? lang[1] : null,
        });
      });
    if (items.length) sections.push({ name, items });
  });

  const nums = $(".pagination .page-link")
    .map((_, a) => parseInt($(a).text()))
    .get()
    .filter((n) => !isNaN(n));

  return { sections, totalPages: nums.length ? Math.max(...nums) : 1 };
}

export async function getListing({ q = "", page = 1 }) {
  let url;
  if (q) {
    url = `${BASE}/search?q=${encodeURIComponent(q)}${page > 1 ? `&page=${page}` : ""}`;
  } else {
    url = page > 1 ? `${BASE}/${page}` : BASE;
  }
  return parse(await getHtml(url));
}
