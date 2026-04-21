# mdrun File Spec

An mdrun file is a standard Markdown file. Commands are declared by adding tags to
fenced code block info strings. The document structure is entirely free — headings,
paragraphs, and tables are for human readers and have no effect on command parsing.

## Info String Tags

Tags are key-value pairs in the code block's info string, after the language identifier:

````markdown
```<lang> <tag>=<value> <tag>=<value> ...
script body
```
````

| Tag | Required | Description |
| --- | --- | --- |
| `cmd=` | Yes | Command name. Use dot notation for subcommands (`db.migrate`) |
| `args=` | No | Inline parameter declaration (ignored when `spec=` is present) |
| `desc=` | No | Command description shown in `--help` and `--tree` output |
| `confirm=` | No | Prompt the user before executing. Supports `$variable` interpolation |
| `spec=` | No | Reference a YAML metadata block by its `id=`. Takes priority over `args=` |
| `os=` | No | Platform filter. Comma-separated: `linux`, `mac`, `windows` |
| `id=` | — | Identity tag for YAML metadata blocks, referenced by `spec=` |

## Command Names

The `cmd=` tag defines the command name. Use dot notation to create subcommand groups:

```text
cmd=build          → top-level command
cmd=db.migrate     → "db" group, "migrate" subcommand
cmd=docker.image.build  → nested groups
```

Groups are created automatically when two or more commands share a prefix.
Groups themselves are not executable — they only show help for their children.

## Inline Parameter Syntax (`args=`)

The `args=` tag accepts a compact single-line syntax. Each token is a whitespace-separated
bracket group:

| Token | Meaning |
| --- | --- |
| `(name)` | Required positional argument |
| `[name]` | Optional positional argument |
| `[--flag]` | Optional boolean flag |
| `[-p/--port=<port>]` | Optional string option (short + long form) |
| `(-d/--domain=<domain>)` | Required string option |
| `[--port=<port:number>]` | Option with type annotation (`string` / `number` / `boolean`) |
| `[--tag=<tag>=latest]` | Option with default value |

Required positional arguments must precede optional ones.

### Variable Injection

All declared arguments are injected into the script as environment variables:

- Hyphens are replaced with underscores: `--dry-run` → `$dry_run`
- Both lowercase and uppercase forms are injected: `$dry_run` and `$DRY_RUN`
- Boolean flags are injected as `true` when passed, and **not set** when absent

Use standard shell parameter expansion to test flags:

```bash
[ -n "$dry_run" ] && echo "dry run mode"
echo "tag: ${tag:-latest}"
echo "hello${strong:+!}"
```

## YAML Metadata Blocks (`spec=`)

For complex commands, declare parameters in a YAML code block with `id=`,
then reference it from the script block with `spec=`:

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
  tag:
    default: latest
    desc: Docker image tag to deploy
```

```bash cmd=deploy spec=deploy-meta
echo "Deploying $tag to $env"
[ -n "$dry_run" ] && echo "(dry run)"
```
````

When `spec=` is present, inline `args=` is ignored entirely.

### YAML Block Fields

| Field | Type | Description |
| --- | --- | --- |
| `desc` | string | Command description |
| `confirm` | string | Confirmation prompt. Supports `$variable` interpolation |
| `args.<name>.positional` | boolean | Declare as positional argument instead of `--option` (default: `false`) |
| `args.<name>.required` | boolean | Whether the argument is required (default: `false`) |
| `args.<name>.short` | string | Single-character short alias (e.g. `p` for `-p`) |
| `args.<name>.type` | string | Argument type: `string`, `number`, `boolean` |
| `args.<name>.default` | string | Default value when argument is not provided |
| `args.<name>.desc` | string | Argument description shown in `--help` |

## Confirmation Prompts

Both inline `confirm=` and YAML `confirm` fields support `$variable` interpolation
using the declared argument values:

````markdown
```bash cmd=drop confirm=Drop database "$db"? This is irreversible.  args=(-d/--db=<db>)
dropdb $db
```
````

The user is prompted before the script runs. Answering `n` aborts with exit code `0`.

## Multi-Platform Commands

Provide platform-specific implementations by repeating the same `cmd=` with different `os=` tags.
mdrun selects the matching block at runtime and skips the rest:

````markdown
```bash cmd=build os=linux,mac
cargo build --release
```

```powershell cmd=build os=windows
cargo build --release
```
````

Supported platform values: `linux`, `mac`, `windows`.

If no block matches the current platform, the command is skipped silently with exit code `0`.

## YAML and `args=` Together

YAML metadata blocks can be combined with inline `args=` positional parameters
by using `positional: true` in the YAML:

````markdown
```yaml id=greet-meta
args:
  name:
    positional: true
    desc: Name to greet
  loud:
    short: l
    type: boolean
    desc: Shout the greeting
```

```bash cmd=greet spec=greet-meta
echo "${loud:+HEY }hello, $name"
```
````

## File Discovery Order

When `-f` is not specified, mdrun searches the current directory:

1. `mdrun.md`
2. `BUILD.md`
3. `SKILL.md`
4. `README.md`
