#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  printContractCheckRegistration,
  validateContractCheckRegistration,
} from "./check-contract-registration.ts";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const allowed = new Set(["--json", "--prevalidated-children"]);
const unknown = args.filter((argument) => !allowed.has(argument));
if (unknown.length > 0) {
  console.error(`Unknown option(s): ${unknown.join(", ")}`);
  process.exit(2);
}

const jsonMode = args.includes("--json");
const diagnostics: unknown[] = [];
const registration = await validateContractCheckRegistration(repositoryRoot);
if (!jsonMode) printContractCheckRegistration(registration);
if (!registration.ok) {
  if (jsonMode) {
    diagnostics.push(
      ...registration.defects.map((defect) => ({
        severity: "error",
        category: "meta",
        code: "CONTRACT_CHECKER_REGISTRATION_INVALID",
        source: "scripts/contract-checks.json",
        message: defect,
      })),
    );
    console.log(JSON.stringify({ ok: false, diagnostics }, null, 2));
  } else {
    console.error(
      "Contract checker aggregate aborted before child execution because registration preflight failed.",
    );
  }
  process.exit(1);
}

let failed = false;
for (const identity of registration.entries) {
  if (!jsonMode) console.log(`\n== Contract checker: ${identity} ==`);
  const childArgs = jsonMode ? ["--json"] : [];
  if (
    args.includes("--prevalidated-children") &&
    identity === "scripts/check-command-contracts.ts"
  )
    childArgs.push("--skip-focused-checkers");
  const result = spawnSync(
    process.execPath,
    [
      "--experimental-strip-types",
      join(repositoryRoot, identity),
      ...childArgs,
    ],
    {
      cwd: repositoryRoot,
      encoding: "utf8",
      env: process.env,
    },
  );

  let childFailureReported = false;
  if (jsonMode) {
    try {
      const parsed: unknown = JSON.parse(result.stdout);
      if (
        typeof parsed !== "object" ||
        parsed === null ||
        !("ok" in parsed) ||
        typeof parsed.ok !== "boolean" ||
        !("diagnostics" in parsed) ||
        !Array.isArray(parsed.diagnostics)
      ) {
        throw new Error(
          "expected an object with boolean ok and array diagnostics",
        );
      }
      diagnostics.push(...parsed.diagnostics);
      if (!parsed.ok) {
        failed = true;
        childFailureReported = true;
      }
    } catch (error) {
      diagnostics.push({
        severity: "error",
        category: "meta",
        code: "CONTRACT_CHECKER_JSON_INVALID",
        source: identity,
        message: `Checker emitted invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
      });
      failed = true;
      childFailureReported = true;
    }
  } else if (!jsonMode) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
  }

  if (result.error) {
    const message = `[STARTUP] ${identity} could not start: ${result.error.message}`;
    if (jsonMode)
      diagnostics.push({
        severity: "error",
        category: "meta",
        code: "CONTRACT_CHECKER_STARTUP_FAILED",
        source: identity,
        message,
      });
    else console.error(message);
    failed = true;
  } else if (result.signal) {
    const message = `[SIGNAL] ${identity} terminated by ${result.signal}`;
    if (jsonMode)
      diagnostics.push({
        severity: "error",
        category: "meta",
        code: "CONTRACT_CHECKER_SIGNALLED",
        source: identity,
        message,
      });
    else console.error(message);
    failed = true;
  } else if (result.status !== 0) {
    const message = `[NONZERO] ${identity} exited with status ${result.status}`;
    if (jsonMode && !childFailureReported)
      diagnostics.push({
        severity: "error",
        category: "meta",
        code: "CONTRACT_CHECKER_NONZERO",
        source: identity,
        message:
          result.stderr.trim().length > 0
            ? `${message}: ${result.stderr.trim()}`
            : message,
      });
    else if (!jsonMode) console.error(message);
    failed = true;
  }
}

if (jsonMode)
  console.log(JSON.stringify({ ok: !failed, diagnostics }, null, 2));
else if (!failed)
  console.log(
    `\nContract checker aggregate passed: ${registration.entries.length} checkers completed.`,
  );
if (failed) process.exitCode = 1;
