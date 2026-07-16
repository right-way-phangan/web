import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Юнит-тесты фронт-логики (хуки, чистые функции). jsdom нужен для renderHook
// из @testing-library/react. Тесты лежат рядом с кодом как `*.test.ts(x)`.
// alias `@` → src нужен, чтобы `@/...`-импорты резолвились под vitest (как в tsconfig).
export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
