# @gilbarbara/package-starter

[![npm version](https://badge.fury.io/js/%40gilbarbara%2Fpackage-starter.svg)](https://badge.fury.io/js/%40gilbarbara%2Fpackage-starter) [![CI](https://github.com/gilbarbara/package-starter/actions/workflows/main.yml/badge.svg)](https://github.com/gilbarbara/package-starter/actions/workflows/main.yml)

Scaffold a new NPM package.

## Highlights

- 🏖  **Easy to use:** Just run the command.
- 💫  **Customizable:** Create a Typescript-only package or a TypeScript + React one.
- 🛠 **Compatible:** Uses **tsup** to generate **esm** and **commonjs** bundles.
- 🚧 **Ready for tests:** Uses **vitest** (with **@testing-library/react** in the **TypeScript + React** option) for testing.
- 🚀 **CI/CD:** Includes a workflow for GitHub Actions.

## Usage

With NPM:

```bash
npx @gilbarbara/package-starter
```

With Yarn:

```bash
yarn dlx @gilbarbara/package-starter
```

With PNPM:

```bash
pnpx @gilbarbara/package-starter
```

With Bun:

```bash
bunx @gilbarbara/package-starter
```


Then follow the prompts!

You can also specify the package name you want to use:

```bash
# npm 7+, extra double-dash is needed:
npx @gilbarbara/package-starter my-package

# yarn
yarn dlx @gilbarbara/package-starter my-package

# pnpm
pnpx @gilbarbara/package-starter my-package

# Bun
bunx @gilbarbara/package-starter my-package
```

Currently supported templates are:

- typescript
- typescript-react

> You can use . for the project name to scaffold in the current directory.

## License

MIT
