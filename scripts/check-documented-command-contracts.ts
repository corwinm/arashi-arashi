#!/usr/bin/env node
import {
  checkDocumentedCommandContracts,
  formatDocumentedCommandContracts,
} from "./documented-command-contracts.ts";

const args = new Set(process.argv.slice(2));
const unknown = [...args].filter((arg) => arg !== "--json");
if (unknown.length > 0) {
  console.error(`Unknown option(s): ${unknown.join(", ")}`);
  process.exit(2);
}
const result = checkDocumentedCommandContracts(process.cwd());
console.log(
  args.has("--json")
    ? JSON.stringify(result, null, 2)
    : formatDocumentedCommandContracts(result),
);
if (!result.ok) process.exitCode = 1;
