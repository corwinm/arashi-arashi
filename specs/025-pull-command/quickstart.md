# Phase 1 Quickstart: Pull Command

## Goal

Update eligible repositories in the workspace while reporting progress and outcomes.

## Basic Usage

```bash
arashi pull
```

## Targeted Repositories

```bash
arashi pull --only repo-a --only repo-b
```

## Verbose Diagnostics

```bash
arashi pull --verbose
```

## Expected Outcomes

- Each repository is reported as updated, skipped, failed, or manual-update.
- Any conflict or error triggers a rollback for that repository and a manual-update status.
- The command exits non-zero if any repository fails or needs manual update.
