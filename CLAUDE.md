# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a CLI scaffolding tool that creates TypeScript packages with two template options:
- `template-typescript`: Pure TypeScript package with dual CJS/ESM output
- `template-typescript-react`: TypeScript + React package with testing setup

## Development Commands

### Core Development
- `npm run build` - Build the project using tsup (cleans first)
- `npm run watch` - Build in watch mode
- `npm run clean` - Remove dist directory

### Testing & Quality
- `npm test` - Run tests once
- `npm run test:coverage` - Run tests with v8 coverage reporting
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint on src directory
- `npm run typecheck` - Run TypeScript compiler check
- `npm run validate` - Full validation pipeline (lint + typecheck + build + test:coverage)

### Template Development
- Shared config files live in `template-base/` (copied to all scaffolded projects)
- Template-specific files live in `template-typescript/` and `template-typescript-react/`
- Both templates have their own package.json with complete build/test setups
- Template package.json files include comprehensive validation scripts:
  - `npm run typevalidation` - Check types with @arethetypeswrong/cli
  - `npm run size` - Check bundle size limits with size-limit
  - `npm run format` - Format code with prettier

## Architecture & Structure

### Source Modules
- `src/index.ts` - CLI entry point: argument parsing, interactive prompts (`prompts` package), console output
- `src/scaffold.ts` - Template application: directory prep, file copying with base+overlay merge, `package.json` name mutation, `README.md` placeholder substitution
- `src/helpers.ts` - Pure utility functions: `formatTargetDirectory`, `isEmpty`, `isValidPackageName`, `packageFromUserAgent`, `toValidPackageName`

### Template System (base + overlay)
- `template-base/` contains shared files: `tsconfig.json`, `.editorconfig`, `.prettierignore`, `LICENSE`, `README.md`, `_gitignore`, `.github/workflows/`, `.husky/`
- `template-typescript/` and `template-typescript-react/` contain only template-specific files (eslint config, vitest config, setup files, globals.d.ts, package.json, src/)
- `scaffold()` merges base + overlay at copy time; template-specific files take precedence over base
- Note: directory-level merge is not supported — if a directory exists in both base and overlay, only the overlay version is copied

### Build Configuration
- Main package uses ESM-only output via tsup
- Templates generate both CJS and ESM bundles with proper exports field
- TypeScript config extends @gilbarbara/tsconfig with Node.js ESM support
- Requires Node.js >= 20.0.0

### Testing Setup
- Vitest with globals enabled
- Three test files: `index.test.ts` (integration via execa), `scaffold.test.ts` (unit), `helpers.test.ts` (unit)
- Coverage via @vitest/coverage-v8 with 80% thresholds (statements, branches, functions, lines)
- `src/index.ts` excluded from coverage (tested via subprocess integration tests)
- React template includes @testing-library/react and happy-dom

## Key Dependencies
- `prompts` - Interactive CLI prompts
- `kolorist` - Terminal colors
- `minimist` - Command line argument parsing
- `tsup` - TypeScript bundler for build output
- `vitest` - Test framework
- ESLint/Prettier configs from @gilbarbara packages

## Package Management
- Uses pnpm as the primary package manager
- Supports npm, yarn, pnpm, and bun through user agent detection
- Husky git hooks for pre-commit validation
