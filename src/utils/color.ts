import { styleText } from "util";

function isTTY(): boolean {
  return process.stdout.isTTY === true;
}

function c(style: Parameters<typeof styleText>[0], text: string): string {
  return isTTY() ? styleText(style, text) : text;
}

export const color = {
  bold: (s: string) => c("bold", s),
  dim: (s: string) => c("dim", s),
  cyan: (s: string) => c("cyan", s),
  green: (s: string) => c("green", s),
  yellow: (s: string) => c("yellow", s),
};
