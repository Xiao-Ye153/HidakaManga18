import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../../Header";
import Thumb from "../../../Thumb";
import { getGallery } from "../../../../lib/scrape";

export const dynamic = "force-dynamic";

export default async function Reader({ params }) {
  const { id, n } = await params;
  const num = parseInt(n);
  if (!/^\d+$/.test(id) || !(num >= 1)) notFound();

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

  const total = g.pages.length;
  const page = g.pages.find((p) => p.n === num);
  if (!page || !page.img) notFound();

  const prevHref = num > 1 ? `/d/${id}/${num - 1}` : null;
  const nextHref = num < total ? `/d/${id}/${num + 1}` : null;
  const preload = g.pages
    .filter((p) => p.n > num && p.n <= num + 2 && p.img)
    .map((p) => p.img);

  const nav = (
    <nav className="rnav">
      <Link href={`/d/${id}`}>Daftar</Link>
      {prevHref ? <Link href={prevHref}>Sebelumnya</Link> : <span className="off">.</span>}
      <span>{num} / {total}</span>
      {nextHref ? <Link href={nextHref}>Berikutnya</Link> : <span className="off">.</span>}
    </nav>
  );

  return (
    <>
      <Header />
      <main className="reader">
        <p className="rtitle">{g.title}</p>
        {nav}

        <Link href={nextHref || `/d/${id}`} className="rimg">
          <Thumb key={page.img} src={page.img} className="rpic" />
        </Link>

        {nav}

        <div className="hide" aria-hidden="true">
          {preload.map((u) => (
            <img key={u} src={u} alt="" referrerPolicy="no-referrer" />
          ))}
        </div>
      </main>
    </>
  );
}
