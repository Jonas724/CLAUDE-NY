export type ComponentType =
  | "text"
  | "image"
  | "button"
  | "container"
  | "form"
  | "input"
  | "navigation"
  | "footer"
  | "hero"
  | "card"
  | "list";

export interface ComponentStyles {
  backgroundColor?: string;
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  padding?: string;
  margin?: string;
  borderRadius?: string;
  width?: string;
  height?: string;
  minHeight?: string;
  textAlign?: string;
  display?: string;
  flexDirection?: string;
  alignItems?: string;
  justifyContent?: string;
  gap?: string;
  border?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  objectFit?: string;
  maxWidth?: string;
  lineHeight?: string;
  letterSpacing?: string;
  boxShadow?: string;
}

export interface BuilderComponent {
  id: string;
  type: ComponentType;
  label: string;
  content: string;
  styles: ComponentStyles;
  props: Record<string, string>;
  children?: BuilderComponent[];
}

export interface Project {
  id: string;
  name: string;
  components: BuilderComponent[];
  createdAt: string;
  updatedAt: string;
}

export interface BuilderState {
  projects: Project[];
  currentProject: Project | null;
  selectedComponentId: string | null;
}

export type BuilderAction =
  | { type: "SET_PROJECTS"; payload: Project[] }
  | { type: "SET_CURRENT_PROJECT"; payload: Project | null }
  | { type: "SELECT_COMPONENT"; payload: string | null }
  | { type: "ADD_COMPONENT"; payload: { component: BuilderComponent; index?: number } }
  | { type: "UPDATE_COMPONENT"; payload: { id: string; updates: Partial<BuilderComponent> } }
  | { type: "REMOVE_COMPONENT"; payload: string }
  | { type: "REORDER_COMPONENTS"; payload: BuilderComponent[] }
  | { type: "UPDATE_PROJECT_NAME"; payload: string }
  | { type: "SAVE_PROJECT" }
  | { type: "CREATE_PROJECT"; payload: Project }
  | { type: "DELETE_PROJECT"; payload: string };
