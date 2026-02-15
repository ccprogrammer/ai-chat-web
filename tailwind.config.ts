import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // GitHub-like palette
        gh: {
          bg: "var(--gh-bg)",
          "bg-subtle": "var(--gh-bg-subtle)",
          border: "var(--gh-border)",
          "border-muted": "var(--gh-border-muted)",
          fg: "var(--gh-fg)",
          "fg-muted": "var(--gh-fg-muted)",
          accent: "var(--gh-accent)",
          "accent-fg": "var(--gh-accent-fg)",
          success: "var(--gh-success)",
          danger: "var(--gh-danger)",
          "input-bg": "var(--gh-input-bg)",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Noto Sans",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "SF Mono",
          "Menlo",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
