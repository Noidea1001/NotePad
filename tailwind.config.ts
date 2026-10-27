import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        app: {
          bg: "var(--app-bg)",
          sidebar: "var(--sidebar-bg)",
          sidebarActive: "var(--sidebar-active)",
          sidebarHover: "var(--sidebar-hover)",
          canvas: "var(--canvas-bg)",
          surface: "var(--surface-bg)",
          card: "var(--card-bg)",
          border: "var(--border-color)",
          borderLight: "var(--border-light)",
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          accent: "var(--accent-color)",
          accentHover: "var(--accent-hover)",
          accentMuted: "var(--accent-muted)",
          success: "var(--color-success)",
          warning: "var(--color-warning)",
          danger: "var(--color-danger)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
        elevation: "0 10px 30px -10px rgba(0, 0, 0, 0.3)",
      },
    },
  },
  plugins: [],
};
export default config;
