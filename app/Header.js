import Link from "next/link";

export default function Header({ q = "" }) {
  return (
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
  );
}
