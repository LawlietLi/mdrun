import type { ArgSpec, ArgType } from "../types.js";

/**
 * Parses the inline args= syntax into ArgSpec[].
 *
 * Supported tokens:
 *   (name)                    required positional, type string
 *   [name]                    optional positional, type string
 *   [--flag]                  optional boolean flag
 *   [-p/--port=<port>]        optional string, short="p"
 *   (-d/--domain=<domain>)    required string, short="d"
 *   [--port=<port:number>]    optional number
 *   [--tag=<tag>=latest]      optional string with default "latest"
 *   [-p/--port=<port>=3000]   optional string with default, short="p"
 */
export function parseArgsSyntax(raw: string): ArgSpec[] {
  const specs: ArgSpec[] = [];
  const tokens = tokenize(raw);

  for (const token of tokens) {
    const spec = parseToken(token);
    if (spec) specs.push(spec);
  }

  return specs;
}

/** Split the raw string into bracket/paren groups. */
function tokenize(raw: string): string[] {
  const tokens: string[] = [];
  let depth = 0;
  let start = -1;

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if ((ch === "[" || ch === "(") && depth === 0) {
      depth = 1;
      start = i;
    } else if (ch === "[" || ch === "(") {
      depth++;
    } else if ((ch === "]" || ch === ")") && depth === 1) {
      depth = 0;
      tokens.push(raw.slice(start, i + 1));
      start = -1;
    } else if (ch === "]" || ch === ")") {
      depth--;
    }
  }

  return tokens;
}

function parseToken(token: string): ArgSpec | null {
  if (!token) return null;

  const required = token.startsWith("(");
  const inner = token.slice(1, -1).trim();

  // Positional argument: no leading --
  if (!inner.startsWith("-")) {
    return {
      name: inner,
      required,
      type: "string",
    };
  }

  // Option: may have short form -x/--long=<value:type>=default
  // Separate short from long: "-p/--port=<port>=3000" or "--port=<port>=3000"
  let rest = inner;
  let short: string | undefined;

  const shortMatch = rest.match(/^-([a-zA-Z])\/(.+)$/);
  if (shortMatch) {
    short = shortMatch[1];
    rest = shortMatch[2] ?? rest;
  }

  // rest is now "--port=<port:number>=3000" or "--flag" or "--port=<port>=3000"
  const eqIdx = rest.indexOf("=");

  if (eqIdx === -1) {
    // Boolean flag: --flag
    const name = rest.replace(/^--/, "");
    const spec: ArgSpec = { name, required, type: "boolean" };
    if (short !== undefined) spec.short = short;
    return spec;
  }

  const longName = rest.slice(0, eqIdx).replace(/^--/, "");
  const afterEq = rest.slice(eqIdx + 1); // "<port:number>=3000" or "<port>=3000" or "<tag>=latest"

  // afterEq must start with <...>
  const angleMatch = afterEq.match(/^<([^>]+)>(.*)$/);
  if (!angleMatch) return null;

  const angleContent = angleMatch[1] ?? ""; // "port:number" or "port"
  const afterAngle = angleMatch[2] ?? ""; // "=3000" or ""

  // Parse type from angle content
  let type: ArgType = "string";
  const colonIdx = angleContent.indexOf(":");
  if (colonIdx !== -1) {
    const typePart = angleContent.slice(colonIdx + 1);
    if (typePart === "number" || typePart === "boolean" || typePart === "string") {
      type = typePart;
    }
  }

  // Parse default from afterAngle
  let defaultValue: string | undefined;
  if (afterAngle.startsWith("=")) {
    defaultValue = afterAngle.slice(1);
  }

  const spec: ArgSpec = { name: longName, required, type };
  if (short !== undefined) spec.short = short;
  if (defaultValue !== undefined) spec.default = defaultValue;

  return spec;
}
