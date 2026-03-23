"use client";

import React, { useEffect, useState } from "react";
import { Project } from "@/lib/types";
import PreviewRenderer from "@/components/builder/PreviewRenderer";

const STORAGE_KEY = "claude-ny-projects";

export default function PreviewPage({ params }: { params: { projectId: string } }) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const projects: Project[] = JSON.parse(stored);
        const found = projects.find((p) => p.id === params.projectId);
        if (found) {
          setProject(found);
        }
      }
    } catch {
      console.error("Kunde inte ladda projekt");
    } finally {
      setLoading(false);
    }
  }, [params.projectId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Laddar forhandsgranskning...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Projektet hittades inte</h1>
          <p className="text-gray-500 mb-4">Det har projektet finns inte eller har tagits bort.</p>
          <a href="/" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Tillbaka till instrumentpanelen
          </a>
        </div>
      </div>
    );
  }

  return (
    <html lang="sv">
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: white; }
              img { max-width: 100%; }
            `,
          }}
        />
      </head>
      <body>
        {project.components.length === 0 ? (
          <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "#9ca3af", fontSize: "18px" }}>Den har sidan har inga komponenter annu.</p>
          </div>
        ) : (
          project.components.map((component) => (
            <PreviewRenderer key={component.id} component={component} isBuilder={false} />
          ))
        )}
      </body>
    </html>
  );
}
