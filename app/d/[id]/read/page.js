import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../../Header";
import Thumb from "../../../Thumb";
import Progress from "../../../Progress";
import { getGallery } from "../../../../lib/scrape";

export const dynamic = "force-dynamic";

export default async function ReadScroll({ params }) {
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

  const pages = g.pages.filter((p) => p.img);
  const total = pages.length;

  return (
    <>
      <Header />
      <main className="scroll">
        <div className="rnav">
          <Link href={`/d/${id}`}>Kembali ke daftar</Link>
          <span>{total} hlm</span>
        </div>
        <p className="rtitle">{g.title}</p>

        {pages.map((p) => (
          <div
            key={p.n}
            id={`p${p.n}`}
            data-p={p.n}
            className="spage"
            style={{ aspectRatio: `${p.w || 1280} / ${p.h || 1807}` }}
          >
            <Thumb src={p.img} className="spic" />
          </div>
        ))}

        <div className="rnav end">
          <Link href={`/d/${id}`}>Selesai, kembali ke daftar</Link>
        </div>
      </main>
      <Progress total={total} />
    </>
  );
}
