"use client";
import { useEffect, useState } from "react";

export default function AgeGate() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem("h18_ok") !== "1") setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="gate">
      <div className="gate-box">
        <h2>Konten dewasa</h2>
        <p>Situs ini isinya manga dewasa. Masuk hanya kalau umur lu sudah 18 tahun atau lebih.</p>
        <div className="row">
          <button
            onClick={() => {
              try { localStorage.setItem("h18_ok", "1"); } catch {}
              setShow(false);
            }}
          >
            Umur gue 18+
          </button>
          <a href="https://www.google.com">Keluar</a>
        </div>
      </div>
    </div>
  );
}
