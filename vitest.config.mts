import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: ['src/**/*.test.ts', 'src/index.ts'],
      include: ['src/**/*.ts'],
      reporter: ['text', 'lcov'],
      provider: 'v8',
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    globals: true,
    include: ['src/**/*.test.ts?(x)'],
  },
});
