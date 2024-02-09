import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        "accent-1": "var(--accent-1)",
        "border-1": "var(--border-1)",
        "foreground-1": "var(--foreground-1)",
        "foreground-2": "var(--foreground-2)",
        "background-1": "var(--background-1)",
        "background-2": "var(--background-2)",

      }
    },
  },
  plugins: [],
};
export default config;
