import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../Header";
import Thumb from "../../Thumb";
import DownloadAll from "../../DownloadAll";
import { getGallery, tagQuery } from "../../../lib/scrape";

export const dynamic = "force-dynamic";

const LABELS = {
  Categories: "Kategori",
  Series: "Series",
  Characters: "Karakter",
  Tags: "Tag",
};

export default async function Detail({ params }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  let g;
  try {
    g = await getGallery(id);
  } catch (e) {
    return (
      <>
        <Header />
        <main className="wrap">
          <p className="note">Gagal ambil data: {e.message}</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="wrap">
        <div className="detail">
          <div className="dcover">
            <div className="thumb">{g.cover && <Thumb src={g.cover} />}</div>
          </div>

          <div className="dinfo">
            <h1 className="dtitle">{g.title}</h1>
            <p className="meta">
              {[`d${id}`, `${g.pages.length} hlm`, g.time].filter(Boolean).join(" / ")}
            </p>

            {g.groups.map((gr) => (
              <div key={gr.label} className="grp">
                <span className="glabel">{LABELS[gr.label] || gr.label}</span>
                <div className="chips">
                  {gr.tags.map((t) => (
                    <Link
                      key={t.href + t.name}
                      className="chip"
                      href={`/?q=${encodeURIComponent(tagQuery(t.href, t.name))}`}
                    >
                      {t.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            <Link href={`/d/${id}/read`} className="readbtn">
              Baca (scroll ke bawah)
            </Link>

            <DownloadAll
              id={id}
              title={g.title}
              pages={g.pages.filter((p) => p.img).map((p) => ({ n: p.n, img: p.img }))}
            />
          </div>
        </div>

        <h2 className="sec">Halaman</h2>
        <div className="grid thumbs">
          {g.pages.map((p) => (
            <Link key={p.n} className="card" href={`/d/${id}/read#p${p.n}`}>
              <div className="thumb">{p.thumb && <Thumb src={p.thumb} />}</div>
              <div className="meta">{p.n}</div>
            </Link>
          ))}
        </div>

        <p className="foot">HidakaManga18, dibuat oleh Hidaka401</p>
      </main>
    </>
  );
}
