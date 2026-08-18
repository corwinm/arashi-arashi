## Why

Arashi currently accepts one create-only base branch for every selected repository, which fails when a meta-repository and its configured children intentionally use different integration branches. The same branch policy should also govern cloning missing configured repositories, rather than leaving clone behavior dependent on each remote's default branch.

## What Changes

- Replace the create-only `defaults.create.baseBranch` setting with a workspace-level base-branch default shared by configured `create` and `clone` operations.
- Allow the meta repository and each configured child repository to override that workspace default in `.arashi/config.json`.
- Preserve `create --base <branch>` as the invocation-wide override and add a repeatable repository-specific CLI override for configured `create` and `clone`, including an unambiguous meta-repository selector.
- Resolve one effective base branch per selected repository with explicit precedence across repository CLI override, invocation-wide CLI override, repository config override, workspace default, and legacy behavior.
- Apply effective bases when creating new coordinated branches and when cloning or materializing missing configured repositories, while preserving coordinated target-branch alignment and existing-target reuse semantics.
- Validate names, selectors, duplicates, selected-repository scope, and remote availability before hooks or mutation; provide actionable human and structured JSON failures.
- Keep the old create-only config key as deprecated compatibility input for create, with an actionable migration diagnostic; canonical root `baseBranch` is the shared create/clone setting.
- Synchronize the configuration schema, generated CLI contracts and completions, canonical docs/exports, packaged skill guidance, and cross-repository semantic checks.

## Capabilities

### New Capabilities

- `repository-base-branch-policy`: Define shared workspace defaults, meta/child overrides, CLI override syntax and precedence, create/clone application, migration, and non-mutating validation.

### Modified Capabilities

- `create-base-branch-selection`: Resolve and report repository-specific effective bases rather than one logical branch shared by every selected repository.
- `create-command-defaults`: Move branch ancestry out of create-only defaults while preserving create launch/switch defaults and compatibility for the legacy key.
- `machine-readable-cli-output`: Report per-repository base sources and structured selector/resolution failures for create and clone.
- `cross-repo-command-contracts`: Publish and enforce the shared base-policy configuration and option semantics across generated contracts and companion repositories.
- `docs-workflow-guidance-sections`: Document shared defaults, meta/child overrides, clone behavior, migration, examples, and failure recovery in canonical and agent-readable exports.
- `arashi-skill-guidance`: Teach agents the canonical shared/per-repository create and clone workflows.

## Impact

- CLI implementation and tests in `repos/arashi`, including config normalization/schema generation, create planning, clone orchestration, Git branch/clone helpers, Commander options, completions, JSON output, and generated command contracts.
- Canonical configuration/create/clone documentation and generated exports in `repos/arashi-docs`.
- Packaged guidance and semantic contract records in `repos/arashi-skills`.
- Meta-repository OpenSpec artifacts and cross-repository contract validation.
- Additive CLI behavior plus a compatibility migration from `defaults.create.baseBranch`; no dependency changes.
