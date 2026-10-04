import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  workers: 1,
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:4000",
    browserName: "chromium",
    headless: true,
  },
  reporter: "list",
});
