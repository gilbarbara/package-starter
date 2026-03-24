import config from '@gilbarbara/eslint-config';
import vitest from '@gilbarbara/eslint-config/vitest';

export default [
  ...config,
  ...vitest,
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
];
