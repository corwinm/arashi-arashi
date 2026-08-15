import { lstat, readFile, readdir, realpath } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const identityPattern =
  /^scripts\/check-[a-z0-9](?:[a-z0-9-]*[a-z0-9])?-contracts\.ts$/;
const filenamePattern = /^check-[a-z0-9](?:[a-z0-9-]*[a-z0-9])?-contracts\.ts$/;

const bytewise = (left: string, right: string) =>
  Buffer.from(left).compare(Buffer.from(right));

export interface ContractCheckRegistrationResult {
  ok: boolean;
  entries: string[];
  defects: string[];
}

export async function validateContractCheckRegistration(
  repositoryRoot: string,
): Promise<ContractCheckRegistrationResult> {
  const root = resolve(repositoryRoot);
  const scriptsRoot = join(root, "scripts");
  const registryPath = join(scriptsRoot, "contract-checks.json");
  const defects: string[] = [];
  let entries: string[] = [];

  try {
    const parsed: unknown = JSON.parse(await readFile(registryPath, "utf8"));
    if (
      !Array.isArray(parsed) ||
      !parsed.every((entry) => typeof entry === "string")
    ) {
      defects.push("registry must be a JSON array of checker identity strings");
    } else {
      entries = parsed;
    }
  } catch (error) {
    defects.push(
      `registry could not be read: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const seen = new Set<string>();
  for (const identity of entries) {
    if (seen.has(identity))
      defects.push(`duplicate registry identity: ${identity}`);
    seen.add(identity);
    if (!identityPattern.test(identity)) {
      defects.push(`malformed registry identity: ${identity}`);
      continue;
    }

    const candidate = resolve(root, identity);
    const withinRoot = relative(root, candidate);
    if (
      withinRoot === "" ||
      withinRoot === ".." ||
      withinRoot.startsWith(`..${sep}`) ||
      resolve(candidate) !== candidate
    ) {
      defects.push(`escaping registry identity: ${identity}`);
      continue;
    }
    try {
      const stat = await lstat(candidate);
      if (stat.isSymbolicLink()) {
        defects.push(`symlinked registry identity: ${identity}`);
      } else if (!stat.isFile()) {
        defects.push(`registry identity is not a regular file: ${identity}`);
      } else {
        const resolved = await realpath(candidate);
        if (resolved !== candidate)
          defects.push(
            `registry identity resolves outside its literal path: ${identity}`,
          );
      }
    } catch {
      defects.push(`stale registry identity: ${identity}`);
    }
  }

  const sorted = [...entries].sort(bytewise);
  if (entries.some((entry, index) => entry !== sorted[index]))
    defects.push(
      "registry identities are not in ascending bytewise UTF-8 order",
    );

  try {
    const discovered = (await readdir(scriptsRoot))
      .filter((name) => filenamePattern.test(name))
      .map((name) => `scripts/${name}`)
      .sort(bytewise);
    for (const identity of discovered)
      if (!seen.has(identity))
        defects.push(`omitted checker registration: ${identity}`);
    for (const identity of entries)
      if (identityPattern.test(identity) && !discovered.includes(identity))
        defects.push(`stale checker registration: ${identity}`);
  } catch (error) {
    defects.push(
      `checker inventory could not be read: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  return { ok: defects.length === 0, entries, defects };
}

export function printContractCheckRegistration(
  result: ContractCheckRegistrationResult,
): void {
  if (result.ok) {
    console.log(
      `Contract checker registration passed: ${result.entries.length} checkers.`,
    );
    return;
  }
  console.error("Contract checker registration failed:");
  for (const defect of result.defects) console.error(`- ${defect}`);
}

const isDirect = process.argv[1] === fileURLToPath(import.meta.url);
if (isDirect) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const result = await validateContractCheckRegistration(root);
  printContractCheckRegistration(result);
  process.exitCode = result.ok ? 0 : 1;
}
