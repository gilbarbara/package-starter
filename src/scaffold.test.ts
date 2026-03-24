import fs from 'node:fs';
import path from 'node:path';

import { scaffold } from './scaffold.js';

const CLI_PATH = path.join(__dirname, '..');
const TEMP_PATH = path.join(__dirname, '..', '.temp');
const GEN_PATH = path.join(TEMP_PATH, 'scaffold-test');

beforeEach(() => {
  fs.rmSync(GEN_PATH, { recursive: true, force: true });
});

afterAll(() => {
  fs.rmSync(GEN_PATH, { recursive: true, force: true });
});

describe('scaffold', () => {
  it('copies template files with correct renames', () => {
    scaffold({
      root: GEN_PATH,
      template: 'typescript',
      packageName: 'test-pkg',
      templatesRoot: CLI_PATH,
    });

    expect(fs.existsSync(path.join(GEN_PATH, '.gitignore'))).toBe(true);
    expect(fs.existsSync(path.join(GEN_PATH, '_gitignore'))).toBe(false);
    expect(fs.existsSync(path.join(GEN_PATH, 'src', 'index.ts'))).toBe(true);
  });

  it('sets package.json name', () => {
    scaffold({
      root: GEN_PATH,
      template: 'typescript',
      packageName: 'my-cool-package',
      templatesRoot: CLI_PATH,
    });

    const package_ = JSON.parse(fs.readFileSync(path.join(GEN_PATH, 'package.json'), 'utf-8'));

    expect(package_.name).toBe('my-cool-package');
  });

  it('replaces {{PACKAGE_NAME}} in README.md', () => {
    scaffold({
      root: GEN_PATH,
      template: 'typescript',
      packageName: 'my-cool-package',
      templatesRoot: CLI_PATH,
    });

    const readme = fs.readFileSync(path.join(GEN_PATH, 'README.md'), 'utf-8');

    expect(readme).toContain('# my-cool-package');
    expect(readme).not.toContain('{{PACKAGE_NAME}}');
  });

  it('creates target directory when missing', () => {
    const nested = path.join(GEN_PATH, 'nested', 'dir');

    scaffold({
      root: nested,
      template: 'typescript',
      packageName: 'test-pkg',
      templatesRoot: CLI_PATH,
    });

    expect(fs.existsSync(path.join(nested, 'package.json'))).toBe(true);
  });

  it('empties target directory when overwrite is true', () => {
    fs.mkdirSync(GEN_PATH, { recursive: true });
    fs.writeFileSync(path.join(GEN_PATH, 'stale-file.txt'), 'old content');

    scaffold({
      root: GEN_PATH,
      template: 'typescript',
      packageName: 'test-pkg',
      overwrite: true,
      templatesRoot: CLI_PATH,
    });

    expect(fs.existsSync(path.join(GEN_PATH, 'stale-file.txt'))).toBe(false);
    expect(fs.existsSync(path.join(GEN_PATH, 'package.json'))).toBe(true);
  });

  it('preserves .git directory when overwrite is true', () => {
    fs.mkdirSync(path.join(GEN_PATH, '.git'), { recursive: true });
    fs.writeFileSync(path.join(GEN_PATH, '.git', 'HEAD'), 'ref: refs/heads/main');
    fs.writeFileSync(path.join(GEN_PATH, 'stale-file.txt'), 'old content');

    scaffold({
      root: GEN_PATH,
      template: 'typescript',
      packageName: 'test-pkg',
      overwrite: true,
      templatesRoot: CLI_PATH,
    });

    expect(fs.existsSync(path.join(GEN_PATH, '.git', 'HEAD'))).toBe(true);
    expect(fs.existsSync(path.join(GEN_PATH, 'stale-file.txt'))).toBe(false);
  });

  it('includes base-only files in output', () => {
    scaffold({
      root: GEN_PATH,
      template: 'typescript',
      packageName: 'test-pkg',
      templatesRoot: CLI_PATH,
    });

    expect(fs.existsSync(path.join(GEN_PATH, '.editorconfig'))).toBe(true);
    expect(fs.existsSync(path.join(GEN_PATH, 'LICENSE'))).toBe(true);
    expect(fs.existsSync(path.join(GEN_PATH, 'tsconfig.json'))).toBe(true);
  });

  it('works with the typescript-react template', () => {
    scaffold({
      root: GEN_PATH,
      template: 'typescript-react',
      packageName: '@my-org/react-pkg',
      templatesRoot: CLI_PATH,
    });

    const package_ = JSON.parse(fs.readFileSync(path.join(GEN_PATH, 'package.json'), 'utf-8'));
    const readme = fs.readFileSync(path.join(GEN_PATH, 'README.md'), 'utf-8');

    expect(package_.name).toBe('@my-org/react-pkg');
    expect(readme).toContain('# @my-org/react-pkg');
    expect(fs.existsSync(path.join(GEN_PATH, 'src'))).toBe(true);
  });
});
