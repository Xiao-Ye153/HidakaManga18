import Link from "next/link";
import { getListing } from "../lib/scrape";

export const dynamic = "force-dynamic";

function href(q, page) {
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  if (page > 1) p.set("page", String(page));
  const s = p.toString();
  return s ? `/?${s}` : "/";
}

const SECTION_NAMES = {
  "Popular Hentai at the moment": "Populer",
  "Newest hentai": "Terbaru",
};

export default async function Home({ searchParams }) {
  const sp = await searchParams;
  const q = (sp?.q || "").toString().trim();
  const page = Math.max(1, parseInt(sp?.page) || 1);

  let data = null;
  let error = null;
  try {
    data = await getListing({ q, page });
  } catch (e) {
    error = e.message;
  }

  return (
    <>
      <header className="bar">
        <div className="bar-in">
          <Link href="/" className="brand">
            Hidaka<b>Manga</b>18
          </Link>
          <form action="/" className="search">
            <input name="q" defaultValue={q} placeholder="Cari judul atau tag" autoComplete="off" />
            <button type="submit">Cari</button>
          </form>
        </div>
      </header>

      <main className="wrap">
        {error && <p className="note">Gagal ambil data: {error}</p>}
        {data && data.sections.length === 0 && !error && (
          <p className="note">Tidak ada hasil.</p>
        )}

        {data?.sections.map((sec) => (
          <section key={sec.name}>
            <h2 className="sec">
              {q ? `Hasil untuk "${q}"` : SECTION_NAMES[sec.name] || sec.name}
            </h2>
            <div className="grid">
              {sec.items.map((it) => (
                <a
                  key={sec.name + it.id}
                  className="card"
                  href={it.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="thumb">
                    {it.thumb && (
                      <img
                        loading="lazy"
                        src={`/api/img?u=${encodeURIComponent(it.thumb)}`}
                        alt=""
                      />
                    )}
                  </div>
                  <div className="ttl">{it.title}</div>
                  <div className="meta">
                    {[it.lang && it.lang.toUpperCase(), it.pages && `${it.pages} hlm`]
                      .filter(Boolean)
                      .join(" / ")}
                  </div>
                </a>
              ))}
            </div>
          </section>
        ))}

        {data && (
          <nav className="pager">
            {page > 1 ? <Link href={href(q, page - 1)}>Sebelumnya</Link> : <span className="off">.</span>}
            <span>{page} / {data.totalPages}</span>
            {page < data.totalPages ? <Link href={href(q, page + 1)}>Berikutnya</Link> : <span className="off">.</span>}
          </nav>
        )}

        <p className="foot">HidakaManga18, dibuat oleh Hidaka401</p>
      </main>
    </>
  );
}
