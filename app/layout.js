import "./globals.css";
import AgeGate from "./AgeGate";

export const metadata = {
  title: "HidakaManga18",
  description: "HidakaManga18 - situs khusus dewasa (18+)",
  other: { rating: "adult" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <AgeGate />
        {children}
      </body>
    </html>
  );
}
