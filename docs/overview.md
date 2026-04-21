# Overview

mdrun is a Markdown-based task runner — **documentation first, commands second**.

Commands are declared via metadata in fenced code block info strings. Your documents render normally in any Markdown viewer; mdrun simply executes the scripts you've already written.

Inspired by [Makefile](https://www.gnu.org/software/make/), [just](https://github.com/casey/just), and [mask](https://github.com/jacobdeichert/mask) — with a focus on keeping documentation and executable commands in the same place, readable by both humans and AI agents.

## Why mdrun?

Most task runners require a dedicated config file (`Makefile`, `Taskfile.yml`, `package.json` scripts). mdrun lets you embed executable commands directly in any Markdown document — your `README.md`, `BUILD.md`, or a `SKILL.md` used by an AI agent — without affecting how the document reads.

## Key Features

- **Documentation-native** — commands live inside normal Markdown files, visible in any renderer
- **Decoupled structure** — command hierarchy is defined by `cmd=` tags, not document headings
- **Inline or YAML parameters** — simple commands use inline `args=` syntax; complex ones use a YAML `spec=` block
- **Multi-platform** — provide platform-specific scripts with `os=linux,mac` / `os=windows`
- **Progressive disclosure for AI agents** — `mdrun --tree` gives a compact command list; `mdrun <cmd> --help` fetches only the details needed, keeping context windows small

## How It Works

Commands are declared by adding tags to the info string of a fenced code block:

````markdown
```bash cmd=build desc=Build the project
cargo build --release
```
````

The document reads as normal Markdown. When you run `mdrun build`, mdrun parses the file,
finds the matching code block, and executes the script — injecting any declared arguments
as environment variables.

## Comparison with Similar Tools

| Feature | Makefile | just | mask | mdrun |
| --- | --- | --- | --- | --- |
| Config format | Makefile | Justfile | Markdown (headings) | Markdown (code blocks) |
| Command structure | Flat targets | Flat recipes | Heading hierarchy | `cmd=` tag, dot notation |
| Documentation | Separate | Comments only | Doubles as docs | Full Markdown |
| Multi-platform | Manual | Built-in | Multiple blocks | `os=` tag |
| AI agent friendly | No | No | Partial | Yes (`--tree`, `--json`) |
