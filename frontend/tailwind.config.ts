import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#161616",
        leaf: "#2f7d5a",
        mint: "#dff5ea",
        clay: "#c87545",
        cloud: "#f7f8f5"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(22, 22, 22, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;

