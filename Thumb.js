"use client";
import { useEffect, useRef, useState } from "react";

// Urutan percobaan: langsung dari browser tanpa referrer, lalu lewat proxy sendiri.
export default function Thumb({ src }) {
  const [step, setStep] = useState(0);
  const ref = useRef(null);
  const urls = [src, `/api/img?u=${encodeURIComponent(src)}`];

  // Kalau gambar sudah gagal sebelum React aktif, onError tidak kepanggil.
  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) setStep((s) => s + 1);
  }, []);

  if (step > 1) return <div className="nothumb">Gambar gagal dimuat</div>;

  return (
    <img
      ref={ref}
      key={step}
      loading="lazy"
      referrerPolicy="no-referrer"
      src={urls[step]}
      alt=""
      onError={() => setStep((s) => s + 1)}
    />
  );
}
