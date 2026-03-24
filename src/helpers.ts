import fs from 'node:fs';

export function formatTargetDirectory(targetDirectory: string | undefined) {
  return targetDirectory?.trim().replace(/\/+$/g, '');
}

export function isEmpty(directory: string) {
  const files = fs.readdirSync(directory);

  return files.length === 0 || (files.length === 1 && files[0] === '.git');
}

export function isValidPackageName(name: string) {
  return /^(?:@[\da-z~-][\d._a-z~-]*\/)?[\da-z~-][\d._a-z~-]*$/.test(name);
}

export function packageFromUserAgent(userAgent: string | undefined) {
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

export function toValidPackageName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^[._]/, '')
    .replace(/[^\da-z~-]+/g, '-');
}
