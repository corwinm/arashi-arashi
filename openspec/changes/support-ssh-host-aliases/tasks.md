## 1. CLI RED Coverage

- [x] 1.1 Add focused URL-validation, parsing, name-derivation, Commander-help, and generated-contract tests for explicit-user SCP aliases, omitted-user SCP aliases with single- and multi-segment paths, `ssh://` aliases with and without users, `--name`, malformed values, whitespace, and both `C:\...` and `C:/...` Windows drive forms on every test platform; record the expected RED before implementation.
- [x] 1.2 Add focused clone-discovery tests proving omitted-user SCP aliases participate in SSH inference, already-SSH configured values remain byte-for-byte exact, HTTPS-to-SSH conversion remains supported, and selected/inferred HTTPS never converts an SSH URL; record the expected RED.
- [x] 1.3 Add real temporary-workspace/process-level tests proving `add` passes and persists the exact alias URL, unavailable aliases retain existing rollback/non-mutation behavior, and `clone` preserves exact alias argv plus per-repository partial-success human/JSON envelopes; include a coordinated worktree whose canonical local child source is unavailable so the remote-fallback branch is exercised with an exact SSH alias; record the expected RED without using real user SSH configuration or external network.

## 2. CLI Implementation

- [x] 2.1 Refactor add URL recognition/parsing to accept constrained `[user@]host:path` syntax with an optional user while preserving existing HTTPS, Git, file, absolute-path, safe-name, and `--name` behavior.
- [x] 2.2 Normalize the add argument once for Git argv/result/config consistency, and update clone protocol detection/application so matching or preserved configured protocols return the byte-for-byte source value, omitted-user SCP aliases detect as SSH, HTTPS-to-SSH remains conventional, and SSH-to-HTTPS returns the exact SSH source instead of fabricating a mapping.
- [x] 2.3 Update `add` Commander help, invalid-URL guidance, the generated CLI command contract, interactive clone protocol copy, and stable error context to describe optional-user aliases and best-effort protocol preference without adding SSH preflight/config access or changing output envelopes.
- [x] 2.4 Run focused add, clone-discovery, clone integration, JSON, rollback, and Windows-path tests; then run CLI format, lint, typecheck, generated completion/contract freshness, full test, and build gates from the final stable tree.

## 3. Coordinated Contract RED Coverage

- [x] 3.1 Extend the nearest meta semantic checker and out-of-repository fixtures to require optional-user syntax in CLI help/generated command metadata plus supported alias forms, exact SSH preservation, no automatic SSH-to-HTTPS mapping, no SSH-config ownership, and machine-local portability guidance across canonical docs, generated exports, and packaged skills; record RED against unchanged companion content.
- [x] 3.2 Add checker self-tests for each positive/negative semantic and prove the focused checker is invoked by the authoritative coordinated CI workflow without mutating real worktrees.

## 4. Documentation and Packaged Guidance

- [x] 4.1 Update canonical add, clone, configuration, and troubleshooting docs with supported SSH forms, preservation/protocol behavior, Git-owned failures, the machine-local boundary, and canonical-remotes-plus-`insteadOf` guidance.
- [x] 4.2 Regenerate public Markdown and agent-readable exports from canonical docs and prove deterministic freshness.
- [x] 4.3 Update the packaged Arashi command/troubleshooting references with the same support, ownership, failure, and portability contract, then run package/security/validation gates and inspect the produced artifact boundary.
- [x] 4.4 Run the focused SSH alias checker, aggregate cross-repository contracts, meta tests/typecheck/format checks, and authoritative workflow self-tests after the final companion edit.

## 5. Delivery and Verification

- [x] 5.1 Run an independent implementation review against the approved OpenSpec requirements, reconcile only reproducible contract findings, and rerun every affected final gate after the last edit.
- [ ] 5.2 Commit and open separate CLI, docs, skills, and meta/OpenSpec PRs as required, cross-link all PRs to issue #277 with non-closing references on child PRs, and require exact-head CI plus eligible review feedback.
- [ ] 5.3 Merge green child PRs first; then complete tasks, archive/sync the OpenSpec change, validate synced specs and coordinated contracts, update the meta PR to close #277, merge it last, and verify issue closure.
- [ ] 5.4 Pull the base coordinated workspace, remove the feature worktree and surviving local/remote feature branches, and verify all configured repositories are clean and synchronized on `main`.
