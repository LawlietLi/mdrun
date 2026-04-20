import * as readline from "readline";

/** Interpolates $variable references in a template string. */
export function interpolate(template: string, env: Record<string, string>): string {
  return template.replace(/\$(\w+)/g, (_, name: string) => env[name] ?? `$${name}`);
}

/** Prompts the user with an interpolated message. Returns true if they confirm. */
export async function promptConfirm(
  template: string,
  env: Record<string, string>,
): Promise<boolean> {
  const message = interpolate(template, env);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${message} [y/N] `, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === "y");
    });
  });
}
