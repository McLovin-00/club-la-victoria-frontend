import { defineConfig } from "@playwright/test";

const frontendPort = Number(process.env.E2E_FRONTEND_PORT ?? "3100");
const apiUrl = process.env.E2E_API_URL ?? "http://127.0.0.1:3001/api/v1";

export default defineConfig({
  testDir: "./e2e",
  timeout: 120000,
  expect: {
    timeout: 15000,
  },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  use: {
    baseURL: `http://127.0.0.1:${frontendPort}`,
    headless: true,
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: `set NEXT_PUBLIC_API_URL=${apiUrl}&& set NEXT_DISABLE_TURBOPACK=1&& bun run dev -- --port ${frontendPort}`,
    url: `http://127.0.0.1:${frontendPort}`,
    reuseExistingServer: true,
    timeout: 120000,
  },
});
