import fs from 'node:fs';
import path from 'node:path';

import { blue, green, red, reset } from 'kolorist';
import minimist from 'minimist';
import prompts from 'prompts';

import {
  formatTargetDirectory,
  isEmpty,
  isValidPackageName,
  packageFromUserAgent,
  toValidPackageName,
} from './helpers.js';
import { scaffold, type ScaffoldOptions } from './scaffold.js';

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

const defaultTargetDirectory = 'my-package';

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
  const template: ScaffoldOptions['template'] = option?.path || argumentTemplate;

  const packageInfo = packageFromUserAgent(process.env.npm_config_user_agent);
  const packageManager = packageInfo?.name ?? 'npm';

  console.log(`\nScaffolding package in ${root}...`);

  scaffold({
    root,
    template,
    packageName: packageName || getPackageName(),
    overwrite,
  });

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

init().catch(error => {
  console.error(error);
});
