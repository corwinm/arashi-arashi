## ADDED Requirements

### Requirement: Coordinated contracts enforce repository materialization semantics
The CLI configuration schema and normalized semantic contract SHALL publish direct repository `copy` and `symlink` arrays, configured-only scope, same-relative-path behavior, copy-before-symlink order, canonical source ownership, lifecycle timing, missing-source skip, no-overwrite/path-containment rules, no-fallback symbolic links, dry-run/outcome behavior, and copy-versus-symlink guidance. Coordinated validation SHALL compare those semantics with canonical CLI docs, website docs, generated agent-readable exports, and authored plus extracted-package Arashi skill guidance.

#### Scenario: Companion surfaces agree
- **WHEN** registered coordinated validation runs against current child revisions
- **THEN** CLI schema/contract, docs, exports, and packaged skills agree on the normalized repository materialization contract
- **AND** validation executes through the stable docs, skills source, skills package, and meta aggregates

#### Scenario: Materialization semantic drifts
- **WHEN** a controlled fixture removes or contradicts one required field, scope, ordering, source, safety, output, fallback, or guidance semantic
- **THEN** focused or coordinated validation fails with a stable diagnostic naming the owning surface and mismatch
- **AND** real coordinated worktrees remain unchanged

#### Scenario: Focused checkers are registered
- **WHEN** docs, skills, or meta repositories add materialization semantic checkers
- **THEN** each checker is registered in the existing fail-closed manifest and remains directly executable for RED/GREEN diagnostics
- **AND** existing stable aggregates execute it without a feature-specific workflow step

#### Scenario: Extracted skill package drifts
- **WHEN** authored skill guidance is correct but the canonical extracted package omits materialization guidance
- **THEN** the skills package aggregate and coordinated validation fail against the extracted artifact
- **AND** source success does not mask the package defect

#### Scenario: Authoritative workflow remains stable
- **WHEN** only registered semantic coverage changes and workflow topology, permissions, runtime, triggers, and artifact assembly are unchanged
- **THEN** authoritative workflow YAML remains feature-agnostic
- **AND** aggregate reachability tests prove the new checks execute in local and CI paths
