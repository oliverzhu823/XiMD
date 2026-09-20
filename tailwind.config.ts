import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        mac: {
          bg: "var(--mac-bg)",
          surface: "var(--mac-surface)",
          sidebar: "var(--mac-sidebar)",
          border: "var(--mac-border)",
          text: "var(--mac-text)",
          muted: "var(--mac-muted)",
          accent: "var(--mac-accent)",
          hover: "var(--mac-hover)",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "SF Pro Text",
          "Segoe UI",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "SF Mono",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;
