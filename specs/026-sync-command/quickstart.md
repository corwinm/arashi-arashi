# Quickstart: Sync Command

## Goal

Align managed repositories to the parent repository branch with clear progress, timing, and error reporting.

## Basic Usage

```bash
arashi sync
```

## Sync a Subset

```bash
arashi sync --only repo-a,repo-b
```

## Verbose Output

```bash
arashi sync --verbose
```

## Expected Output

- Progress indicator per repository
- Duration for each repository action
- Final summary of successes and failures

## Common Failure Scenarios

- Configuration missing or invalid
- Branch creation fails for a repository
- Per-repository timeout exceeded
