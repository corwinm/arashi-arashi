# Checker test boundaries

`pnpm test` runs meta-only deterministic fixture, resolver, registry, workflow,
and semantic-checker tests. It does not need child checkouts or generated docs.
Automatic PR and main-push CI reports **Meta quality checks** and runs this suite,
type checking, and formatting with only the meta checkout.

`pnpm test:integration` runs `*.integration.test.ts` against real children in
`repos/`. Missing children fail setup, never skip. First check out the recorded
revisions and run the CLI/docs generation and canonical skill archive stages in
[cross-repo-command-contracts.md](cross-repo-command-contracts.md). The existing
integration workflow invokes this command after publishing revision evidence and
preparing those surfaces. Integration is now dispatch-only on upstream meta main;
resolver and evidence fixtures reject invalid dispatch provenance, upstream identities,
SHAs, checkout HEADs, manifest membership/order and artifact digests. Legacy caller
fixtures and fork/branch-selection paths have been retired. This final workflow
must not deploy until all five child callers have retired (see the rollout guide).

## Moved assertion inventory

Each section maps `tests/<name>.test.ts` to
`tests/<name>.integration.test.ts`. Test titles and all parameter rows/mutations
are preserved; `%s` denotes the complete original parameterized table, not one
representative assertion. Shared builders moved to `<name>.fixtures.ts`; they
read children only when explicitly invoked by integration tests. No child project
snapshots were added. Registration-only assertions remain in the default suite.

### `command-contracts`

Dependency: schemaV5/6/7/8Fixture copies live CLI contracts and child guidance/checkers; base fixture tests stay local.

- accepts the complete schema-v5 CLI option semantic contract
- accepts schema v6 completion metadata and coordinated companion semantics
- accepts schema-v8 shared repository-base semantics
- accepts manual assessment without obsolete automatic path coverage
- normalizes the complete canonical configure policy and companion classifications
- rejects controlled configure %s drift
- rejects controlled configure generic %s drift
- requires docs and skills coverage with a reasoned VS Code exclusion
- requires registered configure checker reachability for %s
- invokes the registered docs configure checker for controlled no-op drift
- invokes configure guidance checks in source and extracted-package flows
- the configure fixture itself matches the expected canonical policy
- rejects removed create-base guidance on companion skill surfaces: %s
- rejects removed create-base guidance on MDX surfaces
- rejects removed create-base guidance on generated and CLI surface %s
- allows explicit rejection and negation of the removed create-base key
- rejects schema-v8 repository-base %s drift
- rejects schema-v8 %s schema drift
- rejects schema-v8 %s
- rejects schema-v7 create-base %s
- rejects create-base policy on the wrong command option
- rejects packaged skill create-base policy drift
- rejects create-base config schema %s
- rejects missing schema-v7 %s CI reachability
- rejects schema-v7 create-base prerequisites in a sibling CI job
- rejects commented and out-of-order schema-v7 CI commands
- Retired: automatic create-base trigger-path enforcement and its negative test; dispatch-only policy is covered by local workflow tests, while the neighboring executable-stage and semantic-drift tests remain unchanged.
- rejects %s
- rejects CLI contract drift from optional-user SSH alias syntax
- rejects missing canonical and generated SSH alias guidance
- rejects missing packaged SSH alias guidance
- rejects repository-local insteadOf guidance for future clones
- requires focused SSH alias checks in coordinated CI
- rejects incomplete canonical completion guidance
- rejects polarity reversal in canonical completion safety guidance
- rejects incomplete canonical shell activation guidance
- rejects schema-v6 %s drift
- rejects missing %s CI reachability
- runs the focused %s completion checker
- rejects a string-valued schema version instead of bypassing schema-v5 checks
- rejects a missing schema-v5 %s
- rejects a missing audited zero-option command
- rejects an %s
- rejects malformed schema-v5 option array entries
- rejects an unapproved specialized short alias
- rejects inconsistent option flags, long name, and short alias
- rejects a canonical compatibility option that is %s
- rejects %s alias policy drift
- rejects a command-local short alias collision
- rejects schema-v5 %s drift
- rejects %s
- rejects asymmetric update inspection conflicts
- rejects update JSON execution drift
- rejects normalized docs record drift instead of loose token parity

### `hook-contracts`

Dependency: real child owner code, generated docs, or canonical archive.

- accepts equivalent repository-remove semantics on the real maintained hook surfaces
- the real packaged-skill checker rejects mixed-polarity alias precedence
- the real CLI owner independently rejects generated inline lifecycle contract drift
- the real docs owner independently requires generated Markdown route %s
- the real docs owner independently requires the curated llms.txt export

### `documented-command-contracts`

Dependency: maintained guidance across the configured children.

- covers every configured repository and passes maintained guidance

### `semantic-validation-entrypoints`

Dependency: real skills registry/aggregate implementation (sentinel mutations retained).

- source aggregate propagates a registered checker failure with its identity and diagnostics
- canonical extracted-package aggregate propagates package-only drift with checker diagnostics

### `worktree-materialization-contracts`

Dependency: real canonical archive producer; schema/guidance mutations still exercise that producer.

- accepts aligned owning surfaces and the extracted canonical skill package
- rejects removal of the sole generated schema field producer
- rejects contract fields becoming required
- rejects coordinated drift in the %s owning group
- rejects additive contradiction in a secondary %s surface
- accepts valid negated guidance: %s
- rejects semantic contradiction: %s
- fails closed when canonical packaged guidance is a symlink
- fails closed when the canonical package producer is unavailable

### `worktree-naming-contracts`

Dependency: live schema, current guidance, generated exports, and child registries.

- accepts the coordinated child heads through focused and aggregate paths
- accepts a controlled canonical path-budget contract
- rejects maxPathLength schema removal, type, bounds, and required drift
- rejects path-budget removal on every maintained guidance surface
- rejects exact nested maxPathLength example drift on docs and skill surfaces
- rejects semantic mutation on every maintained guidance surface
- rejects additive path-budget contradictions on every maintained guidance surface
- rejects removal of condition-bound overflow semantics
- keeps canonical truthful-negation controls green
- rejects every removed destination row through both paths
- rejects schema closure, enum, optionality, version, and stale-style drift
- rejects removed defaults and guarantees plus additive contradictions
- rejects polarity, closed-value, default, CLI destination, and generated contradictions
- rejects additive matrix and natural-language semantic reversals
- rejects stale child checker registrations
