import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import type { Root, Code } from "mdast";
import type { RawBlock } from "../types.js";
import { parseInfoString } from "./info-string.js";

/** Parses a Markdown source string and extracts all fenced code blocks as RawBlock[]. */
export function parseMarkdown(source: string): RawBlock[] {
  const processor = unified().use(remarkParse);
  const tree = processor.parse(source) as Root;

  const blocks: RawBlock[] = [];

  visit(tree, "code", (node: Code) => {
    // remark puts the first word in node.lang and the rest in node.meta
    const infoString = [node.lang ?? "", node.meta ?? ""].filter(Boolean).join(" ");
    const tags = parseInfoString(infoString);

    blocks.push({
      tags,
      body: node.value,
      line: node.position?.start.line ?? 0,
    });
  });

  return blocks;
}
