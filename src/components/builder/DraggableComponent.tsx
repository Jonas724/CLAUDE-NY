"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { BuilderComponent } from "@/lib/types";
import { useBuilder } from "@/lib/store";
import PreviewRenderer from "./PreviewRenderer";

interface DraggableComponentProps {
  component: BuilderComponent;
}

export default function DraggableComponent({ component }: DraggableComponentProps) {
  const { state, dispatch } = useBuilder();
  const isSelected = state.selectedComponentId === component.id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: component.id,
    data: { type: component.type, source: "canvas" },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: "SELECT_COMPONENT", payload: component.id });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: "REMOVE_COMPONENT", payload: component.id });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`canvas-component group relative ${isSelected ? "selected" : ""}`}
      onClick={handleSelect}
    >
      {/* Controls overlay */}
      <div
        className={`absolute -top-0 left-0 right-0 z-10 flex items-center justify-between px-2 py-1
          bg-builder-accent/90 text-white text-xs rounded-t-md transition-opacity duration-150
          ${isSelected || isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
      >
        <div className="flex items-center gap-1">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-0.5 hover:bg-white/20 rounded"
          >
            <GripVertical size={14} />
          </button>
          <span className="font-medium">{component.label}</span>
        </div>
        <button
          onClick={handleDelete}
          className="p-0.5 hover:bg-white/20 rounded text-white/80 hover:text-white"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Component preview */}
      <div className={`${isSelected || isDragging ? "mt-6" : "group-hover:mt-6 transition-all duration-150"}`}>
        <PreviewRenderer component={component} isBuilder />
      </div>
    </div>
  );
}
