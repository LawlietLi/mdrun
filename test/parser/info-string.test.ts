import { describe, test, expect } from "bun:test";
import { parseInfoString } from "../../src/parser/info-string.js";

describe("parseInfoString", () => {
  test("plain language token only", () => {
    const tags = parseInfoString("bash");
    expect(tags.lang).toBe("bash");
    expect(tags.cmd).toBeUndefined();
  });

  test("parses cmd=", () => {
    const tags = parseInfoString("bash cmd=build");
    expect(tags.lang).toBe("bash");
    expect(tags.cmd).toBe("build");
  });

  test("parses dot-notation cmd=", () => {
    const tags = parseInfoString("bash cmd=db.migrate");
    expect(tags.cmd).toBe("db.migrate");
  });

  test("parses desc= with spaces", () => {
    const tags = parseInfoString("bash cmd=build desc=Build the project");
    expect(tags.cmd).toBe("build");
    expect(tags.desc).toBe("Build the project");
  });

  test("parses all tags in one info string", () => {
    const tags = parseInfoString("bash cmd=deploy args=(env) [--dry-run] ref=deploy-meta os=linux,mac");
    expect(tags.lang).toBe("bash");
    expect(tags.cmd).toBe("deploy");
    expect(tags.args).toBe("(env) [--dry-run]");
    expect(tags.ref).toBe("deploy-meta");
    expect(tags.os).toBe("linux,mac");
  });

  test("parses id= for yaml blocks", () => {
    const tags = parseInfoString("yaml id=deploy-meta");
    expect(tags.lang).toBe("yaml");
    expect(tags.id).toBe("deploy-meta");
  });

  test("handles empty string", () => {
    const tags = parseInfoString("");
    expect(tags.lang).toBeUndefined();
    expect(tags.cmd).toBeUndefined();
  });

  test("desc= value stops at next key=", () => {
    const tags = parseInfoString("bash cmd=build desc=Build the project os=linux");
    expect(tags.desc).toBe("Build the project");
    expect(tags.os).toBe("linux");
  });
});
