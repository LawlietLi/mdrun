// ─── Raw parsing output ───────────────────────────────────────────────────────

/** Parsed key=value pairs from a fenced code block info string. */
export interface InfoStringTags {
  lang?: string;
  cmd?: string;
  args?: string;
  desc?: string;
  spec?: string;
  confirm?: string;
  os?: string;
  id?: string;
}

/** A single code block extracted from the Markdown AST before resolution. */
export interface RawBlock {
  tags: InfoStringTags;
  body: string;
  line: number;
}

// ─── Argument specification ───────────────────────────────────────────────────

export type ArgType = "string" | "boolean" | "number";

export interface ArgSpec {
  name: string;
  short?: string;
  required: boolean;
  type: ArgType;
  default?: string;
  desc?: string;
  /** True for positional args declared via (name) or [name] in args= syntax. */
  positional?: boolean;
}

// ─── YAML metadata block ──────────────────────────────────────────────────────

export interface MetaBlock {
  id: string;
  desc?: string;
  /** Confirmation prompt template; supports $variable interpolation. */
  confirm?: string;
  args?: Record<string, MetaArgSpec>;
}

export interface MetaArgSpec {
  required?: boolean;
  short?: string;
  type?: ArgType;
  default?: string;
  desc?: string;
  positional?: boolean;
}

// ─── Resolved command tree ────────────────────────────────────────────────────

export interface CommandNode {
  /** Full dot-notation path, e.g. "db.migrate" */
  name: string;
  /** Last path segment, e.g. "migrate" */
  label: string;
  desc?: string;
  args: ArgSpec[];
  os?: string[];
  /** Shell script body; undefined for namespace-only nodes. */
  script?: string;
  confirm?: string;
  children: CommandNode[];
  line?: number;
  /**
   * Additional platform-specific implementations of the same command.
   * Present when multiple blocks share the same cmd= but have different os= tags.
   * The runner picks the first variant whose os= matches the current platform.
   */
  variants?: Array<{ os: string[]; script: string }>;
}

// ─── Execution ────────────────────────────────────────────────────────────────

export interface RunOptions {
  args: Record<string, string | boolean>;
}

export interface ExecutionResult {
  exitCode: number;
  /** true when the os= filter excluded this command on the current platform */
  skipped: boolean;
  /** true when the user declined the confirm prompt */
  aborted: boolean;
}

// ─── File lookup ──────────────────────────────────────────────────────────────

export interface LookupResult {
  path: string;
  source: string;
}
