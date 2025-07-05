# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

Extension development:
```bash
# Start extension development
bun ext:dev

# Build extension
bun --filter extension build

# Type checking
bun --filter extension compile

# Build Firefox version
bun --filter extension build:firefox
```

Toolkit development:
```bash
# Start toolkit development server
bun toolkit:dev

# Build toolkit
bun --filter toolkit build

# Lint toolkit code
bun --filter toolkit lint

# Type check toolkit
bun --filter toolkit tsc -b
```

## Architecture

This is a monorepo containing two main packages:

1. `extension/`: Browser extension built with WXT that provides JSON manipulation tools
2. `toolkit/`: React web application powering the extension's UI

Key technologies:
- React 19 with TypeScript 
- Vite for build tooling
- TailwindCSS + Radix UI for styling
- React Router for navigation
- JSON libraries:
  - vanilla-jsoneditor for editing
  - json-diff for diffing
  - json-to-ts/schema2dts for type generation

The codebase is structured around pages and reusable UI components, with pages like DiffPage and JsonEditor implementing the core JSON manipulation functionality.