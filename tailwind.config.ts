import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        alinda: {
          ink: "#181614",
          "ink-soft": "#3A3733",
          cream: "#FAF8F5",
          surface: "#FFFFFF",
          line: "#E8E2DA",
          muted: "#8A847C",
          accent: "#B86F61",
          "accent-soft": "#F3E4E0",
          success: "#3E7A5C",
          danger: "#B64C4C"
        }
      },
      borderRadius: {
        sm: "10px",
        md: "14px",
        lg: "20px",
        xl: "28px"
      },
      boxShadow: {
        card: "0 1px 2px rgba(24, 22, 20, 0.04)",
        elevated: "0 12px 32px rgba(24, 22, 20, 0.08)",
        modal: "0 24px 64px rgba(24, 22, 20, 0.14)"
      }
    }
  },
  plugins: []
};

export default config;
