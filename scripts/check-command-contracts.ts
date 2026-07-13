#!/usr/bin/env node
import { checkContracts, formatHuman } from "./command-contracts.ts";

const args = new Set(process.argv.slice(2));
const unknown = [...args].filter((arg) => arg !== "--json");
if (unknown.length) {
  console.error(`Unknown option(s): ${unknown.join(", ")}`);
  process.exit(2);
}
const result = await checkContracts(process.cwd());
console.log(
  args.has("--json") ? JSON.stringify(result, null, 2) : formatHuman(result),
);
if (!result.ok) process.exitCode = 1;
