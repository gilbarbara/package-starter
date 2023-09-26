import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      all: true,
      reporter: ['html', 'lcov'],
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
});
