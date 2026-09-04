#!/usr/bin/env node
import {
  checkHookContracts,
  checkOwningHookContracts,
  formatHookContracts,
} from "./hook-contracts.ts";

const args = new Set(process.argv.slice(2));
const unknown = [...args].filter((argument) => argument !== "--json");
if (unknown.length > 0) {
  console.error(`Unknown option(s): ${unknown.join(", ")}`);
  process.exit(2);
}

const result = await checkHookContracts(process.cwd());
result.diagnostics.push(...checkOwningHookContracts(process.cwd()));
result.ok = result.diagnostics.length === 0;
console.log(
  args.has("--json")
    ? JSON.stringify(result, null, 2)
    : formatHookContracts(result),
);
if (!result.ok) process.exitCode = 1;
