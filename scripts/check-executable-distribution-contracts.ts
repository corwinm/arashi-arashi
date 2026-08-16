#!/usr/bin/env node
import {
  checkExecutableDistributionContracts,
  formatExecutableDistributionResult,
} from "./executable-distribution-contracts.ts";

const args = new Set(process.argv.slice(2));
const unknown = [...args].filter((argument) => argument !== "--json");
if (unknown.length > 0) {
  console.error(`Unknown option(s): ${unknown.join(", ")}`);
  process.exit(2);
}

const result = await checkExecutableDistributionContracts(process.cwd());
console.log(
  args.has("--json")
    ? JSON.stringify(result, null, 2)
    : formatExecutableDistributionResult(result),
);
if (!result.ok) process.exitCode = 1;
