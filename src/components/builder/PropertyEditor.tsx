"use client";

import React, { useCallback } from "react";
import { useBuilder } from "@/lib/store";
import { BuilderComponent, ComponentStyles } from "@/lib/types";
import { Settings2 } from "lucide-react";

interface PropertyFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "color" | "select" | "textarea" | "number";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

function PropertyField({ label, value, onChange, type = "text", options, placeholder }: PropertyFieldProps) {
  if (type === "color") {
    return (
      <div>
        <label className="builder-label">{label}</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={value || "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-9 rounded border border-builder-border cursor-pointer bg-transparent"
          />
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "#000000"}
            className="builder-input flex-1"
          />
        </div>
      </div>
    );
  }

  if (type === "select" && options) {
    return (
      <div>
        <label className="builder-label">{label}</label>
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="builder-input"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div>
        <label className="builder-label">{label}</label>
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="builder-input resize-y"
        />
      </div>
    );
  }

  return (
    <div>
      <label className="builder-label">{label}</label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="builder-input"
      />
    </div>
  );
}

function PropertySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-builder-border pb-4">
      <h3 className="text-xs font-semibold text-builder-textMuted uppercase tracking-wider mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export default function PropertyEditor() {
  const { state, dispatch, getSelectedComponent } = useBuilder();
  const component = getSelectedComponent();

  const updateStyles = useCallback(
    (key: keyof ComponentStyles, value: string) => {
      if (!component) return;
      dispatch({
        type: "UPDATE_COMPONENT",
        payload: {
          id: component.id,
          updates: {
            styles: { ...component.styles, [key]: value },
          },
        },
      });
    },
    [component, dispatch]
  );

  const updateContent = useCallback(
    (content: string) => {
      if (!component) return;
      dispatch({
        type: "UPDATE_COMPONENT",
        payload: {
          id: component.id,
          updates: { content },
        },
      });
    },
    [component, dispatch]
  );

  const updateProp = useCallback(
    (key: string, value: string) => {
      if (!component) return;
      dispatch({
        type: "UPDATE_COMPONENT",
        payload: {
          id: component.id,
          updates: {
            props: { ...component.props, [key]: value },
          },
        },
      });
    },
    [component, dispatch]
  );

  if (!component) {
    return (
      <div className="w-72 bg-builder-sidebar border-l border-builder-border flex flex-col shrink-0">
        <div className="p-4 border-b border-builder-border">
          <h2 className="text-sm font-semibold text-builder-text">Egenskaper</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-builder-textMuted p-6">
          <Settings2 size={32} className="mb-3 opacity-30" />
          <p className="text-sm text-center">Valj en komponent pa arbetsytan for att redigera dess egenskaper.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 bg-builder-sidebar border-l border-builder-border flex flex-col shrink-0 overflow-hidden">
      <div className="p-4 border-b border-builder-border">
        <h2 className="text-sm font-semibold text-builder-text">Egenskaper</h2>
        <p className="text-xs text-builder-textMuted mt-0.5">{component.label}</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Content section */}
        {component.type !== "container" && component.type !== "image" && (
          <PropertySection title="Innehall">
            {component.type === "text" ? (
              <PropertyField
                label="Text"
                value={component.content}
                onChange={updateContent}
                type="textarea"
                placeholder="Skriv text..."
              />
            ) : (
              <PropertyField
                label={component.type === "hero" ? "Rubrik" : component.type === "navigation" ? "Webbplatsnamn" : "Text"}
                value={component.content}
                onChange={updateContent}
                placeholder="Ange text..."
              />
            )}

            {/* Type-specific props */}
            {component.type === "hero" && (
              <PropertyField
                label="Underrubrik"
                value={component.props.subtitle || ""}
                onChange={(v) => updateProp("subtitle", v)}
                placeholder="Underrubrik..."
              />
            )}
            {component.type === "button" && (
              <PropertyField
                label="Lank (URL)"
                value={component.props.href || ""}
                onChange={(v) => updateProp("href", v)}
                placeholder="https://..."
              />
            )}
            {component.type === "navigation" && (
              <PropertyField
                label="Lankar (kommaseparerade)"
                value={component.props.links || ""}
                onChange={(v) => updateProp("links", v)}
                placeholder="Hem,Om oss,Kontakt"
              />
            )}
            {component.type === "card" && (
              <PropertyField
                label="Beskrivning"
                value={component.props.description || ""}
                onChange={(v) => updateProp("description", v)}
                type="textarea"
                placeholder="Kortbeskrivning..."
              />
            )}
            {component.type === "input" && (
              <>
                <PropertyField
                  label="Platshallare"
                  value={component.props.placeholder || ""}
                  onChange={(v) => updateProp("placeholder", v)}
                  placeholder="Platshallare..."
                />
                <PropertyField
                  label="Typ"
                  value={component.props.type || "text"}
                  onChange={(v) => updateProp("type", v)}
                  type="select"
                  options={[
                    { value: "text", label: "Text" },
                    { value: "email", label: "E-post" },
                    { value: "password", label: "Losenord" },
                    { value: "number", label: "Nummer" },
                    { value: "tel", label: "Telefon" },
                    { value: "url", label: "URL" },
                  ]}
                />
              </>
            )}
            {component.type === "list" && (
              <>
                <PropertyField
                  label="Objekt (kommaseparerade)"
                  value={component.props.items || ""}
                  onChange={(v) => updateProp("items", v)}
                  type="textarea"
                  placeholder="Objekt 1,Objekt 2,Objekt 3"
                />
                <PropertyField
                  label="Listtyp"
                  value={component.props.ordered || "false"}
                  onChange={(v) => updateProp("ordered", v)}
                  type="select"
                  options={[
                    { value: "false", label: "Punktlista" },
                    { value: "true", label: "Numrerad lista" },
                  ]}
                />
              </>
            )}
          </PropertySection>
        )}

        {/* Image props when type is image */}
        {component.type === "image" && (
          <PropertySection title="Bild">
            <PropertyField
              label="Bildkalla (URL)"
              value={component.props.src || ""}
              onChange={(v) => updateProp("src", v)}
              placeholder="https://..."
            />
            <PropertyField
              label="Alt-text"
              value={component.props.alt || ""}
              onChange={(v) => updateProp("alt", v)}
              placeholder="Beskrivning av bilden"
            />
          </PropertySection>
        )}

        {/* Colors */}
        <PropertySection title="Farger">
          <PropertyField
            label="Bakgrundsfarg"
            value={component.styles.backgroundColor || ""}
            onChange={(v) => updateStyles("backgroundColor", v)}
            type="color"
          />
          <PropertyField
            label="Textfarg"
            value={component.styles.color || ""}
            onChange={(v) => updateStyles("color", v)}
            type="color"
          />
        </PropertySection>

        {/* Typography */}
        <PropertySection title="Typografi">
          <PropertyField
            label="Textstorlek"
            value={component.styles.fontSize || ""}
            onChange={(v) => updateStyles("fontSize", v)}
            placeholder="16px"
          />
          <PropertyField
            label="Textvikt"
            value={component.styles.fontWeight || ""}
            onChange={(v) => updateStyles("fontWeight", v)}
            type="select"
            options={[
              { value: "", label: "Standard" },
              { value: "300", label: "Tunn (300)" },
              { value: "400", label: "Normal (400)" },
              { value: "500", label: "Medium (500)" },
              { value: "600", label: "Halvfet (600)" },
              { value: "700", label: "Fet (700)" },
              { value: "800", label: "Extrafet (800)" },
            ]}
          />
          <PropertyField
            label="Textjustering"
            value={component.styles.textAlign || ""}
            onChange={(v) => updateStyles("textAlign", v)}
            type="select"
            options={[
              { value: "", label: "Standard" },
              { value: "left", label: "Vanster" },
              { value: "center", label: "Mitten" },
              { value: "right", label: "Hoger" },
            ]}
          />
          <PropertyField
            label="Radhojd"
            value={component.styles.lineHeight || ""}
            onChange={(v) => updateStyles("lineHeight", v)}
            placeholder="1.6"
          />
        </PropertySection>

        {/* Spacing */}
        <PropertySection title="Avstand">
          <PropertyField
            label="Utfyllnad (padding)"
            value={component.styles.padding || ""}
            onChange={(v) => updateStyles("padding", v)}
            placeholder="16px"
          />
          <PropertyField
            label="Marginal"
            value={component.styles.margin || ""}
            onChange={(v) => updateStyles("margin", v)}
            placeholder="0px"
          />
          <PropertyField
            label="Mellanrum (gap)"
            value={component.styles.gap || ""}
            onChange={(v) => updateStyles("gap", v)}
            placeholder="16px"
          />
        </PropertySection>

        {/* Size */}
        <PropertySection title="Storlek">
          <PropertyField
            label="Bredd"
            value={component.styles.width || ""}
            onChange={(v) => updateStyles("width", v)}
            placeholder="100%"
          />
          <PropertyField
            label="Max bredd"
            value={component.styles.maxWidth || ""}
            onChange={(v) => updateStyles("maxWidth", v)}
            placeholder="auto"
          />
          <PropertyField
            label="Hojd"
            value={component.styles.height || ""}
            onChange={(v) => updateStyles("height", v)}
            placeholder="auto"
          />
          <PropertyField
            label="Min-hojd"
            value={component.styles.minHeight || ""}
            onChange={(v) => updateStyles("minHeight", v)}
            placeholder="auto"
          />
        </PropertySection>

        {/* Border */}
        <PropertySection title="Kantlinje">
          <PropertyField
            label="Hornradie"
            value={component.styles.borderRadius || ""}
            onChange={(v) => updateStyles("borderRadius", v)}
            placeholder="0px"
          />
          <PropertyField
            label="Kantlinje"
            value={component.styles.border || ""}
            onChange={(v) => updateStyles("border", v)}
            placeholder="1px solid #e2e8f0"
          />
          <PropertyField
            label="Skugga"
            value={component.styles.boxShadow || ""}
            onChange={(v) => updateStyles("boxShadow", v)}
            placeholder="none"
          />
        </PropertySection>

        {/* Layout */}
        <PropertySection title="Layout">
          <PropertyField
            label="Display"
            value={component.styles.display || ""}
            onChange={(v) => updateStyles("display", v)}
            type="select"
            options={[
              { value: "", label: "Standard" },
              { value: "block", label: "Block" },
              { value: "flex", label: "Flex" },
              { value: "inline-block", label: "Inline-block" },
              { value: "none", label: "Dold" },
            ]}
          />
          {(component.styles.display === "flex") && (
            <>
              <PropertyField
                label="Riktning"
                value={component.styles.flexDirection || ""}
                onChange={(v) => updateStyles("flexDirection", v)}
                type="select"
                options={[
                  { value: "row", label: "Rad" },
                  { value: "column", label: "Kolumn" },
                  { value: "row-reverse", label: "Rad (omvand)" },
                  { value: "column-reverse", label: "Kolumn (omvand)" },
                ]}
              />
              <PropertyField
                label="Justering"
                value={component.styles.alignItems || ""}
                onChange={(v) => updateStyles("alignItems", v)}
                type="select"
                options={[
                  { value: "", label: "Standard" },
                  { value: "flex-start", label: "Start" },
                  { value: "center", label: "Mitten" },
                  { value: "flex-end", label: "Slut" },
                  { value: "stretch", label: "Strackt" },
                ]}
              />
              <PropertyField
                label="Fordelning"
                value={component.styles.justifyContent || ""}
                onChange={(v) => updateStyles("justifyContent", v)}
                type="select"
                options={[
                  { value: "", label: "Standard" },
                  { value: "flex-start", label: "Start" },
                  { value: "center", label: "Mitten" },
                  { value: "flex-end", label: "Slut" },
                  { value: "space-between", label: "Mellanrum" },
                  { value: "space-around", label: "Runt" },
                ]}
              />
            </>
          )}
        </PropertySection>
      </div>
    </div>
  );
}
