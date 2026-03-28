import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BokförAI – Smart bokföring för Sverige",
  description: "Ladda upp kvitton och fakturor – AI sköter bokföringen åt dig.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
