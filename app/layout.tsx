import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ALINDA Booking",
  description: "Premium online appointment booking for modern businesses"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
