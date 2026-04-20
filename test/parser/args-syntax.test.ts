import { describe, test, expect } from "bun:test";
import { parseArgsSyntax } from "../../src/parser/args-syntax.js";

describe("parseArgsSyntax", () => {
  test("required positional", () => {
    const specs = parseArgsSyntax("(name)");
    expect(specs).toHaveLength(1);
    expect(specs[0]).toMatchObject({ name: "name", required: true, type: "string" });
  });

  test("optional positional", () => {
    const specs = parseArgsSyntax("[name]");
    expect(specs[0]).toMatchObject({ name: "name", required: false, type: "string" });
  });

  test("optional boolean flag", () => {
    const specs = parseArgsSyntax("[--dry-run]");
    expect(specs[0]).toMatchObject({ name: "dry-run", required: false, type: "boolean" });
  });

  test("optional flag without -- prefix", () => {
    const specs = parseArgsSyntax("[--watch]");
    expect(specs[0]).toMatchObject({ name: "watch", type: "boolean" });
  });

  test("optional string option", () => {
    const specs = parseArgsSyntax("[--port=<port>]");
    expect(specs[0]).toMatchObject({ name: "port", required: false, type: "string" });
  });

  test("optional option with short form", () => {
    const specs = parseArgsSyntax("[-p/--port=<port>]");
    expect(specs[0]).toMatchObject({ name: "port", short: "p", required: false, type: "string" });
  });

  test("optional option with default value", () => {
    const specs = parseArgsSyntax("[-p/--port=<port>=3000]");
    expect(specs[0]).toMatchObject({ name: "port", short: "p", default: "3000" });
  });

  test("option with type annotation", () => {
    const specs = parseArgsSyntax("[--port=<port:number>]");
    expect(specs[0]).toMatchObject({ name: "port", type: "number" });
  });

  test("option with default no short", () => {
    const specs = parseArgsSyntax("[--tag=<tag>=latest]");
    expect(specs[0]).toMatchObject({ name: "tag", default: "latest", type: "string" });
  });

  test("required option with short form", () => {
    const specs = parseArgsSyntax("(-d/--domain=<domain>)");
    expect(specs[0]).toMatchObject({ name: "domain", short: "d", required: true, type: "string" });
  });

  test("multiple tokens", () => {
    const specs = parseArgsSyntax("(name) [--dry-run] [-p/--port=<port>=3000]");
    expect(specs).toHaveLength(3);
    expect(specs[0]!.name).toBe("name");
    expect(specs[1]!.name).toBe("dry-run");
    expect(specs[2]!.name).toBe("port");
  });

  test("empty string returns empty array", () => {
    expect(parseArgsSyntax("")).toHaveLength(0);
  });
});
