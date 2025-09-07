# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a CLI scaffolding tool that creates TypeScript packages with two template options:
- `template-typescript`: Pure TypeScript package with dual CJS/ESM output
- `template-typescript-react`: TypeScript + React package with testing setup

The main entry point is `src/index.ts` which handles user prompts, template selection, and file copying.

## Development Commands

### Core Development
- `npm run build` - Build the project using tsup (cleans first)
- `npm run watch` - Build in watch mode
- `npm run clean` - Remove dist directory

### Testing & Quality
- `npm test` - Run tests (watch in dev, coverage in CI)
- `npm run test:run` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint on src directory
- `npm run typecheck` - Run TypeScript compiler check
- `npm run validate` - Full validation pipeline (lint + typecheck + build + test)

### Template Development
- Template files live in `template-typescript/` and `template-typescript-react/`
- Both templates have their own package.json with complete build/test setups
- Template package.json files include comprehensive validation scripts:
  - `npm run typevalidation` - Check types with @arethetypeswrong/cli
  - `npm run size` - Check bundle size limits with size-limit
  - `npm run format` - Format code with prettier

## Architecture & Structure

### Main CLI Logic
- Interactive prompts using `prompts` package for user input
- Template selection between TypeScript-only and TypeScript + React
- File copying with automatic renaming (`_gitignore` → `.gitignore`)
- Package name validation and transformation
- Dynamic content replacement: `package.json` name field and README.md title (`{{PACKAGE_NAME}}` placeholder)

### Template System
- Templates are complete package structures with their own configs
- Each template includes:
  - Complete build setup with tsup (dual CJS/ESM output)
  - Vitest testing configuration with coverage
  - ESLint + Prettier configuration from @gilbarbara configs
  - Size-limit checks for bundle optimization
  - GitHub Actions workflow for CI/CD

### Build Configuration
- Main package uses ESM-only output via tsup
- Templates generate both CJS and ESM bundles with proper exports field
- TypeScript config extends @gilbarbara/tsconfig with Node.js ESM support
- All packages target ES2022 with Node 18+ support

### Testing Setup
- Vitest with globals enabled
- React template includes @testing-library/react and happy-dom
- Coverage reporting with @vitest/coverage-v8
- Test files follow `*.test.ts(x)` pattern

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