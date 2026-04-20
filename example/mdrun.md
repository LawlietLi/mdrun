# mdrun Example

This file is both documentation and a runnable task file.
Try: `mdrun --tree -f example/mdrun.md`

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

Optional flag `[--loud]` and option with default `[-p/--port=<port>=3000]`:

```bash cmd=serve args=[--host=<host>=localhost] [-p/--port=<port>=3000] [--loud] desc=Start a local server (simulated)
echo "Starting server on $host:$port"
if [ "$loud" = "true" ]; then
  echo "LOUD MODE ON"
fi
```

Run with:

```sh
mdrun greet world -f example/mdrun.md
mdrun serve -f example/mdrun.md
mdrun serve --port 8080 --loud -f example/mdrun.md
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
mdrun db --help -f example/mdrun.md
mdrun db migrate -f example/mdrun.md
mdrun db reset -f example/mdrun.md
```

## YAML Metadata Blocks

For complex commands, declare parameters in a `yaml id=` block and reference with `ref=`.
This enables rich parameter descriptions, confirmation prompts, and required validation.

```yaml id=deploy-meta
desc: Deploy the application to an environment
confirm: Deploy to "$env"? This cannot be undone.
args:
  env:
    required: true
    desc: Target environment (staging / production)
  dry-run:
    type: boolean
    desc: Print what would happen without making changes
  tag:
    default: latest
    desc: Docker image tag to deploy
```

```bash cmd=deploy ref=deploy-meta
echo "Deploying tag=$tag to env=$env"
if [ "$dry_run" = "true" ]; then
  echo "(dry run — no changes made)"
fi
```

Run with:

```sh
mdrun deploy --env staging --dry-run -f example/mdrun.md
mdrun deploy --env production --tag v1.2.3 -f example/mdrun.md
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
mdrun platform-info -f example/mdrun.md
```
