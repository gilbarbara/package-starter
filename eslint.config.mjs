import config from '@gilbarbara/eslint-config/base';
import testingLibrary from '@gilbarbara/eslint-config/testing-library';
import vitest from '@gilbarbara/eslint-config/vitest';

export default [
  ...config,
  ...vitest,
  ...testingLibrary,
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  {
    rules: {
      'no-console': 'off',
      'vitest/consistent-test-it': 'off',
    },
  },
  {
    files: ['./template-typescript/**/*.ts?(x)', './template-typescript-react/**/*.ts?(x)'],
    rules: {
      'import/no-unresolved': 'off',
    },
  },
];
