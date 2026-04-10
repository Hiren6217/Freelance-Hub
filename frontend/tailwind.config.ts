import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0F0F0F",
        ember: "#FF6B00",
        mist: "#F5F5F5",
        slate: "#2E2E2E"
      }
    }
  },
  plugins: []
};

export default config;
