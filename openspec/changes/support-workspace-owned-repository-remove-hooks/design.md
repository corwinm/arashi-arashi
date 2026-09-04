## Context

Configured create stores repository-specific native hooks under the workspace root as `.arashi/hooks/<lifecycle>.<repo><ext>`, while configured remove currently models repository scope only through a file inside the configured child source checkout or inline configuration under `repos.<name>.hooks`. Runtime, dry-run, doctor, onboarding, deletion, docs, and packaged guidance each encode that asymmetry. Issue #354 requires the workspace owner to be able to choose a repository-targeted remove script or inline hook without placing operational policy in the child repository.

The existing repository-local remove file contract is public and must remain compatible. Remove hooks also gate destructive work, so new discovery and ambiguity must fail before any hook or removal mutation.

## Goals / Non-Goals

**Goals:**

- Add one workspace-owned repository-specific native filename per remove lifecycle and repository.
- Preserve repository scope, source-checkout cwd, target-consistent context, and existing remove ordering.
- Keep runtime, dry-run, doctor, onboarding, delete, docs, contracts, and packaged guidance on one candidate model.
- Preserve existing repository-local files while making every multi-source collision explicit and pre-mutation.
- Prove POSIX and native Windows discovery, execution, ambiguity, output, and onboarding behavior.

**Non-Goals:**

- Change standalone hook locations or activate configured hooks without valid workspace configuration.
- Change hook timing, target multiplicity, input, timeout, JSON, failure, or finalization semantics.
- Add dynamic inline keys such as `hooks.scripts["pre-remove.<repo>"]`.
- Remove repository-local remove hook support in 1.x.
- Execute both repository-native forms as two hooks.

## Decisions

### 1. The new file belongs to the existing repository logical location

For repository `api`, configured remove will consider `.arashi/hooks/pre-remove.api<ext>` and `.arashi/hooks/post-remove.api<ext>` under the active configuration root. A selected source reports plain `hookName: "pre-remove"|"post-remove"`, `scope: "repository"`, repository source ownership, and the qualified file path. It executes from the configured target repository source checkout, not from the directory containing the script.

This keeps inline ownership at `repos.api.hooks.<lifecycle>` and avoids introducing encoded inline configuration. Treating the file as workspace scope was rejected because it would alter ordering, cwd, and ownership.

### 2. Repository scope has one selected source and three possible claims

The repository logical location can be claimed by:

1. `repos.<name>.hooks.<lifecycle>` inline configuration;
2. workspace-owned `.arashi/hooks/<lifecycle>.<repo><ext>`;
3. compatible repository-local `<repo>/.arashi/hooks/<lifecycle><ext>`.

Exactly zero or one claim is valid. Any two or more claims produce the existing validation/ambiguity classification before hook execution or removal mutation, with every native candidate path and source kind retained in bounded diagnostics. Native extension ambiguity within either directory is part of the same preflight. Silent precedence and double execution were rejected because either can unexpectedly bypass or duplicate destructive-operation policy.

### 3. One shared planner supplies runtime, preview, and doctor

Configured remove planning will build repository candidates from the configuration root and target repository path, then pass the complete set through the shared preparation logic. Dry-run previews the selected source or the same failure without execution. Doctor uses the same candidate construction, platform extension handling, interpreter preflight, executable checks, and ambiguity data.

### 4. Interactive repository file onboarding uses the workspace-owned form

When add/configure repository onboarding chooses file mode for `pre-remove` or `post-remove`, the active safe scaffold will be written under the configuration root with the repository-qualified filename. Existing repository-local files remain discoverable but block creating a second claim. Planning and publication revalidate both the workspace destination hierarchy and the target repository's compatible hook location so a concurrent file or ancestor replacement cannot leave two active claims. This aligns file ownership with `repos.<name>` configuration and avoids writing operational workspace policy into a child checkout or the wrong linked worktree.

The existing active-file safety, no-overwrite, permissions, transaction, and rollback rules remain unchanged.

### 5. Repository deletion owns only exact qualified workspace files

Deleting configured repository `api` includes exact supported `.arashi/hooks/pre-remove.api<ext>` and `post-remove.api<ext>` candidates in the workspace-owned hook plan, alongside existing exact create-hook files. It never glob-deletes similarly named files, repository-local content beyond existing clone ownership, or user-global hooks.

### 6. Cross-repository surfaces change together

The CLI owns runtime, onboarding, doctor, dry-run, generated command/inline contracts, and CLI docs. The documentation site and packaged skill will teach both workspace-owned and compatible repository-local forms, the single-source collision rule, and unchanged scope/cwd. Meta semantic checks will reject stale surfaces and prove release-shaped skill guidance.

## Risks / Trade-offs

- **Previously ignored qualified files become active after upgrade** → Require exact documented naming and surface them through doctor/dry-run; activation is the requested compatibility change.
- **A workspace may already contain both file forms** → Fail before mutation with exact candidate paths rather than choosing precedence.
- **Repository names may contain filename-hostile characters** → Reuse the validated configured repository key and existing create-hook filename/path-containment rules; do not normalize or rewrite identifiers.
- **Root-owned scripts execute with child cwd** → Preserve repository scope and expose source path separately; add integration coverage so callers do not infer cwd from storage location.
- **Windows candidate sets multiply** → Resolve case-insensitively and fail on every multi-extension or cross-location collision through the shared planner.
- **Onboarding path migration changes where new files are created** → Preserve old runtime compatibility; generate only the new canonical form and document manual migration as optional.

## Migration Plan

1. Release additive runtime/doctor/dry-run support while retaining repository-local compatibility.
2. Change new interactive repository file onboarding to the workspace-owned qualified filename.
3. Publish aligned CLI docs, website exports, and packaged skill guidance in the same coordinated delivery.
4. Existing repository-local scripts require no migration. Users may move one manually only after removing the old claim; doctor and remove preflight reject overlapping forms.
5. Rollback restores the earlier resolver and onboarding behavior; root-qualified remove files become ignored again but repository-local and inline hooks remain usable.

## Open Questions

None. Issue #354 establishes workspace-owned repository-specific script support; compatibility and destructive safety require collision rather than precedence when multiple repository claims exist.
