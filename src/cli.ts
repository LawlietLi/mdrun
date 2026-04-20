#!/usr/bin/env bun
import { Command } from "commander";
import { parseMarkdown } from "./parser/markdown.js";
import { buildCommandTree } from "./resolver/tree.js";
import { executeCommand } from "./executor/runner.js";
import { currentPlatform } from "./executor/platform.js";
import { findDefaultFile, readFile } from "./utils/file-lookup.js";
import { renderTree } from "./output/tree.js";
import { renderJson } from "./output/json.js";
import { MdrunError } from "./utils/errors.js";
import { color } from "./utils/color.js";
import type { CommandNode } from "./types.js";

const VERSION = process.env["MDRUN_VERSION"] ?? "0.0.0";

const HELP_STYLE = {
  styleTitle: color.bold,
  styleCommandText: color.cyan,
  styleOptionText: color.green,
  styleArgumentText: color.yellow,
  styleDescriptionText: color.dim,
};

async function main() {
  // Step 1: pre-parse global flags only, without triggering help or errors
  const pre = new Command()
    .allowUnknownOption()
    .allowExcessArguments()
    .option("-f, --file <file>", "Markdown file to use")
    .option("--tree", "List all available commands in tree format")
    .option("--json", "Output command structure as JSON")
    .helpOption(false)
    .version(VERSION, "-V, --version")
    .parse(process.argv);

  const preOpts = pre.opts<{ file?: string; tree?: boolean; json?: boolean }>();

  // Step 2: load markdown
  let lookup;
  try {
    lookup = preOpts.file ? await readFile(preOpts.file) : await findDefaultFile();
  } catch (err) {
    if (err instanceof MdrunError) {
      console.error(`mdrun: ${err.message}`);
      process.exit(1);
    }
    throw err;
  }

  if (!lookup) {
    console.error(
      "mdrun: No markdown file found. Use -f to specify one, or create mdrun.md / BUILD.md / SKILL.md / README.md",
    );
    process.exit(1);
  }

  const blocks = parseMarkdown(lookup.source);
  const { commands } = buildCommandTree(blocks);

  // Step 3: handle --tree / --json before building the full program
  if (preOpts.json) {
    console.log(renderJson(commands));
    return;
  }

  if (preOpts.tree) {
    console.log(commands.length ? renderTree(commands) : `No commands found in ${lookup.path}`);
    return;
  }

  // Step 4: build the real program with dynamic subcommands
  const program = new Command("mdrun")
    .description("Markdown-based task runner")
    .version(VERSION, "-V, --version")
    .option("-f, --file <file>", "Markdown file to use")
    .option("--tree", "List all available commands in tree format")
    .option("--json", "Output command structure as JSON")
    .enablePositionalOptions()
    .configureHelp(HELP_STYLE)
    .action(() => {
      if (commands.length === 0) {
        console.error(`No commands found in ${lookup.path}`);
        process.exit(1);
      }
      console.error(`${color.bold(color.red("error:"))} 'mdrun' requires a subcommand, but one was not provided\n`);
      program.help();
    });

  // Step 5: register all commands from the markdown file
  registerCommands(program, commands);

  // Step 6: parse and dispatch
  await program.parseAsync(process.argv);
}

/** Recursively registers CommandNode[] as commander subcommands. */
function registerCommands(parent: Command, nodes: CommandNode[]): void {
  for (const node of nodes) {
    const cmd = new Command(node.label).configureHelp(HELP_STYLE).enablePositionalOptions();
    if (node.desc) cmd.description(node.desc);

    if (node.children.length > 0) {
      // Namespace node: register children, show help when invoked alone
      registerCommands(cmd, node.children);
      cmd.action(() => cmd.help());
    } else {
      // Leaf node: register args and execute
      registerArgs(cmd, node);
      cmd.action(async (...actionArgs) => {
        const parsedArgs = extractParsedArgs(cmd, node, actionArgs);

        // Validate required args
        for (const spec of node.args) {
          if (spec.required && parsedArgs[spec.name] === undefined && spec.default === undefined) {
            console.error(`mdrun: Missing required argument "${spec.name}" for "${node.name}"`);
            process.exit(1);
          }
        }

        const result = await executeCommand(node, { args: parsedArgs });

        if (result.skipped) {
          console.log(
            `mdrun: "${node.name}" is not available on platform "${currentPlatform()}" — skipped.`,
          );
        }
        if (result.aborted) process.exit(0);

        process.exit(result.exitCode);
      });
    }

    parent.addCommand(cmd);
  }
}

/** Registers ArgSpec[] onto a commander Command as arguments and options. */
function registerArgs(cmd: Command, node: CommandNode): void {
  // Warn if a required positional follows an optional one — commander can't resolve this.
  const positionals = node.args.filter((s) => s.positional);
  let seenOptional = false;
  for (const s of positionals) {
    if (!s.required) seenOptional = true;
    else if (seenOptional) {
      console.error(
        `mdrun: warning: command "${node.name}": required positional argument "${s.name}" follows an optional one — this ordering is ambiguous`,
      );
    }
  }

  for (const spec of node.args) {
    if (spec.name.startsWith("_")) continue;

    if (spec.positional && spec.type !== "boolean") {
      // Positional argument: use .argument()
      const placeholder = spec.required ? `<${spec.name}>` : `[${spec.name}]`;
      cmd.argument(placeholder, spec.desc ?? "", spec.default);
    } else if (spec.type === "boolean") {
      const flag = spec.short ? `-${spec.short}, --${spec.name}` : `--${spec.name}`;
      cmd.option(flag, spec.desc ?? "");
    } else {
      const placeholder = spec.required ? `<${spec.name}>` : `[${spec.name}]`;
      const flag = spec.short
        ? `-${spec.short}, --${spec.name} ${placeholder}`
        : `--${spec.name} ${placeholder}`;
      cmd.option(flag, spec.desc ?? "", spec.default);
    }
  }
}

/**
 * Extracts the parsed option values from commander's action callback args
 * and maps them back to the ArgSpec names.
 */
function extractParsedArgs(
  cmd: Command,
  node: CommandNode,
  _actionArgs: unknown[],
): Record<string, string | boolean> {
  const opts = cmd.opts<Record<string, string | boolean>>();
  const result: Record<string, string | boolean> = {};

  // Collect positional arg specs in declaration order
  const positionalSpecs = node.args.filter((s) => s.positional);

  // commander stores positional values in cmd.args[]
  for (let i = 0; i < positionalSpecs.length; i++) {
    const spec = positionalSpecs[i]!;
    const val = cmd.args[i];
    if (val !== undefined) result[spec.name] = val;
  }

  // Options: commander camelCases --dry-run → dryRun
  for (const spec of node.args) {
    if (spec.positional) continue; // already handled above
    const camelKey = spec.name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    const val = opts[camelKey] ?? opts[spec.name];
    // Skip false booleans — absence is represented by not injecting the env var at all.
    if (val !== undefined && val !== false) result[spec.name] = val;
  }

  return result;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
