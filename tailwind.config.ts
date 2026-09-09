import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          hover: "var(--primary-hover)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        // DESIGN.md warm gray palette
        gray: {
          50: "#FAFAFA",
          100: "#F3F3F1",
          200: "#E7E7E3",
          300: "#D5D5D0",
          400: "#A3A39D",
          500: "#74746E",
          600: "#555550",
          700: "#3A3A36",
          900: "#181816",
        },
      },
      borderRadius: {
        lg: "14px",
        md: "10px",
        sm: "6px",
      },
      maxWidth: {
        container: "1360px",
      },
    },
  },
  plugins: [],
};
export default config;
