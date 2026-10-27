import Link from "next/link";
import { getListing, SORTS } from "../lib/scrape";
import Header from "./Header";
import Thumb from "./Thumb";

export const dynamic = "force-dynamic";

function href(q, page, sort) {
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  if (q && sort) p.set("sort", sort);
  if (page > 1) p.set("page", String(page));
  const s = p.toString();
  return s ? `/?${s}` : "/";
}

const SECTION_NAMES = {
  "Popular Hentai at the moment": "Populer",
  "Newest hentai": "Terbaru",
};

const SORT_LABELS = [
  ["", "Terbaru"],
  ["popular-24h", "Populer hari ini"],
  ["popular-7d", "Populer minggu ini"],
  ["popular", "Populer semua"],
];

export default async function Home({ searchParams }) {
  const sp = await searchParams;
  const q = (sp?.q || "").toString().trim();
  const page = Math.max(1, parseInt(sp?.page) || 1);
  const sortRaw = (sp?.sort || "").toString();
  const sort = SORTS.includes(sortRaw) ? sortRaw : "";

  let data = null;
  let error = null;
  try {
    data = await getListing({ q, page, sort });
  } catch (e) {
    error = e.message;
  }

  return (
    <>
      <Header q={q} />

      <main className="wrap">
        {q && (
          <div className="sorts">
            {SORT_LABELS.map(([val, label]) => (
              <Link
                key={val || "recent"}
                href={href(q, 1, val)}
                className={val === sort ? "on" : ""}
              >
                {label}
              </Link>
            ))}
          </div>
        )}

        {error && <p className="note">Gagal ambil data: {error}</p>}

        {data && data.sections.length === 0 && !error && (
          <p className="note">
            Tidak ada hasil.
            {q && <> Contoh kata kunci: tag:&quot;sole female&quot; pages:&gt;20 -milf</>}
          </p>
        )}

        {data?.sections.map((sec) => (
          <section key={sec.name}>
            <h2 className="sec">
              {q
                ? `Hasil untuk "${q}"${data.total ? ` (${data.total} hasil)` : ""}`
                : SECTION_NAMES[sec.name] || sec.name}
            </h2>
            <div className="grid">
              {sec.items.map((it) => (
                <Link key={sec.name + it.id} className="card" href={`/d/${it.id}`}>
                  <div className="thumb">
                    {it.thumb && <Thumb src={it.thumb} />}
                  </div>
                  <div className="ttl">{it.title}</div>
                  <div className="meta">
                    {[it.lang && it.lang.toUpperCase(), it.pages && `${it.pages} hlm`]
                      .filter(Boolean)
                      .join(" / ")}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {data && data.totalPages > 1 && (
          <nav className="pager">
            {page > 1 ? <Link href={href(q, page - 1, sort)}>Sebelumnya</Link> : <span className="off">.</span>}
            <span>{page} / {data.totalPages}</span>
            {page < data.totalPages ? <Link href={href(q, page + 1, sort)}>Berikutnya</Link> : <span className="off">.</span>}
          </nav>
        )}

        <p className="foot">HidakaManga18, dibuat oleh Hidaka401</p>
      </main>
    </>
  );
}
