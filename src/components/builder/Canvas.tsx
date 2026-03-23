"use client";

import React from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { useBuilder } from "@/lib/store";
import DraggableComponent from "./DraggableComponent";
import { LayoutGrid } from "lucide-react";

export default function Canvas() {
  const { state, dispatch } = useBuilder();
  const components = state.currentProject?.components || [];

  const { setNodeRef, isOver } = useDroppable({
    id: "canvas-drop-zone",
    data: { source: "canvas" },
  });

  const handleCanvasClick = () => {
    dispatch({ type: "SELECT_COMPONENT", payload: null });
  };

  return (
    <div className="flex-1 overflow-auto bg-builder-bg p-4 sm:p-8" onClick={handleCanvasClick}>
      <div
        ref={setNodeRef}
        className={`max-w-4xl mx-auto min-h-[calc(100vh-8rem)] bg-white rounded-xl shadow-2xl shadow-black/20 overflow-hidden transition-all duration-200 ${
          isOver ? "ring-2 ring-builder-accent ring-offset-4 ring-offset-builder-bg" : ""
        }`}
      >
        {components.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[600px] text-gray-400">
            <LayoutGrid size={48} className="mb-4 opacity-30" />
            <h3 className="text-lg font-medium mb-2">Tom arbetsyta</h3>
            <p className="text-sm text-center max-w-xs">
              Dra komponenter fran panelen till vanster och slapp dem har for att borja bygga din sida.
            </p>
          </div>
        ) : (
          <SortableContext items={components.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            {components.map((component) => (
              <DraggableComponent key={component.id} component={component} />
            ))}
          </SortableContext>
        )}

        {components.length > 0 && isOver && (
          <div className="border-2 border-dashed border-builder-accent/50 rounded-lg m-4 p-8 text-center text-builder-accent/70 text-sm">
            Slapp komponenten har
          </div>
        )}
      </div>
    </div>
  );
}
