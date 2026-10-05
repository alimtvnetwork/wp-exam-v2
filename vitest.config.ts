import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

const hasNodeOptions = Boolean(process.env.NODE_OPTIONS);
const hasMaxOldSpace = hasNodeOptions && process.env.NODE_OPTIONS!.includes("--max-old-space-size");

if (!hasMaxOldSpace) {
  process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS || ""} --max-old-space-size=4096`.trim();
}

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    poolOptions: {
      threads: {
        execArgv: ["--max-old-space-size=4096"],
        singleThread: true,
      },
      forks: {
        execArgv: ["--max-old-space-size=4096"],
        singleFork: true,
      },
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
