import { defineConfig } from "vitest/config";

// Юнит-тесты фронт-логики (хуки, чистые функции). jsdom нужен для renderHook
// из @testing-library/react. Тесты лежат рядом с кодом как `*.test.ts(x)`.
export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
