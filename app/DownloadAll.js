"use client";
import { useState } from "react";

// Ambil semua halaman lewat proxy sendiri, bungkus jadi ZIP di browser.
export default function DownloadAll({ id, title, pages }) {
  const [st, setSt] = useState({ busy: false, done: 0, fail: 0, msg: "" });
  const total = pages.length;

  async function run() {
    if (st.busy || !total) return;
    setSt({ busy: true, done: 0, fail: 0, msg: "" });

    const { default: JSZip } = await import("jszip");
    const zip = new JSZip();
    const pad = Math.max(3, String(total).length);

    let done = 0;
    let fail = 0;
    let idx = 0;

    async function grab(p) {
      for (let t = 0; t < 3; t++) {
        try {
          const r = await fetch(`/api/img?u=${encodeURIComponent(p.img)}`);
          if (!r.ok) throw new Error("status " + r.status);
          const buf = await r.arrayBuffer();
          const ext = (p.img.match(/\.(\w+)$/) || [])[1] || "jpg";
          zip.file(`${String(p.n).padStart(pad, "0")}.${ext}`, buf);
          return true;
        } catch {
          await new Promise((res) => setTimeout(res, 600 * (t + 1)));
        }
      }
      return false;
    }

    async function worker() {
      while (idx < total) {
        const p = pages[idx++];
        const ok = await grab(p);
        if (ok) done++;
        else fail++;
        setSt({ busy: true, done, fail, msg: "" });
      }
    }

    try {
      await Promise.all([worker(), worker(), worker()]);

      if (done === 0) {
        setSt({ busy: false, done, fail, msg: "Gagal, tidak ada gambar yang berhasil diunduh." });
        return;
      }

      setSt({ busy: true, done, fail, msg: "Membuat file ZIP..." });
      // JPG sudah terkompres, jadi tidak perlu dikompres ulang (lebih cepat dan hemat memori)
      const blob = await zip.generateAsync({ type: "blob", compression: "STORE" });

      const safe =
        title.replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 100) ||
        `d${id}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${safe}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);

      setSt({
        busy: false,
        done,
        fail,
        msg: fail ? `Selesai, ${fail} halaman gagal diunduh.` : "Selesai.",
      });
    } catch (e) {
      setSt({ busy: false, done, fail, msg: "Gagal membuat ZIP: " + e.message });
    }
  }

  return (
    <div className="dl">
      <button type="button" className="dlbtn" onClick={run} disabled={st.busy}>
        {st.busy
          ? st.msg || `Mengunduh ${st.done + st.fail} / ${total}`
          : `Download semua (${total} hlm, ZIP)`}
      </button>
      {!st.busy && st.msg && <p className="dlnote">{st.msg}</p>}
    </div>
  );
}
