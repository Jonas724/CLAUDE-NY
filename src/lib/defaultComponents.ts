import { BuilderComponent, ComponentType } from "./types";
import { v4 as uuidv4 } from "uuid";

interface ComponentTemplate {
  type: ComponentType;
  label: string;
  content: string;
  styles: BuilderComponent["styles"];
  props: Record<string, string>;
  children?: BuilderComponent[];
}

const templates: Record<ComponentType, ComponentTemplate> = {
  hero: {
    type: "hero",
    label: "Hjaltsektion",
    content: "Valommen till var webbplats",
    styles: {
      backgroundColor: "#6366f1",
      color: "#ffffff",
      fontSize: "48px",
      fontWeight: "bold",
      padding: "80px 40px",
      textAlign: "center",
      minHeight: "400px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "16px",
      width: "100%",
    },
    props: {
      subtitle: "Bygg nagot fantastiskt idag",
    },
  },
  text: {
    type: "text",
    label: "Text",
    content: "Skriv din text har...",
    styles: {
      color: "#1f2937",
      fontSize: "16px",
      padding: "12px 16px",
      lineHeight: "1.6",
      width: "100%",
    },
    props: {},
  },
  image: {
    type: "image",
    label: "Bild",
    content: "",
    styles: {
      width: "100%",
      height: "300px",
      objectFit: "cover",
      borderRadius: "8px",
      backgroundColor: "#e2e8f0",
    },
    props: {
      src: "https://placehold.co/800x400/6366f1/ffffff?text=Bild",
      alt: "Platshallarbild",
    },
  },
  button: {
    type: "button",
    label: "Knapp",
    content: "Klicka har",
    styles: {
      backgroundColor: "#6366f1",
      color: "#ffffff",
      fontSize: "16px",
      fontWeight: "600",
      padding: "12px 24px",
      borderRadius: "8px",
      textAlign: "center",
      display: "inline-block",
      border: "none",
    },
    props: {
      href: "#",
    },
  },
  container: {
    type: "container",
    label: "Behalare",
    content: "",
    styles: {
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      width: "100%",
      minHeight: "100px",
      backgroundColor: "#ffffff",
    },
    props: {},
  },
  form: {
    type: "form",
    label: "Formular",
    content: "",
    styles: {
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      width: "100%",
      maxWidth: "500px",
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },
    props: {
      action: "#",
    },
  },
  input: {
    type: "input",
    label: "Inmatningsfalt",
    content: "",
    styles: {
      padding: "10px 14px",
      fontSize: "14px",
      border: "1px solid #d1d5db",
      borderRadius: "6px",
      width: "100%",
      backgroundColor: "#ffffff",
      color: "#1f2937",
    },
    props: {
      placeholder: "Ange text...",
      type: "text",
      name: "field",
    },
  },
  navigation: {
    type: "navigation",
    label: "Navigation",
    content: "Min Webbplats",
    styles: {
      backgroundColor: "#1f2937",
      color: "#ffffff",
      padding: "16px 32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      fontSize: "18px",
      fontWeight: "bold",
    },
    props: {
      links: "Hem,Om oss,Tjanster,Kontakt",
    },
  },
  footer: {
    type: "footer",
    label: "Sidfot",
    content: "\u00a9 2026 Min Webbplats. Alla rattigheter forbehallna.",
    styles: {
      backgroundColor: "#1f2937",
      color: "#9ca3af",
      padding: "32px",
      textAlign: "center",
      fontSize: "14px",
      width: "100%",
    },
    props: {},
  },
  card: {
    type: "card",
    label: "Kort",
    content: "Kortrubrik",
    styles: {
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      padding: "24px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      width: "100%",
      maxWidth: "400px",
    },
    props: {
      description: "Kort beskrivning av innehallet i detta kort.",
    },
  },
  list: {
    type: "list",
    label: "Lista",
    content: "",
    styles: {
      padding: "16px 16px 16px 32px",
      fontSize: "16px",
      lineHeight: "2",
      color: "#1f2937",
      width: "100%",
    },
    props: {
      items: "Forsta objektet,Andra objektet,Tredje objektet,Fjarde objektet",
      ordered: "false",
    },
  },
};

export function createComponent(type: ComponentType): BuilderComponent {
  const template = templates[type];
  return {
    id: uuidv4(),
    type: template.type,
    label: template.label,
    content: template.content,
    styles: { ...template.styles },
    props: { ...template.props },
    children: template.children ? template.children.map((c) => ({ ...c, id: uuidv4() })) : undefined,
  };
}

export function getComponentIcon(type: ComponentType): string {
  const icons: Record<ComponentType, string> = {
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
  return icons[type];
}

export function getComponentLabel(type: ComponentType): string {
  const labels: Record<ComponentType, string> = {
    hero: "Hjaltsektion",
    text: "Text",
    image: "Bild",
    button: "Knapp",
    container: "Behalare",
    form: "Formular",
    input: "Inmatningsfalt",
    navigation: "Navigation",
    footer: "Sidfot",
    card: "Kort",
    list: "Lista",
  };
  return labels[type];
}

export const componentTypes: ComponentType[] = [
  "hero",
  "navigation",
  "text",
  "image",
  "button",
  "container",
  "card",
  "form",
  "input",
  "list",
  "footer",
];
