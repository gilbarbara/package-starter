import { join } from 'node:path';

import type { SyncOptions, SyncResult } from 'execa';
import { execaCommandSync } from 'execa';
import fs from 'fs-extra';

const packageName = 'test-app';

const CLI_PATH = join(__dirname, '..');
const TEMP_PATH = join(__dirname, '..', '.temp');
const GEN_PATH = join(TEMP_PATH, packageName);

const run = (arguments_: string[], options: SyncOptions = {}): SyncResult => {
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

  it('prompts for the package name if none supplied', () => {
    const { stdout } = run([]);

    expect(stdout).toContain('Package name:');
  });

  it('prompts for the options if none supplied when target dir is current directory', () => {
    fs.mkdirpSync(GEN_PATH);
    const { stdout } = run(['.'], { cwd: GEN_PATH });

    expect(stdout).toContain('Select an option:');
  });

  it('asks to overwrite non-empty target directory', () => {
    createNonEmptyDirectory();
    const { stdout } = run([packageName], { cwd: TEMP_PATH });

    expect(stdout).toContain(`Target directory "${packageName}" is not empty.`);
  });

  it('asks to overwrite non-empty current directory', () => {
    createNonEmptyDirectory();
    const { stdout } = run(['.'], { cwd: GEN_PATH });

    expect(stdout).toContain(`Current directory is not empty.`);
  });

  it('works with the -t alias', () => {
    const { stdout } = run([packageName, '-t', 'typescript'], {
      cwd: TEMP_PATH,
    });
    const generatedFiles = fs.readdirSync(GEN_PATH).sort();

    // Assertions
    expect(stdout).toContain(`Scaffolding package in ${GEN_PATH}`);
    expect(templateFiles).toEqual(generatedFiles);
  });

  it('replaces package name in README.md title for typescript template', () => {
    run([packageName, '--template', 'typescript'], {
      cwd: TEMP_PATH,
    });

    const readmeContent = fs.readFileSync(join(GEN_PATH, 'README.md'), 'utf-8');

    expect(readmeContent).toContain(`# ${packageName}`);
    expect(readmeContent).not.toContain('{{PACKAGE_NAME}}');
  });

  it('replaces package name in README.md title for typescript-react template', () => {
    run([packageName, '--template', 'typescript-react'], {
      cwd: TEMP_PATH,
    });

    const readmeContent = fs.readFileSync(join(GEN_PATH, 'README.md'), 'utf-8');

    expect(readmeContent).toContain(`# ${packageName}`);
    expect(readmeContent).not.toContain('{{PACKAGE_NAME}}');
  });

  it('updates package.json with correct name', () => {
    run([packageName, '--template', 'typescript'], {
      cwd: TEMP_PATH,
    });

    const packageJsonContent = fs.readFileSync(join(GEN_PATH, 'package.json'), 'utf-8');
    const packageJson = JSON.parse(packageJsonContent);

    expect(packageJson.name).toBe(packageName);
  });

  it('works with custom package names containing special characters', () => {
    const customPackageName = '@my-org/awesome-package';
    const customGenPath = join(TEMP_PATH, '@my-org', 'awesome-package');

    run([customPackageName, '--template', 'typescript'], {
      cwd: TEMP_PATH,
    });

    const readmeContent = fs.readFileSync(join(customGenPath, 'README.md'), 'utf-8');
    const packageJsonContent = fs.readFileSync(join(customGenPath, 'package.json'), 'utf-8');
    const packageJson = JSON.parse(packageJsonContent);

    expect(readmeContent).toContain(`# ${customPackageName}`);
    expect(packageJson.name).toBe(customPackageName);

    // Clean up - remove the entire @my-org directory
    fs.removeSync(join(TEMP_PATH, '@my-org'));
  });
});
