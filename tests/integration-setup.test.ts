import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, test } from "vitest";
import { requireChildren } from "./integration-setup";

const children = [
  "arashi",
  "arashi-docs",
  "arashi-skills",
  "arashi-vscode",
  "arashi-presentation",
];
const roots: string[] = [];
afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "meta-integration-preflight-"));
  roots.push(root);
  for (const child of children)
    await mkdir(join(root, "repos", child), { recursive: true });
  return root;
}

test("child checkouts do not need retired caller workflows", async () => {
  await expect(requireChildren(await fixture())).resolves.toBeUndefined();
});
test.each(children)(
  "missing %s fails integration rather than skipping",
  async (child) => {
    const root = await fixture();
    await rm(join(root, "repos", child), { recursive: true });
    await expect(requireChildren(root)).rejects.toThrow(
      `Integration requires repos/${child}`,
    );
  },
);
test("a file cannot stand in for a child checkout", async () => {
  const root = await fixture();
  await rm(join(root, "repos/arashi"), { recursive: true });
  await writeFile(join(root, "repos/arashi"), "not a checkout");
  await expect(requireChildren(root)).rejects.toThrow(
    "Integration requires repos/arashi",
  );
});
