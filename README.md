# mdrun

A Markdown-based task runner — **documentation first, commands second**.

Commands are declared via metadata in fenced code block info strings. Your documents render normally in any Markdown viewer; mdrun simply executes the scripts you've already written.

> [中文文档](./README.zh.md)

## Why mdrun?

Most task runners require you to write a dedicated config file (`Makefile`, `Taskfile.yml`, `package.json` scripts). mdrun lets you embed executable commands directly in any Markdown document — your `README.md`, `BUILD.md`, or a `SKILL.md` used by an AI agent — without affecting how the document reads.

## Installation

```sh
# Install globally
bun add -g mdrun

# Or use without installing
bunx mdrun --help
```

## Quick Start

Create a `mdrun.md` file (or any of `BUILD.md`, `SKILL.md`, `README.md`):

````markdown
# My Project

Some documentation here.

```bash cmd=build desc=Build the project
cargo build --release
```

```bash cmd=test desc=Run tests
cargo test
```

```bash cmd=db.migrate desc=Migrate the database
diesel migration run
```

```bash cmd=db.seed desc=Seed with test data
cargo run --bin seed
```
````

Then run commands:

```sh
mdrun build
mdrun test
mdrun db migrate
mdrun db seed

# List all commands
mdrun --tree

# Output as JSON (for tool integration)
mdrun --json
```

## Info String Tags

Commands are declared via tags in the fenced code block info string.

| Tag | Required | Description |
| --- | --- | --- |
| `cmd=` | Yes | Command name; use dot notation for subcommands (`db.migrate`) |
| `args=` | No | Parameter declaration (see [Parameter Syntax](#parameter-syntax)) |
| `desc=` | No | Command description shown in help output |
| `ref=` | No | Reference a YAML metadata block by `id=` |
| `os=` | No | Platform filter: `linux`, `mac`, `windows` (comma-separated) |
| `id=` | — | Identity for YAML metadata blocks used with `ref=` |

## Parameter Syntax

The `args=` tag accepts a compact single-line syntax:

| Token | Meaning |
| --- | --- |
| `(name)` | Required positional parameter |
| `[name]` | Optional positional parameter |
| `[--flag]` | Optional boolean flag |
| `[-p/--port=<port>]` | Optional string option (short + long form) |
| `(-d/--domain=<domain>)` | Required string option |
| `[--port=<port:number>]` | Option with type annotation (`string`/`number`/`boolean`) |
| `[--tag=<tag>=latest]` | Option with default value |

**Variable injection:** option names are injected as environment variables with hyphens replaced by underscores. `--dry-run` becomes `$dry_run` (and `$DRY_RUN`).

```bash cmd=serve args=[-p/--port=<port>=3000] [--watch] desc=Start dev server
echo "Starting on port $port"
if [ "$watch" = "true" ]; then echo "Watch mode on"; fi
```

## YAML Metadata Blocks

For complex commands, declare parameters in a YAML code block with `id=` and reference it from the script block with `ref=`:

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

```bash cmd=deploy ref=deploy-meta
echo "Deploying to $env..."
if [ "$dry_run" = "true" ]; then
  echo "(dry run)"
fi
```
````

YAML metadata block fields:

| Field | Description |
| --- | --- |
| `desc` | Command description |
| `confirm` | Confirmation prompt before execution (supports `$variable` interpolation) |
| `args.<name>.required` | Whether the argument is required (default: `false`) |
| `args.<name>.short` | Short option name (e.g. `t` for `-t`) |
| `args.<name>.type` | Argument type: `string`, `number`, `boolean` |
| `args.<name>.default` | Default value |
| `args.<name>.desc` | Argument description for help text |

## Multi-Platform Support

Use `os=` to provide platform-specific implementations of the same command. mdrun selects the matching block at runtime:

````markdown
```bash cmd=build os=linux,mac
cargo build --release
```

```powershell cmd=build os=windows
cargo build --release
```
````

Supported platform values: `linux`, `mac`, `windows`.

## CLI Reference

```text
mdrun [OPTIONS] [COMMAND] [ARGS...]

Options:
  -f, --file <file>   Markdown file to use (default: auto-discover)
  --tree              List all available commands in tree format
  --json              Output command structure as JSON
  -h, --help          Show help
  -V, --version       Show version
```

**Default file discovery** (when `-f` is not specified, mdrun searches the current directory in this order):

1. `mdrun.md` — explicitly prepared for mdrun
2. `BUILD.md` — build and development commands
3. `SKILL.md` — AI agent skill entry point
4. `README.md` — universal project entry

## Programmatic API

mdrun can also be used as a library:

```typescript
import { parseMarkdown, buildCommandTree, executeCommand } from "mdrun";

const source = await Bun.file("mdrun.md").text();
const blocks = parseMarkdown(source);
const { commands } = buildCommandTree(blocks);

// Find and execute a command
const cmd = commands.find(c => c.name === "build");
if (cmd) {
  const result = await executeCommand(cmd, { args: {} });
  process.exit(result.exitCode);
}
```
