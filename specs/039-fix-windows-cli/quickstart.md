# Quickstart: Windows CLI Compatibility

## Goal

Verify the CLI runs on Windows after npm install in PowerShell and Git Bash, and that failures provide clear guidance.

## PowerShell Smoke Test

1. Install the CLI with npm (global or local install).
2. Run a basic command in PowerShell (help or version).
3. Confirm the CLI starts and returns expected output.

## Git Bash Smoke Test

1. Install the CLI with npm (global or local install).
2. Run the same basic command in Git Bash.
3. Confirm the CLI starts and returns expected output.

## Failure Guidance Check

1. Simulate an unsupported or misconfigured launch context.
2. Run a basic command.
3. Confirm the CLI returns a clear message describing the issue and the next steps.
