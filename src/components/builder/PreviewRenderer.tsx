"use client";

import React from "react";
import { BuilderComponent } from "@/lib/types";

interface PreviewRendererProps {
  component: BuilderComponent;
  isBuilder?: boolean;
}

export default function PreviewRenderer({ component, isBuilder = false }: PreviewRendererProps) {
  const style: React.CSSProperties = { ...component.styles } as React.CSSProperties;

  const wrapperClass = isBuilder ? "pointer-events-none select-none" : "";

  switch (component.type) {
    case "hero":
      return (
        <section style={style} className={wrapperClass}>
          <h1 style={{ margin: 0 }}>{component.content}</h1>
          {component.props.subtitle && (
            <p style={{ fontSize: "20px", opacity: 0.9, fontWeight: "normal", margin: 0 }}>
              {component.props.subtitle}
            </p>
          )}
        </section>
      );

    case "text":
      return (
        <p style={style} className={wrapperClass}>
          {component.content}
        </p>
      );

    case "image":
      return (
        <img
          src={component.props.src || "https://placehold.co/800x400/6366f1/ffffff?text=Bild"}
          alt={component.props.alt || ""}
          style={style}
          className={wrapperClass}
        />
      );

    case "button":
      return (
        <div style={{ padding: "8px" }} className={wrapperClass}>
          <a
            href={isBuilder ? undefined : component.props.href || "#"}
            style={{
              ...style,
              textDecoration: "none",
              cursor: isBuilder ? "default" : "pointer",
            }}
          >
            {component.content}
          </a>
        </div>
      );

    case "container":
      return (
        <div style={style} className={wrapperClass}>
          {component.content && <p>{component.content}</p>}
          {component.children?.map((child) => (
            <PreviewRenderer key={child.id} component={child} isBuilder={isBuilder} />
          ))}
          {!component.content && (!component.children || component.children.length === 0) && isBuilder && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-400 text-sm">
              Tom behalare
            </div>
          )}
        </div>
      );

    case "form":
      return (
        <form
          style={style}
          className={wrapperClass}
          onSubmit={(e) => e.preventDefault()}
          action={component.props.action || "#"}
        >
          <input
            type="text"
            placeholder="Namn"
            style={{
              padding: "10px 14px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              width: "100%",
              fontSize: "14px",
            }}
            readOnly={isBuilder}
          />
          <input
            type="email"
            placeholder="E-post"
            style={{
              padding: "10px 14px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              width: "100%",
              fontSize: "14px",
            }}
            readOnly={isBuilder}
          />
          <textarea
            placeholder="Meddelande"
            rows={3}
            style={{
              padding: "10px 14px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              width: "100%",
              fontSize: "14px",
              resize: "vertical",
            }}
            readOnly={isBuilder}
          />
          <button
            type="submit"
            style={{
              background: "#6366f1",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "6px",
              cursor: isBuilder ? "default" : "pointer",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            Skicka
          </button>
        </form>
      );

    case "input":
      return (
        <div style={{ padding: "4px 8px" }} className={wrapperClass}>
          <input
            type={component.props.type || "text"}
            name={component.props.name || ""}
            placeholder={component.props.placeholder || ""}
            style={style}
            readOnly={isBuilder}
          />
        </div>
      );

    case "navigation": {
      const links = (component.props.links || "").split(",").map((l) => l.trim()).filter(Boolean);
      return (
        <nav style={style} className={wrapperClass}>
          <span>{component.content}</span>
          <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            {links.map((link, i) => (
              <a
                key={i}
                href={isBuilder ? undefined : "#"}
                style={{
                  color: "#d1d5db",
                  textDecoration: "none",
                  fontWeight: "normal",
                  fontSize: "14px",
                  cursor: isBuilder ? "default" : "pointer",
                }}
              >
                {link}
              </a>
            ))}
          </div>
        </nav>
      );
    }

    case "footer":
      return (
        <footer style={style} className={wrapperClass}>
          {component.content}
        </footer>
      );

    case "card":
      return (
        <div style={style} className={wrapperClass}>
          <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px", color: "#1f2937" }}>
            {component.content}
          </h3>
          {component.props.description && (
            <p style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>
              {component.props.description}
            </p>
          )}
        </div>
      );

    case "list": {
      const items = (component.props.items || "").split(",").map((i) => i.trim()).filter(Boolean);
      const ordered = component.props.ordered === "true";
      const ListTag = ordered ? "ol" : "ul";
      return (
        <ListTag style={style} className={wrapperClass}>
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ListTag>
      );
    }

    default:
      return (
        <div style={style} className={wrapperClass}>
          {component.content}
        </div>
      );
  }
}
