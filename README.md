# mdrun

A Markdown-based task runner — **documentation first, commands second**.

Commands are declared via metadata in fenced code block info strings. Your documents render normally in any Markdown viewer; mdrun simply executes the scripts you've already written.

Inspired by [Makefile](https://www.gnu.org/software/make/), [just](https://github.com/casey/just), and [mask](https://github.com/jacobdeichert/mask) — with a focus on keeping documentation and executable commands in the same place, readable by both humans and AI agents.

> [中文文档](./README.zh.md)

## Why mdrun?

Most task runners require you to write a dedicated config file (`Makefile`, `Taskfile.yml`, `package.json` scripts). mdrun lets you embed executable commands directly in any Markdown document — your `README.md`, `BUILD.md`, or a `SKILL.md` used by an AI agent — without affecting how the document reads.

Markdown's natural structure also makes it a good fit for [progressive disclosure](https://en.wikipedia.org/wiki/Progressive_disclosure) to AI agents. Instead of loading an entire document into context, an agent can call `mdrun --tree` to get a compact command list, then `mdrun <cmd> --help` to fetch only the details it needs — keeping context windows small and focused.

## Installation

```sh
# Install globally
npm install -g @leyohli/mdrun

# Or use without installing
npx @leyohli/mdrun --help
```

## Try It Now

This README is itself a runnable mdrun file. After installing, try:

```sh
mdrun -f README.md hi
mdrun -f README.md hi world
mdrun -f README.md hi world --strong
```

```bash cmd=hi args=[name] [-s/--strong] desc=Say hi
echo "hello, ${name:-world}${strong:+!}"
```

## Quick Start

[example/mdrun.md](./example/mdrun.md) covers all features — basic commands, arguments, subcommands, YAML metadata, and multi-platform support. Run it directly:

```sh
# List all available commands
mdrun --tree -f example/mdrun.md

# Run a command
mdrun greet world -f example/mdrun.md
mdrun db migrate -f example/mdrun.md

# Subcommand help
mdrun db --help -f example/mdrun.md
```

## Subcommands

Use dot notation in `cmd=` to group related commands — no explicit group declaration needed:

````markdown
```bash cmd=db.migrate desc=Run database migrations
diesel migration run
```

```bash cmd=db.seed desc=Seed with test data
cargo run --bin seed
```
````

```sh
mdrun db --help     # shows migrate, seed
mdrun db migrate
```

## Arguments and Options

Declare parameters inline with `args=`. Positional arguments use `(required)` or `[optional]`;
options use `[--flag]` or `[-p/--port=<port>=3000]`:

````markdown
```bash cmd=deploy args=(-e/--env=<env>) [--dry-run] desc=Deploy the app
echo "Deploying to $env"
[ -n "$dry_run" ] && echo "(dry run)"
```
````

Arguments are injected as environment variables — `--dry-run` becomes `$dry_run` and `$DRY_RUN`.
Boolean flags are unset when not passed, so `[ -n "$flag" ]` and `${flag:+...}` work as expected.

## YAML Metadata

For commands with many parameters or a confirmation prompt, use a `yaml id=` block and
reference it with `spec=`:

````markdown
```yaml id=deploy-meta
desc: Deploy the application
confirm: Deploy to $env? This cannot be undone.
args:
  env:
    required: true
    desc: Target environment (staging/production)
  dry-run:
    type: boolean
    desc: Simulate without making changes
```

```bash cmd=deploy spec=deploy-meta
echo "Deploying to $env..."
[ -n "$dry_run" ] && echo "(dry run)"
```
````

When `spec=` is present, inline `args=` is ignored.

## Multi-Platform

Repeat the same `cmd=` with different `os=` tags. mdrun picks the right block at runtime:

````markdown
```bash cmd=build os=linux,mac
cargo build --release
```

```powershell cmd=build os=windows
cargo build --release
```
````

## Full Spec

For the complete syntax reference — all tags, parameter types, YAML fields, variable injection
rules — see [docs/spec.md](./docs/spec.md).

## Programmatic API

mdrun can also be used as a library:

```typescript
import { readFileSync } from "fs";
import { parseMarkdown, buildCommandTree, executeCommand } from "mdrun";

const source = readFileSync("mdrun.md", "utf8");
const blocks = parseMarkdown(source);
const { commands } = buildCommandTree(blocks);

const cmd = commands.find(c => c.name === "build");
if (cmd) {
  const result = await executeCommand(cmd, { args: {} });
  process.exit(result.exitCode);
}
```
