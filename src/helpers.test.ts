import fs from 'node:fs';
import path from 'node:path';

import {
  formatTargetDirectory,
  isEmpty,
  isValidPackageName,
  packageFromUserAgent,
  toValidPackageName,
} from './helpers.js';

const TEMP_PATH = path.join(__dirname, '..', '.temp', 'helpers-test');

describe('formatTargetDirectory', () => {
  it('returns undefined for undefined input', () => {
    expect(formatTargetDirectory(undefined)).toBeUndefined();
  });

  it('trims whitespace', () => {
    expect(formatTargetDirectory('  my-package  ')).toBe('my-package');
  });

  it('removes trailing slashes', () => {
    expect(formatTargetDirectory('my-package///')).toBe('my-package');
  });

  it('handles empty string', () => {
    expect(formatTargetDirectory('')).toBe('');
  });
});

describe('isEmpty', () => {
  beforeEach(() => {
    fs.mkdirSync(TEMP_PATH, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(TEMP_PATH, { recursive: true, force: true });
  });

  it('returns true for an empty directory', () => {
    expect(isEmpty(TEMP_PATH)).toBe(true);
  });

  it('returns true for a directory with only .git', () => {
    fs.mkdirSync(path.join(TEMP_PATH, '.git'));

    expect(isEmpty(TEMP_PATH)).toBe(true);
  });

  it('returns false for a non-empty directory', () => {
    fs.writeFileSync(path.join(TEMP_PATH, 'file.txt'), 'content');

    expect(isEmpty(TEMP_PATH)).toBe(false);
  });
});

describe('isValidPackageName', () => {
  it('accepts a simple name', () => {
    expect(isValidPackageName('my-package')).toBe(true);
  });

  it('accepts a scoped name', () => {
    expect(isValidPackageName('@my-org/my-package')).toBe(true);
  });

  it('accepts names with dots and underscores', () => {
    expect(isValidPackageName('my.package_name')).toBe(true);
  });

  it('rejects uppercase letters', () => {
    expect(isValidPackageName('My-Package')).toBe(false);
  });

  it('rejects names with spaces', () => {
    expect(isValidPackageName('my package')).toBe(false);
  });

  it('rejects names starting with a dot', () => {
    expect(isValidPackageName('.my-package')).toBe(false);
  });

  it('rejects names starting with an underscore', () => {
    expect(isValidPackageName('_my-package')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidPackageName('')).toBe(false);
  });
});

describe('toValidPackageName', () => {
  it('lowercases the name', () => {
    expect(toValidPackageName('My-Package')).toBe('my-package');
  });

  it('trims whitespace', () => {
    expect(toValidPackageName('  my-package  ')).toBe('my-package');
  });

  it('replaces spaces with dashes', () => {
    expect(toValidPackageName('my cool package')).toBe('my-cool-package');
  });

  it('strips leading dots', () => {
    expect(toValidPackageName('.my-package')).toBe('my-package');
  });

  it('strips leading underscores', () => {
    expect(toValidPackageName('_my-package')).toBe('my-package');
  });

  it('replaces invalid characters with dashes', () => {
    expect(toValidPackageName('my@package!')).toBe('my-package-');
  });
});

describe('packageFromUserAgent', () => {
  it('returns undefined for undefined input', () => {
    expect(packageFromUserAgent(undefined)).toBeUndefined();
  });

  it('parses npm user agent', () => {
    expect(packageFromUserAgent('npm/9.0.0 node/v18.0.0')).toEqual({
      name: 'npm',
      version: '9.0.0',
    });
  });

  it('parses yarn user agent', () => {
    expect(packageFromUserAgent('yarn/1.22.0 npm/? node/v18.0.0')).toEqual({
      name: 'yarn',
      version: '1.22.0',
    });
  });

  it('parses pnpm user agent', () => {
    expect(packageFromUserAgent('pnpm/8.0.0 npm/? node/v18.0.0')).toEqual({
      name: 'pnpm',
      version: '8.0.0',
    });
  });
});
