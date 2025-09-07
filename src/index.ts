/* eslint-disable no-continue */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { blue, green, red, reset } from 'kolorist';
import minimist from 'minimist';
import prompts from 'prompts';

// Avoids auto-conversion to number of the package name by defining that the args non-associated with an option ( _ ) needs to be parsed as a string. See #4606
const argv = minimist<{
  t?: string;
  template?: string;
}>(process.argv.slice(2), { string: ['_'] });
const cwd = process.cwd();

type ColorFunction = (input: string | number) => string;
type Option = {
  color: ColorFunction;
  name: string;
  path: string;
};

const OPTIONS: Array<Option> = [
  {
    color: green,
    name: 'Typescript',
    path: 'typescript',
  },
  {
    color: blue,
    name: 'Typescript + React',
    path: 'typescript-react',
  },
];

const TEMPLATES = OPTIONS.reduce<Array<string>>((acc, option) => [...acc, option.path], []);

const renameFiles: Record<string, string | undefined> = {
  _gitignore: '.gitignore',
};

const defaultTargetDirectory = 'my-package';

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

function formatTargetDirectory(targetDirectory: string | undefined) {
  return targetDirectory?.trim().replace(/\/+$/g, '');
}

async function init() {
  const argumentTargetDirectory = formatTargetDirectory(argv._[0]);
  const argumentTemplate = argv.template ?? argv.t;

  let targetDirectory = argumentTargetDirectory ?? defaultTargetDirectory;
  const getPackageName = () =>
    targetDirectory === '.' ? path.basename(path.resolve()) : targetDirectory;

  let result: prompts.Answers<'name' | 'overwrite' | 'packageName' | 'option'>;

  try {
    result = await prompts(
      [
        {
          type: argumentTargetDirectory ? null : 'text',
          name: 'name',
          message: reset('Package name:'),
          initial: defaultTargetDirectory,
          onState: state => {
            targetDirectory = formatTargetDirectory(state.value) ?? defaultTargetDirectory;
          },
        },
        {
          type: () =>
            !fs.existsSync(targetDirectory) || isEmpty(targetDirectory) ? null : 'confirm',
          name: 'overwrite',
          message: () =>
            `${
              targetDirectory === '.'
                ? 'Current directory'
                : `Target directory "${targetDirectory}"`
            } is not empty. Remove existing files and continue?`,
        },
        {
          type: (_, { overwrite }: { overwrite: boolean | undefined }) => {
            if (overwrite === false) {
              throw new Error(`${red('✖')} Operation cancelled`);
            }

            return null;
          },
          name: 'overwriteChecker',
        },
        {
          type: () => (isValidPackageName(getPackageName()) ? null : 'text'),
          name: 'packageName',
          message: reset('Package name:'),
          initial: () => toValidPackageName(getPackageName()),
          validate: directory => isValidPackageName(directory) || 'Invalid package.json name',
        },
        {
          type: argumentTemplate && TEMPLATES.includes(argumentTemplate) ? null : 'select',
          name: 'option',
          message:
            typeof argumentTemplate === 'string' && !TEMPLATES.includes(argumentTemplate)
              ? reset(`"${argumentTemplate}" isn't a valid template. Please choose from below: `)
              : reset('Select an option:'),
          initial: 0,
          choices: OPTIONS.map(option => {
            const optionColor = option.color;

            return {
              title: optionColor(option.name || option.path),
              value: option,
            };
          }),
        },
      ],
      {
        onCancel: () => {
          throw new Error(`${red('✖')} Operation cancelled`);
        },
      },
    );
  } catch (error: any) {
    console.log(error.message);

    return;
  }

  // user choice associated with prompts
  const { option, overwrite, packageName } = result;

  const root = path.join(cwd, targetDirectory);

  if (overwrite) {
    emptyDirectory(root);
  } else if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
  }

  // determine template
  const template: string = option?.path || argumentTemplate;

  const packageInfo = packageFromUserAgent(process.env.npm_config_user_agent);
  const packageManager = packageInfo?.name ?? 'npm';

  console.log(`\nScaffolding package in ${root}...`);

  const templateDirectory = path.resolve(
    fileURLToPath(import.meta.url),
    '../..',
    `template-${template}`,
  );

  const write = (file: string, content?: string) => {
    const targetPath = path.join(root, renameFiles[file] ?? file);

    if (content) {
      fs.writeFileSync(targetPath, content);
    } else {
      copy(path.join(templateDirectory, file), targetPath);
    }
  };

  const files = fs.readdirSync(templateDirectory);

  for (const file of files.filter(f => f !== 'package.json' && f !== 'README.md')) {
    write(file);
  }

  const packageJSON = JSON.parse(
    fs.readFileSync(path.join(templateDirectory, `package.json`), 'utf-8'),
  );

  packageJSON.name = packageName || getPackageName();

  write('package.json', `${JSON.stringify(packageJSON, null, 2)}\n`);

  // Process README.md with package name replacement
  const readmeContent = fs.readFileSync(path.join(templateDirectory, 'README.md'), 'utf-8');
  const processedReadme = readmeContent.replace(
    /{{PACKAGE_NAME}}/g,
    packageName || getPackageName(),
  );

  write('README.md', processedReadme);

  const cdPackageName = path.relative(cwd, root);

  console.log(`\nDone. Now run:\n`);

  if (root !== cwd) {
    console.log(`  cd ${cdPackageName.includes(' ') ? `"${cdPackageName}"` : cdPackageName}`);
  }

  if (packageManager === 'yarn') {
    console.log('  yarn');
  } else {
    console.log(`  ${packageManager} install`);
  }

  console.log();
}

function isEmpty(directory: string) {
  const files = fs.readdirSync(directory);

  return files.length === 0 || (files.length === 1 && files[0] === '.git');
}

function isValidPackageName(name: string) {
  return /^(?:@[\d*a-z~-][\d*._a-z~-]*\/)?[\da-z~-][\d._a-z~-]*$/.test(name);
}

function packageFromUserAgent(userAgent: string | undefined) {
  if (!userAgent) {
    return undefined;
  }

  const packageSpec = userAgent.split(' ')[0];
  const packageSpecArray = packageSpec.split('/');

  return {
    name: packageSpecArray[0],
    version: packageSpecArray[1],
  };
}

function toValidPackageName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^[._]/, '')
    .replace(/[^\da-z~-]+/g, '-');
}

// eslint-disable-next-line unicorn/prefer-top-level-await
init().catch(error => {
  console.error(error);
});
