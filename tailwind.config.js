/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        builder: {
          bg: "#0f1117",
          sidebar: "#1a1d27",
          canvas: "#252830",
          accent: "#6366f1",
          accentHover: "#818cf8",
          border: "#2e3140",
          text: "#e2e8f0",
          textMuted: "#94a3b8",
          success: "#22c55e",
          danger: "#ef4444",
          warning: "#f59e0b",
        },
      },
    },
  },
  plugins: [],
};
