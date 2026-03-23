import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AppByggare - Bygg din app visuellt",
  description: "En visuell app- och webbplatsbyggare. Dra och slapp komponenter for att skapa din drom-app.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
