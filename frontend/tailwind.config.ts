import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    // src/ structure (shadcn components)
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    // root app/ structure (active Next.js app router)
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        display: ["Poppins", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SF Mono", "Menlo", "Consolas", "monospace"],
      },
      colors: {
        // shadcn/ui semantic tokens (wired to DKube light mode in globals.css)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // DKube brand scale — use these directly with `text-dk-purple-700` etc.
        dk: {
          purple: {
            900: "#4A3878",
            800: "#5C4A8E",
            700: "#7660A8",
            600: "#8773B5",
            500: "#9384BD",
            400: "#B0A4CE",
            300: "#C9C0DE",
            200: "#E2DCEE",
            100: "#F1EEF8",
            50:  "#F8F6FB",
          },
          gray: {
            900: "#1A1A20",
            800: "#2B2B33",
            700: "#404049",
            600: "#5A5A66",
            500: "#7A7A85",
            400: "#A3A3AC",
            300: "#D6D6D6",
            200: "#E8E8EC",
            100: "#F2F2F4",
            50:  "#F8F8FA",
          },
          ink:     "#0F0F12",
          white:   "#FFFFFF",
          success: "#2E8B57",
          warning: "#C28A00",
          danger:  "#B3261E",
          info:    "#2C6CB0",
        },
      },
      borderRadius: {
        lg:   "var(--dk-radius-lg, 16px)",
        md:   "var(--dk-radius-md, 12px)",
        sm:   "var(--dk-radius-sm, 8px)",
        xl:   "var(--dk-radius-xl, 24px)",
        "2xl":"var(--dk-radius-2xl, 32px)",
        pill: "var(--dk-radius-pill, 999px)",
      },
      boxShadow: {
        xs:    "var(--dk-shadow-xs)",
        sm:    "var(--dk-shadow-sm)",
        md:    "var(--dk-shadow-md)",
        lg:    "var(--dk-shadow-lg)",
        brand: "var(--dk-shadow-brand)",
      },
      transitionTimingFunction: {
        "dk-out":    "cubic-bezier(0.22, 1, 0.36, 1)",
        "dk-in-out": "cubic-bezier(0.65, 0, 0.35, 1)",
      },
      transitionDuration: {
        fast: "150ms",
        base: "240ms",
        slow: "420ms",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config
