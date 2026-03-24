import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export interface ScaffoldOptions {
  /** Empty target dir first. Default: false */
  overwrite?: boolean;
  /** npm-valid package name */
  packageName: string;
  /** Absolute path to output directory */
  root: string;
  /** Template name */
  template: 'typescript' | 'typescript-react';
  /** Override template base dir (for testing). Defaults to import.meta.url resolution */
  templatesRoot?: string;
}

const renameFiles: Record<string, string | undefined> = {
  _gitignore: '.gitignore',
};

function copy(src: string, destination: string) {
  const stat = fs.statSync(src);

  if (stat.isDirectory()) {
    copyDirectory(src, destination);
  } else {
    fs.copyFileSync(src, destination);
  }
}

function copyDirectory(srcDirectory: string, destinationDirectory: string) {
  fs.mkdirSync(destinationDirectory, { recursive: true });

  for (const file of fs.readdirSync(srcDirectory)) {
    const srcFile = path.resolve(srcDirectory, file);
    const destinationFile = path.resolve(destinationDirectory, file);

    copy(srcFile, destinationFile);
  }
}

function emptyDirectory(directory: string) {
  if (!fs.existsSync(directory)) {
    return;
  }

  for (const file of fs.readdirSync(directory)) {
    if (file === '.git') {
      continue;
    }

    fs.rmSync(path.resolve(directory, file), { recursive: true, force: true });
  }
}

export function scaffold(options: ScaffoldOptions): void {
  const { overwrite, packageName, root, template, templatesRoot } = options;

  if (overwrite) {
    emptyDirectory(root);
  }

  if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
  }

  const resolvedRoot = templatesRoot ?? path.resolve(fileURLToPath(import.meta.url), '../..');
  const baseDirectory = path.resolve(resolvedRoot, 'template-base');
  const templateDirectory = path.resolve(resolvedRoot, `template-${template}`);

  const write = (file: string, content?: string) => {
    const targetPath = path.join(root, renameFiles[file] ?? file);

    if (content !== undefined) {
      fs.writeFileSync(targetPath, content);
    } else {
      // Template-specific file takes precedence over base.
      // Note: directories are not merged — if a directory exists in both base and overlay,
      // only the overlay version is copied.
      const srcPath = fs.existsSync(path.join(templateDirectory, file))
        ? path.join(templateDirectory, file)
        : path.join(baseDirectory, file);

      copy(srcPath, targetPath);
    }
  };

  const baseFiles = fs.readdirSync(baseDirectory);
  const templateFiles = fs.readdirSync(templateDirectory);
  const allFiles = [...new Set([...baseFiles, ...templateFiles])];

  for (const file of allFiles.filter(f => f !== 'package.json' && f !== 'README.md')) {
    write(file);
  }

  const packageJSON = JSON.parse(
    fs.readFileSync(path.join(templateDirectory, 'package.json'), 'utf-8'),
  );

  packageJSON.name = packageName;

  write('package.json', `${JSON.stringify(packageJSON, null, 2)}\n`);

  const readmeContent = fs.readFileSync(path.join(baseDirectory, 'README.md'), 'utf-8');
  const processedReadme = readmeContent.replaceAll('{{PACKAGE_NAME}}', packageName);

  write('README.md', processedReadme);
}
