import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        kingdom: {
          purple: "hsl(var(--kingdom-purple))",
          gold: "hsl(var(--kingdom-gold))",
          green: "hsl(var(--kingdom-green))",
          sky: "hsl(var(--kingdom-sky))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "sparkle": {
          "0%, 100%": { opacity: "0.5", transform: "scale(1.2)" },
          "50%": { opacity: "0.5", transform: "scale(1.2)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "float": "float 3s ease-in-out infinite",
        "sparkle": "sparkle 2s ease-in-out infinite",
        "slide-up": "slide-up 0.4s ease-out",
      },
    },
  },
}

export default config
