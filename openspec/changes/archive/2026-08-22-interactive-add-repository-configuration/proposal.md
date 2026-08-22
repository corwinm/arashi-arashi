## Why

`aw add` can register a cloned repository, but users must still edit `.arashi/config.json` or create lifecycle files manually to finish common worktree setup. With canonical inline hooks, native hook files, and materialization schemas now shipped, Arashi can offer safe optional onboarding while establishing one reusable configuration-editor boundary for follow-up `aw configure` work in #316.

## What Changes

- Add a human-TTY-only, default-no repository setup step after `add` has cloned and inspected the repository but before its single configuration write.
- Let users choose repository-owned `copy` and `symlink` settings, then choose inline commands or editable native hook scripts for each selected lifecycle; generated scripts use the exact active filename, begin as safe no-ops, and are executable immediately.
- Discover a bounded set of likely ignored local paths as unselected suggestions without reading or displaying contents; retain manual entry and the existing `node_modules` warning boundary.
- Introduce a reusable repository-configuration editor model with explicit field/scope metadata, configured-versus-unset presentation, canonical validation adapters, cancellation-aware prompt collection, and sanitized summaries. `add` consumes only the onboarding subset; editing existing configuration remains #316.
- Validate the complete candidate and planned active script paths in memory, show one sanitized summary, and perform at most one concurrency-safe configuration save plus transaction-owned atomic executable-script installation after final confirmation.
- Preserve minimal-add behavior for declined onboarding, `--force`, `--json`, and non-TTY execution, plus existing duplicate fallback, `--create-setup`, coordinated-worktree, rollback, JSON-isolation, and exit contracts.
- Update CLI guidance, canonical website onboarding/configuration docs, generated agent-readable exports, packaged skill guidance, and coordinated semantic validation together.

## Capabilities

### New Capabilities

- `interactive-repository-configuration`: Defines optional `add` onboarding, the reusable repository-configuration editor boundary, canonical field collection and validation, inline-or-executable-file hook choices, bounded candidate discovery, sanitized summaries, invocation eligibility, cancellation, and final confirmation.

### Modified Capabilities

- `coordinated-add-materialization`: Extends add's transaction and rollback contract so the complete selected repository entry and invocation-owned active no-op hook scripts are handled safely across direct, bare, and linked-parent modes.
- `docs-workflow-guidance-sections`: Adds concise public onboarding guidance for optional repository copy, symlink, and inline-or-executable-file hook configuration without duplicating exhaustive contracts.
- `docs-agent-readable-exports`: Carries the canonical add-onboarding behavior into generated Markdown and LLM discovery surfaces.
- `arashi-skill-guidance`: Teaches agents when and how to use optional add onboarding while preserving source secrecy and routing detailed field semantics to existing references.
- `cross-repo-command-contracts`: Enforces shared onboarding semantics across CLI, docs/exports, authored and extracted skill guidance, and stable aggregate entrypoints.

## Impact

- **CLI (`repos/arashi`)**: `src/commands/add.ts`, new or existing configuration-editor/prompt modules, canonical config/materialization validation reuse, ignored-candidate discovery, PTY/unit/integration coverage, command contracts, README/configuration/add guidance, and generated artifacts.
- **Docs (`repos/arashi-docs`)**: onboarding and configuration guidance plus regenerated agent-readable exports and registered semantic checks.
- **Skills (`repos/arashi-skills`)**: authored and packaged Arashi guidance plus source/package semantic checks.
- **Meta repository**: OpenSpec deltas, coordinated semantic fixtures/checkers, and child-first/archive-last delivery evidence.
- No configuration schema expansion, runtime hook/materialization behavior change, inferred executable behavior, new non-interactive value flags, workspace-root configuration prompts, or existing-entry editor is introduced.
