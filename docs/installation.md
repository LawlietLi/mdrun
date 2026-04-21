# Installation

## Requirements

- Node.js ≥ 18

## Global Install

Install mdrun globally to use it from any directory:

```sh
npm install -g @leyohli/mdrun
```

Verify the installation:

```sh
mdrun --version
```

## Without Installing

Run mdrun directly with `npx` without a global install:

```sh
npx @leyohli/mdrun --help
npx @leyohli/mdrun -f mdrun.md --tree
```

## Package Managers

```sh
# npm
npm install -g @leyohli/mdrun

# pnpm
pnpm add -g @leyohli/mdrun

# yarn
yarn global add @leyohli/mdrun

# bun
bun add -g @leyohli/mdrun
```

## Default File Discovery

When `-f` is not specified, mdrun searches the current directory in this order:

| Priority | File | Intended use |
| --- | --- | --- |
| 1 | `mdrun.md` | Dedicated task file |
| 2 | `BUILD.md` | Build and development commands |
| 3 | `SKILL.md` | AI agent skill entry point |
| 4 | `README.md` | Universal project entry |

The order reflects "intent clarity" — earlier files are more explicitly prepared for mdrun.
