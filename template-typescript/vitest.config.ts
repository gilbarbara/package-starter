import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      all: true,
      reporter: ['text', 'html', 'lcov'],
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
});
