"use client";

import React, { useState, useCallback } from "react";
import { Save, Eye, Download, ArrowLeft, Check } from "lucide-react";
import { useBuilder } from "@/lib/store";
import { Project, BuilderComponent } from "@/lib/types";
import { Button } from "@/components/ui/button";

function generateHTML(project: Project): string {
  const stylesToCSS = (styles: Record<string, string | undefined>): string => {
    return Object.entries(styles)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => {
        const cssKey = k.replace(/([A-Z])/g, "-$1").toLowerCase();
        return `${cssKey}: ${v}`;
      })
      .join("; ");
  };

  const renderComponent = (comp: BuilderComponent): string => {
    const style = stylesToCSS(comp.styles as unknown as Record<string, string | undefined>);
    switch (comp.type) {
      case "hero":
        return `<section style="${style}">
  <h1>${comp.content}</h1>
  ${comp.props.subtitle ? `<p style="font-size: 20px; opacity: 0.9; font-weight: normal;">${comp.props.subtitle}</p>` : ""}
</section>`;
      case "text":
        return `<p style="${style}">${comp.content}</p>`;
      case "image":
        return `<img src="${comp.props.src || ""}" alt="${comp.props.alt || ""}" style="${style}" />`;
      case "button":
        return `<a href="${comp.props.href || "#"}" style="${style}; text-decoration: none; cursor: pointer;">${comp.content}</a>`;
      case "container":
        return `<div style="${style}">${comp.content}</div>`;
      case "form":
        return `<form style="${style}" action="${comp.props.action || "#"}">
  <input type="text" placeholder="Namn" style="padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; width: 100%; margin-bottom: 8px;" />
  <input type="email" placeholder="E-post" style="padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; width: 100%; margin-bottom: 8px;" />
  <button type="submit" style="background: #6366f1; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer;">Skicka</button>
</form>`;
      case "input":
        return `<input type="${comp.props.type || "text"}" name="${comp.props.name || ""}" placeholder="${comp.props.placeholder || ""}" style="${style}" />`;
      case "navigation": {
        const links = (comp.props.links || "").split(",").map((l: string) => l.trim());
        return `<nav style="${style}">
  <span>${comp.content}</span>
  <div style="display: flex; gap: 24px;">
    ${links.map((l: string) => `<a href="#" style="color: #d1d5db; text-decoration: none; font-weight: normal; font-size: 14px;">${l}</a>`).join("\n    ")}
  </div>
</nav>`;
      }
      case "footer":
        return `<footer style="${style}">${comp.content}</footer>`;
      case "card":
        return `<div style="${style}">
  <h3 style="font-size: 20px; font-weight: 600; margin-bottom: 8px; color: #1f2937;">${comp.content}</h3>
  <p style="color: #6b7280; font-size: 14px;">${comp.props.description || ""}</p>
</div>`;
      case "list": {
        const items = (comp.props.items || "").split(",").map((i: string) => i.trim());
        const ordered = comp.props.ordered === "true";
        const tag = ordered ? "ol" : "ul";
        return `<${tag} style="${style}">
  ${items.map((i: string) => `<li>${i}</li>`).join("\n  ")}
</${tag}>`;
      }
      default:
        return `<div style="${style}">${comp.content}</div>`;
    }
  };

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    img { max-width: 100%; }
  </style>
</head>
<body>
${project.components.map(renderComponent).join("\n")}
</body>
</html>`;
}

export default function TopBar() {
  const { state, dispatch, saveProject } = useBuilder();
  const [saved, setSaved] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");

  const handleSave = useCallback(() => {
    saveProject();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [saveProject]);

  const handlePreview = useCallback(() => {
    if (state.currentProject) {
      window.open(`/preview/${state.currentProject.id}`, "_blank");
    }
  }, [state.currentProject]);

  const handleExport = useCallback(() => {
    if (!state.currentProject) return;
    const html = generateHTML(state.currentProject);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${state.currentProject.name.toLowerCase().replace(/\s+/g, "-")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [state.currentProject]);

  const handleNameClick = useCallback(() => {
    if (state.currentProject) {
      setNameValue(state.currentProject.name);
      setEditingName(true);
    }
  }, [state.currentProject]);

  const handleNameSubmit = useCallback(() => {
    if (nameValue.trim()) {
      dispatch({ type: "UPDATE_PROJECT_NAME", payload: nameValue.trim() });
    }
    setEditingName(false);
  }, [nameValue, dispatch]);

  if (!state.currentProject) return null;

  return (
    <div className="h-14 bg-builder-sidebar border-b border-builder-border flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <a
          href="/"
          className="flex items-center gap-2 text-builder-textMuted hover:text-builder-text transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-sm hidden sm:inline">Tillbaka</span>
        </a>
        <div className="w-px h-6 bg-builder-border" />
        {editingName ? (
          <input
            type="text"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleNameSubmit();
              if (e.key === "Escape") setEditingName(false);
            }}
            className="builder-input max-w-[200px]"
            autoFocus
          />
        ) : (
          <button
            onClick={handleNameClick}
            className="text-sm font-semibold text-builder-text hover:text-builder-accent transition-colors"
          >
            {state.currentProject.name}
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={handleSave}>
          {saved ? <Check size={16} className="text-builder-success" /> : <Save size={16} />}
          <span className="hidden sm:inline">{saved ? "Sparat!" : "Spara"}</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={handlePreview}>
          <Eye size={16} />
          <span className="hidden sm:inline">Forhandsgranska</span>
        </Button>
        <Button variant="default" size="sm" onClick={handleExport}>
          <Download size={16} />
          <span className="hidden sm:inline">Exportera</span>
        </Button>
      </div>
    </div>
  );
}
