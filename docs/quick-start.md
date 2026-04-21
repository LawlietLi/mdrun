# Quick Start

## Try It Now

This README is itself a runnable mdrun file. After installing, try:

```sh
mdrun -f README.md hi
mdrun -f README.md hi world
mdrun -f README.md hi world --strong
```

The `hi` command is declared directly in `README.md`:

````markdown
```bash cmd=hi args=[name] [-s/--strong] desc=Say hi
echo "hello, ${name:-world}${strong:+!}"
```
````

## Your First mdrun File

Create a `mdrun.md` in your project:

````markdown
# My Project

Build and development commands.

```bash cmd=build desc=Build the project
npm run build
```

```bash cmd=test desc=Run tests
npm test
```

```bash cmd=dev args=[--port=<port>=3000] desc=Start dev server
npm run dev -- --port $port
```
````

Run commands:

```sh
# List all commands
mdrun --tree

# Run a command
mdrun build
mdrun dev
mdrun dev --port 8080

# Show help for a command
mdrun dev --help
```

## Explore the Full Example

[example/mdrun.md](../example/mdrun.md) covers all features — basic commands, arguments,
subcommands, YAML metadata, multi-platform support, and confirmation prompts:

```sh
# List all available commands
mdrun -f example/mdrun.md --tree

# Run commands
mdrun -f example/mdrun.md greet world
mdrun -f example/mdrun.md db migrate

# Subcommand help
mdrun -f example/mdrun.md db --help
```
