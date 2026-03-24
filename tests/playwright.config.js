import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { outputFolder: "playwright-report" }], ["list"]],
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  ],
  webServer: [
    {
      command: "cd ../frontend && npm run preview",
      url: "http://localhost:5173",
      reuseExistingServer: true,
      timeout: 30000,
    },
    {
      command: "cd ../api && dotnet run",
      url: "http://localhost:5000/health",
      reuseExistingServer: true,
      timeout: 60000,
    },
  ],
});
