"use client";
import { useEffect, useState } from "react";

// Penunjuk halaman yang sedang dibaca (berdasarkan posisi scroll).
export default function Progress({ total }) {
  const [cur, setCur] = useState(1);

  useEffect(() => {
    const els = document.querySelectorAll("[data-p]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setCur(Number(e.target.dataset.p));
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return <div className="prog">{cur} / {total}</div>;
}
