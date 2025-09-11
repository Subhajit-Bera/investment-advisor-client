// frontend/tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  // This path tells Tailwind to scan all these files for class names.
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // This is the important one for you
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;