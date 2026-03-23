"use client";

import React, { createContext, useContext, useReducer, useCallback, useEffect } from "react";
import { BuilderState, BuilderAction, Project, BuilderComponent } from "./types";

const STORAGE_KEY = "claude-ny-projects";

const initialState: BuilderState = {
  projects: [],
  currentProject: null,
  selectedComponentId: null,
};

function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case "SET_PROJECTS":
      return { ...state, projects: action.payload };

    case "SET_CURRENT_PROJECT":
      return { ...state, currentProject: action.payload, selectedComponentId: null };

    case "SELECT_COMPONENT":
      return { ...state, selectedComponentId: action.payload };

    case "ADD_COMPONENT": {
      if (!state.currentProject) return state;
      const components = [...state.currentProject.components];
      const { component, index } = action.payload;
      if (index !== undefined && index >= 0) {
        components.splice(index, 0, component);
      } else {
        components.push(component);
      }
      const updatedProject = {
        ...state.currentProject,
        components,
        updatedAt: new Date().toISOString(),
      };
      return {
        ...state,
        currentProject: updatedProject,
        projects: state.projects.map((p) => (p.id === updatedProject.id ? updatedProject : p)),
      };
    }

    case "UPDATE_COMPONENT": {
      if (!state.currentProject) return state;
      const { id, updates } = action.payload;
      const updatedComponents = state.currentProject.components.map((c) =>
        c.id === id ? { ...c, ...updates, styles: { ...c.styles, ...updates.styles } } : c
      );
      const updatedProject = {
        ...state.currentProject,
        components: updatedComponents,
        updatedAt: new Date().toISOString(),
      };
      return {
        ...state,
        currentProject: updatedProject,
        projects: state.projects.map((p) => (p.id === updatedProject.id ? updatedProject : p)),
      };
    }

    case "REMOVE_COMPONENT": {
      if (!state.currentProject) return state;
      const filteredComponents = state.currentProject.components.filter((c) => c.id !== action.payload);
      const updatedProject = {
        ...state.currentProject,
        components: filteredComponents,
        updatedAt: new Date().toISOString(),
      };
      return {
        ...state,
        currentProject: updatedProject,
        selectedComponentId: state.selectedComponentId === action.payload ? null : state.selectedComponentId,
        projects: state.projects.map((p) => (p.id === updatedProject.id ? updatedProject : p)),
      };
    }

    case "REORDER_COMPONENTS": {
      if (!state.currentProject) return state;
      const updatedProject = {
        ...state.currentProject,
        components: action.payload,
        updatedAt: new Date().toISOString(),
      };
      return {
        ...state,
        currentProject: updatedProject,
        projects: state.projects.map((p) => (p.id === updatedProject.id ? updatedProject : p)),
      };
    }

    case "UPDATE_PROJECT_NAME": {
      if (!state.currentProject) return state;
      const updatedProject = {
        ...state.currentProject,
        name: action.payload,
        updatedAt: new Date().toISOString(),
      };
      return {
        ...state,
        currentProject: updatedProject,
        projects: state.projects.map((p) => (p.id === updatedProject.id ? updatedProject : p)),
      };
    }

    case "SAVE_PROJECT": {
      const projectsToSave = state.currentProject
        ? state.projects.map((p) => (p.id === state.currentProject!.id ? state.currentProject! : p))
        : state.projects;
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projectsToSave));
      }
      return { ...state, projects: projectsToSave };
    }

    case "CREATE_PROJECT": {
      const newProjects = [...state.projects, action.payload];
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newProjects));
      }
      return { ...state, projects: newProjects };
    }

    case "DELETE_PROJECT": {
      const remainingProjects = state.projects.filter((p) => p.id !== action.payload);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remainingProjects));
      }
      return {
        ...state,
        projects: remainingProjects,
        currentProject: state.currentProject?.id === action.payload ? null : state.currentProject,
      };
    }

    default:
      return state;
  }
}

interface BuilderContextValue {
  state: BuilderState;
  dispatch: React.Dispatch<BuilderAction>;
  loadProjects: () => void;
  saveProject: () => void;
  getSelectedComponent: () => BuilderComponent | null;
}

const BuilderContext = createContext<BuilderContextValue | null>(null);

export function BuilderProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(builderReducer, initialState);

  const loadProjects = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const projects: Project[] = JSON.parse(stored);
          dispatch({ type: "SET_PROJECTS", payload: projects });
        }
      } catch {
        console.error("Kunde inte ladda projekt fran localStorage");
      }
    }
  }, []);

  const saveProject = useCallback(() => {
    dispatch({ type: "SAVE_PROJECT" });
  }, []);

  const getSelectedComponent = useCallback((): BuilderComponent | null => {
    if (!state.currentProject || !state.selectedComponentId) return null;
    return state.currentProject.components.find((c) => c.id === state.selectedComponentId) || null;
  }, [state.currentProject, state.selectedComponentId]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const value = React.useMemo(
    () => ({ state, dispatch, loadProjects, saveProject, getSelectedComponent }),
    [state, dispatch, loadProjects, saveProject, getSelectedComponent]
  );

  return React.createElement(BuilderContext.Provider, { value }, children);
}

export function useBuilder() {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error("useBuilder maste anvandas inuti en BuilderProvider");
  }
  return context;
}
