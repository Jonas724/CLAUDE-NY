"use client";

import { useState, useEffect } from "react";

export default function TestPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div style={{ padding: "40px", background: "white", color: "black", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "16px" }}>Test Page</h1>
      <p>Server rendered: OK</p>
      <p>Client hydrated: {mounted ? "YES" : "NO"}</p>
    </div>
  );
}
