"use client";

import React, { useEffect, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { Plus, Trash2, ExternalLink, LayoutGrid, Clock } from "lucide-react";
import { Project } from "@/lib/types";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const STORAGE_KEY = "claude-ny-projects";

function loadProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveProjects(projects: Project[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("sv-SE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProjects(loadProjects());
    setLoaded(true);
  }, []);

  const handleCreateProject = useCallback(() => {
    const name = newName.trim() || "Nytt Projekt";
    const project: Project = {
      id: uuidv4(),
      name,
      components: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...projects, project];
    setProjects(updated);
    saveProjects(updated);
    setShowNewModal(false);
    setNewName("");
    window.location.href = `/builder/${project.id}`;
  }, [newName, projects]);

  const handleDeleteProject = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (confirm("Ar du saker pa att du vill ta bort detta projekt?")) {
        const updated = projects.filter((p) => p.id !== id);
        setProjects(updated);
        saveProjects(updated);
      }
    },
    [projects]
  );

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f1117" }}>
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full mx-auto mb-4" style={{ borderColor: "#6366f1", borderTopColor: "transparent" }} />
          <p style={{ color: "#94a3b8", fontSize: "14px" }}>Laddar AppByggare...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-builder-bg">
      {/* Header */}
      <header className="border-b border-builder-border bg-builder-sidebar">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-builder-text flex items-center gap-2">
              <LayoutGrid size={24} className="text-builder-accent" />
              AppByggare
            </h1>
            <p className="text-sm text-builder-textMuted mt-0.5">Bygg appar och webbplatser visuellt</p>
          </div>
          <Button onClick={() => setShowNewModal(true)}>
            <Plus size={18} />
            Nytt Projekt
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-builder-text">Dina Projekt</h2>
          <span className="text-sm text-builder-textMuted">{projects.length} projekt</span>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-20">
            <LayoutGrid size={56} className="mx-auto mb-4 text-builder-border" />
            <h3 className="text-lg font-medium text-builder-text mb-2">Inga projekt annu</h3>
            <p className="text-builder-textMuted mb-6 max-w-md mx-auto">
              Skapa ditt forsta projekt och borja bygga din app eller webbplats med dra-och-slapp.
            </p>
            <Button onClick={() => setShowNewModal(true)} size="lg">
              <Plus size={20} />
              Skapa ditt forsta projekt
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .map((project) => (
                <a key={project.id} href={`/builder/${project.id}`}>
                  <Card hover className="h-full">
                    <div className="p-5">
                      {/* Preview thumbnail area */}
                      <div className="bg-builder-canvas rounded-lg h-32 mb-4 flex items-center justify-center border border-builder-border overflow-hidden">
                        {project.components.length > 0 ? (
                          <div className="w-full h-full flex flex-col items-center justify-center text-builder-textMuted">
                            <LayoutGrid size={24} className="mb-1 opacity-50" />
                            <span className="text-xs">{project.components.length} komponenter</span>
                          </div>
                        ) : (
                          <span className="text-xs text-builder-textMuted">Tom</span>
                        )}
                      </div>

                      <h3 className="font-semibold text-builder-text mb-1 truncate">{project.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-builder-textMuted">
                        <Clock size={12} />
                        <span>Uppdaterad {formatDate(project.updatedAt)}</span>
                      </div>

                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-builder-border">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.preventDefault();
                            window.open(`/preview/${project.id}`, "_blank");
                          }}
                        >
                          <ExternalLink size={14} />
                          Forhandsgranska
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteProject(project.id, e)}
                          className="text-builder-danger hover:text-white hover:bg-builder-danger"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </a>
              ))}
          </div>
        )}
      </main>

      {/* New Project Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-builder-sidebar border border-builder-border rounded-xl w-full max-w-md shadow-2xl">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-builder-text mb-1">Skapa nytt projekt</h2>
              <p className="text-sm text-builder-textMuted mb-4">Ge ditt projekt ett namn for att komma igang.</p>

              <label className="builder-label">Projektnamn</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateProject();
                  if (e.key === "Escape") setShowNewModal(false);
                }}
                placeholder="Min fantastiska webbplats"
                className="builder-input mb-6"
                autoFocus
              />

              <div className="flex gap-3 justify-end">
                <Button variant="secondary" onClick={() => setShowNewModal(false)}>
                  Avbryt
                </Button>
                <Button onClick={handleCreateProject}>
                  <Plus size={16} />
                  Skapa projekt
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
