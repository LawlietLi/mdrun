# CLI Reference

## Usage

```text
mdrun [options] [command] [args...]
```

## Global Options

| Option | Description |
| --- | --- |
| `-f, --file <file>` | Markdown file to use (default: auto-discover) |
| `--tree` | List all available commands in tree format |
| `--json` | Output command structure as JSON |
| `-V, --version` | Show version |
| `-h, --help` | Show help |

## Running a Command

```sh
mdrun [global options] <command> [subcommand] [command options]
```

Global options (like `-f`) must come before the command name:

```sh
mdrun -f mdrun.md db migrate
mdrun -f mdrun.md deploy --env staging --dry-run
```

## Listing Commands

```sh
# Tree view (human-readable)
mdrun --tree
mdrun -f BUILD.md --tree

# JSON output (for tool integration)
mdrun --json
```

Example tree output:

```text
├── build        Build the project
├── test         Run tests
└── db
    ├── migrate  Run database migrations
    └── seed     Seed the database
```

## Command Help

Each command exposes its own `--help`:

```sh
mdrun build --help
mdrun db --help
mdrun db migrate --help
```

## Subcommands

Commands with dot notation (`cmd=db.migrate`) are grouped automatically.
Invoke a group without a subcommand to see its children:

```sh
mdrun db
# error: 'mdrun db' requires a subcommand
# Commands:
#   migrate  Run database migrations
#   seed     Seed the database
```

## Exit Codes

| Code | Meaning |
| --- | --- |
| `0` | Success |
| `0` | Command skipped (platform mismatch or confirm aborted) |
| `1` | Command failed or command not found |
| N | Exit code propagated from the script |
