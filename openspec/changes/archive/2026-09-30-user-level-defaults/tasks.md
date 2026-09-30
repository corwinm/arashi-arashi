## 1. CLI

- [x] Add partial user configuration validation, schema, actionable errors, and field-level merge/provenance.
- [x] Apply effective defaults to configured and standalone create/switch without persisting merged state.
- [x] Resolve main/linked paths consistently, qualify absolute roots, preserve Git-based existing-worktree discovery, and align standalone ignore/bootstrap behavior.
- [x] Add `aw config effective` human/JSON inspection.
- [x] Add focused unit and Git-backed integration coverage.

## 2. Companion repositories

- [x] Document setup, fields, precedence, paths, diagnostics, and inspection in `arashi-docs`.
- [x] Update installed workflow and troubleshooting guidance in `arashi-skills`.
- [x] Review `arashi-vscode`; no change is required because CLI invocation already supplies editor-host context and resolves the user layer.

## 3. Validation and delivery

- [x] Run CLI lint, tests, build, schema, completion, and contract validation.
- [x] Run docs validation.
- [x] Run skills validation.
- [x] Commit meta-repo, CLI, docs, and skills separately with issue #387 references.
