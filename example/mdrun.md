# mdrun Example

This file is both documentation and a runnable task file.
Try: `mdrun -f example/mdrun.md --tree`

## Basic Commands

The simplest form — just a `cmd=` tag and a script:

```bash cmd=hello desc=Print a greeting
echo "Hello from mdrun!"
```

```bash cmd=date desc=Show current date and time
date
```

## Commands with Arguments

Use `args=` to declare parameters inline.

Required positional argument `(name)`:

```bash cmd=greet args=(name) desc=Greet someone by name
echo "Hello, $name!"
```

Optional flag `[--loud]` and option with default `[-p/--port=<port>=3000]`.

Boolean flags are injected as `flag=true` when passed, and **not set** when absent —
use `[ -n "$flag" ]` or `${flag:+...}` to test them in shell scripts:

```bash cmd=serve args=[--host=<host>=localhost] [-p/--port=<port>=3000] [--loud] desc=Start a local server (simulated)
echo "Starting server on $host:$port"
[ -n "$loud" ] && echo "LOUD MODE ON"
```

Run with:

```sh
mdrun -f example/mdrun.md greet world
mdrun -f example/mdrun.md serve
mdrun -f example/mdrun.md serve --port 8080 --loud
```

## Subcommands

Use dot notation in `cmd=` to group related commands. No explicit group declaration needed.

```bash cmd=db.migrate desc=Run database migrations
echo "Running migrations..."
```

```bash cmd=db.seed desc=Seed the database with sample data
echo "Seeding database..."
```

```bash cmd=db.reset desc=Drop, recreate, and seed the database
echo "Resetting database..."
```

Run with:

```sh
mdrun -f example/mdrun.md db --help
mdrun -f example/mdrun.md db migrate
mdrun -f example/mdrun.md db reset
```

## YAML Metadata Blocks

For complex commands, declare parameters in a `yaml id=` block and reference with `spec=`.
This enables rich parameter descriptions, confirmation prompts, and required validation.

YAML args are registered as `--options` by default. Use `positional: true` to declare
a positional argument (equivalent to `(name)` / `[name]` in inline `args=` syntax).

```yaml id=deploy-meta
desc: Deploy the application to an environment
confirm: Deploy to "$env"? This cannot be undone.
args:
  env:
    required: true
    desc: Target environment (staging / production)
  dry-run:
    type: boolean
    desc: Simulate deployment without making changes
  tag:
    default: latest
    desc: Docker image tag to deploy
```

```bash cmd=deploy spec=deploy-meta
echo "Deploying tag=$tag to env=$env"
[ -n "$dry_run" ] && echo "(dry run — no changes made)"
```

Run with:

```sh
mdrun -f example/mdrun.md deploy --env staging --dry-run
mdrun -f example/mdrun.md deploy --env production --tag v1.2.3
```

## Multi-Platform Commands

Same `cmd=` name, different `os=` tag. mdrun picks the right one at runtime.

```bash cmd=platform-info os=linux,mac desc=Show platform info (Unix)
uname -a
```

```powershell cmd=platform-info os=windows desc=Show platform info (Windows)
Get-ComputerInfo | Select-Object OsName, OsVersion
```

Run with:

```sh
mdrun -f example/mdrun.md platform-info
```
