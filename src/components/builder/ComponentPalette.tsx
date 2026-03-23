"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import {
  Sparkles,
  Type,
  Image,
  MousePointerClick,
  Box,
  FileText,
  TextCursorInput,
  Menu,
  PanelBottom,
  CreditCard,
  List,
} from "lucide-react";
import { ComponentType } from "@/lib/types";
import { componentTypes, getComponentLabel } from "@/lib/defaultComponents";

const iconMap: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Sparkles,
  Type,
  Image,
  MousePointerClick,
  Box,
  FileText,
  TextCursorInput,
  Menu,
  PanelBottom,
  CreditCard,
  List,
};

const iconNameMap: Record<ComponentType, string> = {
  hero: "Sparkles",
  text: "Type",
  image: "Image",
  button: "MousePointerClick",
  container: "Box",
  form: "FileText",
  input: "TextCursorInput",
  navigation: "Menu",
  footer: "PanelBottom",
  card: "CreditCard",
  list: "List",
};

function PaletteItem({ type }: { type: ComponentType }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { type, source: "palette" },
  });

  const IconComponent = iconMap[iconNameMap[type]];
  const label = getComponentLabel(type);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-grab active:cursor-grabbing
        bg-builder-canvas/50 border border-builder-border hover:border-builder-accent/50
        hover:bg-builder-canvas transition-all duration-150 select-none
        ${isDragging ? "opacity-50 ring-2 ring-builder-accent" : ""}`}
    >
      {IconComponent && <IconComponent size={16} className="text-builder-accent shrink-0" />}
      <span className="text-sm text-builder-text">{label}</span>
    </div>
  );
}

export default function ComponentPalette() {
  return (
    <div className="w-60 bg-builder-sidebar border-r border-builder-border flex flex-col shrink-0 overflow-hidden">
      <div className="p-4 border-b border-builder-border">
        <h2 className="text-sm font-semibold text-builder-text">Komponenter</h2>
        <p className="text-xs text-builder-textMuted mt-1">Dra och slapp pa arbetsytan</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {componentTypes.map((type) => (
          <PaletteItem key={type} type={type} />
        ))}
      </div>
    </div>
  );
}
