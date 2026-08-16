## Why

Short lifecycle actions currently require a separate executable file under `.arashi/hooks/`, even when the action is only a small workspace- or repository-owned command. Arashi should let configured workspaces keep concise, reviewable hook snippets beside the configuration that owns them without weakening the existing lifecycle, safety, platform, or automation contracts.

## What Changes

- Add root `hooks.scripts.<lifecycle>` workspace snippets and `repos.<name>.hooks.<lifecycle>` repository-targeted snippets for `pre-create`, `post-create`, `pre-remove`, and `post-remove`.
- Accept Bash string shorthand or an interpreter map with `bash`, `powershell`, and `cmd`; select deterministically by host support and fail before mutation when no configured interpreter is compatible and available.
- Resolve inline and native-file sources through the existing configured create/remove lifecycle locations, preserving ordering, cwd, per-target multiplicity, timeout, input, create's existing `--no-hooks`, quiet/JSON isolation, failure, rollback, and finalization semantics without adding that option to remove.
- Fail closed before mutation when an inline snippet and native file claim the same logical scope/lifecycle instead of choosing or executing both.
- Extend shared runtime/doctor resolution, existing remove dry-run previews, human/JSON outcomes, generated schema/config persistence, native integration coverage, docs/exports, packaged skill guidance, and coordinated semantic validation while preserving configured-create dry-run's no-discovery behavior.
- Identify inline sources by kind and owning workspace/repository without exposing configured command text in logs, previews, diagnostics, or structured results.
- Keep user-global hooks file-based and keep terminal applications outside interpreter dispatch.

## Capabilities

### New Capabilities

- `inline-lifecycle-hook-configuration`: Defines the typed configuration model, validation, interpreter selection, source-resolution, secrecy, and compatibility contract for configured inline hook snippets.

### Modified Capabilities

- `lifecycle-hook-contracts`: Extends configured create lifecycle execution, shared context, interpreter preflight, timeout, and outcome behavior to inline sources.
- `scoped-lifecycle-hooks`: Adds repository- and workspace-owned inline sources to configured remove discovery while preserving scope order, cwd, and standalone exclusions.
- `remove-lifecycle-hooks`: Extends configured remove gating, finalization, per-target multiplicity, failures, and outcome retention to inline sources.
- `remove-dry-run-preview`: Previews inline hook source kind and owner without executing or disclosing snippets.
- `workspace-health-diagnostics`: Makes `doctor` validate inline/file ambiguity and interpreter availability through the runtime resolver without executing or exposing snippets.
- `machine-readable-cli-output`: Extends the lifecycle outcome schema with non-secret source-kind/owner metadata while retaining one-document JSON and existing success/failure locations.
- `interactive-lifecycle-hook-input`: Makes pre-input attribution source-aware and permits only the approved additive outcome-source fields while preserving exact stream capture and sequential input behavior.
- `docs-workflow-guidance-sections`: Documents when to use inline snippets versus files, configuration ownership, portability, environment syntax, fail-fast composition, and secret handling in canonical/generated hook guidance.
- `arashi-skill-guidance`: Updates authored and packaged agent guidance for safe inline-hook configuration and validates it at the package boundary.
- `cross-repo-command-contracts`: Enforces normalized inline-hook schema and guidance semantics across CLI contracts, docs/exports, packaged skills, and coordinated validation.

## Impact

- **CLI:** config types/normalization/validation/persistence, generated JSON Schema, configured create/remove hook planning and execution, platform adapters, doctor, dry-run, human/JSON result types, generated contracts, and native/integration tests in `repos/arashi`.
- **Docs and exports:** canonical hook/configuration guidance and generated Markdown/LLM exports in `repos/arashi-docs`.
- **Skill package:** focused hook references, source/package semantic checks, and extracted release validation in `repos/arashi-skills`.
- **Meta-repository:** OpenSpec artifacts and one registered coordinated semantic checker through the stable aggregate; existing workflow topology remains unchanged unless evidence shows a reachability gap.
- **Compatibility/security:** existing file hooks remain unchanged when no inline source exists; no inline user-global hooks or external script paths are introduced; configured command text is treated as sensitive executable content.
