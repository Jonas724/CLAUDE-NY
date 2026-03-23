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
      <body className="min-h-screen antialiased">
        {children}
        <noscript>
          <div style={{ padding: "40px", textAlign: "center", color: "#e2e8f0", background: "#0f1117", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p>JavaScript behover vara aktiverat for att anvanda AppByggare.</p>
          </div>
        </noscript>
      </body>
    </html>
  );
}
