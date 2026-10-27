import Link from "next/link";
import { getListing } from "../lib/scrape";
import Header from "./Header";
import Thumb from "./Thumb";

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
      <Header q={q} />

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
