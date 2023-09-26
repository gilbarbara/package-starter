import { join } from 'node:path';

import type { ExecaSyncReturnValue, SyncOptions } from 'execa';
import { execaCommandSync } from 'execa';
import fs from 'fs-extra';

const packageName = 'test-app';

const CLI_PATH = join(__dirname, '..');
const TEMP_PATH = join(__dirname, '..', '.temp');
const GEN_PATH = join(TEMP_PATH, packageName);

const run = (arguments_: string[], options: SyncOptions = {}): ExecaSyncReturnValue => {
  return execaCommandSync(`node ${CLI_PATH} ${arguments_.join(' ')}`, options);
};

// Helper to create a non-empty directory
const createNonEmptyDirectory = () => {
  // Create the temporary directory
  fs.mkdirpSync(GEN_PATH);

  // Create a package.json file
  const packageJson = join(GEN_PATH, 'package.json');

  fs.writeFileSync(packageJson, '{ "foo": "bar" }');
};

// Vue 3 starter template
const templateFiles = fs
  .readdirSync(join(CLI_PATH, 'template-typescript'))
  // _gitignore is renamed to .gitignore
  .map(filePath => (filePath === '_gitignore' ? '.gitignore' : filePath))
  .sort();

describe('CLI', () => {
  beforeAll(() => fs.remove(GEN_PATH));
  afterEach(() => fs.remove(GEN_PATH));

  test('prompts for the package name if none supplied', () => {
    const { stdout } = run([]);

    expect(stdout).toContain('Package name:');
  });

  test('prompts for the options if none supplied when target dir is current directory', () => {
    fs.mkdirpSync(GEN_PATH);
    const { stdout } = run(['.'], { cwd: GEN_PATH });

    expect(stdout).toContain('Select an option:');
  });

  test('asks to overwrite non-empty target directory', () => {
    createNonEmptyDirectory();
    const { stdout } = run([packageName], { cwd: TEMP_PATH });

    expect(stdout).toContain(`Target directory "${packageName}" is not empty.`);
  });

  test('asks to overwrite non-empty current directory', () => {
    createNonEmptyDirectory();
    const { stdout } = run(['.'], { cwd: GEN_PATH });

    expect(stdout).toContain(`Current directory is not empty.`);
  });

  test('works with the -t alias', () => {
    const { stdout } = run([packageName, '-t', 'typescript'], {
      cwd: TEMP_PATH,
    });
    const generatedFiles = fs.readdirSync(GEN_PATH).sort();

    // Assertions
    expect(stdout).toContain(`Scaffolding package in ${GEN_PATH}`);
    expect(templateFiles).toEqual(generatedFiles);
  });
});
