import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import { customShadows, rainbowBorder } from "./tailwind/plugins";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "rainbow-bottom":
          "linear-gradient(to bottom, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff)",
        "rainbow-right":
          "linear-gradient(to right, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff)",
      },
      screens: {
        xs: "475px",
        ...defaultTheme.screens,
      },
    },
  },
  plugins: [rainbowBorder, customShadows],
};
export default config;
