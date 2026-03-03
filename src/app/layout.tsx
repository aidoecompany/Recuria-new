import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recuria — Clinical AI Assistant",
  description:
    "Recuria powered by Aidoe — A clinic-ready AI medical assistant platform for healthcare professionals.",
  keywords: ["medical AI", "clinical assistant", "healthcare", "Recuria"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
