// Public API — for use as a library
export { parseMarkdown } from "./parser/markdown.js";
export { parseInfoString } from "./parser/info-string.js";
export { parseArgsSyntax } from "./parser/args-syntax.js";
export { parseYamlBlock } from "./parser/yaml-block.js";

export { buildCommandTree } from "./resolver/tree.js";
export type { BuildResult } from "./resolver/tree.js";
export { applyMetaBlock } from "./resolver/ref.js";

export { executeCommand } from "./executor/runner.js";
export { currentPlatform, platformMatches, resolveShell } from "./executor/platform.js";
export { buildEnv } from "./executor/variables.js";

export { renderTree } from "./output/tree.js";
export { renderJson } from "./output/json.js";

export { findDefaultFile, readFile, DEFAULT_FILES } from "./utils/file-lookup.js";
export {
  MdrunError,
  CommandNotFoundError,
  FileNotFoundError,
  MissingRequiredArgError,
  PlatformMismatchError,
} from "./utils/errors.js";

export type {
  InfoStringTags,
  RawBlock,
  ArgType,
  ArgSpec,
  MetaBlock,
  MetaArgSpec,
  CommandNode,
  RunOptions,
  ExecutionResult,
  LookupResult,
} from "./types.js";
