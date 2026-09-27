import { stat } from "node:fs/promises";
import { join } from "node:path";

export async function requireChildren(root: string) {
  for (const child of [
    "arashi",
    "arashi-docs",
    "arashi-skills",
    "arashi-vscode",
    "arashi-presentation",
  ]) {
    const path = join(root, "repos", child);
    if (!(await stat(path).catch(() => undefined))?.isDirectory()) {
      throw new Error(
        `Integration requires repos/${child}; check out the recorded child revisions and run the documented generation stages before test:integration.`,
      );
    }
  }
}

export default async function setup() {
  await requireChildren(process.cwd());
}
