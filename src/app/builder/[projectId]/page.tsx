"use client";

import React, { useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useBuilder, BuilderProvider } from "@/lib/store";
import { ComponentType, BuilderComponent } from "@/lib/types";
import { createComponent } from "@/lib/defaultComponents";
import TopBar from "@/components/builder/TopBar";
import ComponentPalette from "@/components/builder/ComponentPalette";
import Canvas from "@/components/builder/Canvas";
import PropertyEditor from "@/components/builder/PropertyEditor";
import PreviewRenderer from "@/components/builder/PreviewRenderer";

function BuilderContent({ projectId }: { projectId: string }) {
  const { state, dispatch } = useBuilder();
  const [activeDragItem, setActiveDragItem] = React.useState<BuilderComponent | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  useEffect(() => {
    if (state.projects.length > 0 && !state.currentProject) {
      const project = state.projects.find((p) => p.id === projectId);
      if (project) {
        dispatch({ type: "SET_CURRENT_PROJECT", payload: project });
      }
    }
  }, [state.projects, state.currentProject, projectId, dispatch]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current;

    if (data?.source === "palette") {
      const newComponent = createComponent(data.type as ComponentType);
      setActiveDragItem(newComponent);
    } else if (data?.source === "canvas" && state.currentProject) {
      const comp = state.currentProject.components.find((c) => c.id === active.id);
      if (comp) setActiveDragItem(comp);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null);

    if (!over || !state.currentProject) return;

    const activeData = active.data.current;

    // Dropping from palette
    if (activeData?.source === "palette") {
      const newComponent = createComponent(activeData.type as ComponentType);
      const components = state.currentProject.components;

      // Find the index to insert at
      let insertIndex = components.length;
      if (over.id !== "canvas-drop-zone") {
        const overIndex = components.findIndex((c) => c.id === over.id);
        if (overIndex !== -1) {
          insertIndex = overIndex;
        }
      }

      dispatch({
        type: "ADD_COMPONENT",
        payload: { component: newComponent, index: insertIndex },
      });
      dispatch({ type: "SELECT_COMPONENT", payload: newComponent.id });
      return;
    }

    // Reordering on canvas
    if (activeData?.source === "canvas" && active.id !== over.id) {
      const components = state.currentProject.components;
      const oldIndex = components.findIndex((c) => c.id === active.id);
      const newIndex = components.findIndex((c) => c.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(components, oldIndex, newIndex);
        dispatch({ type: "REORDER_COMPONENTS", payload: reordered });
      }
    }
  };

  if (!state.currentProject) {
    return (
      <div className="h-screen flex items-center justify-center bg-builder-bg">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-builder-accent border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-builder-textMuted">Laddar projekt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopBar />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 overflow-hidden">
          <ComponentPalette />
          <Canvas />
          <PropertyEditor />
        </div>

        <DragOverlay>
          {activeDragItem && (
            <div className="drag-overlay max-w-md">
              <PreviewRenderer component={activeDragItem} isBuilder />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export default function BuilderPage({ params }: { params: Promise<{ projectId: string }> }) {
  const resolvedParams = React.use(params);
  return (
    <BuilderProvider>
      <BuilderContent projectId={resolvedParams.projectId} />
    </BuilderProvider>
  );
}
