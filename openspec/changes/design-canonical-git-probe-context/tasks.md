## 1. Probe Context Contract Tests

- [ ] 1.1 Build a deterministic fake-runner ledger that records exact executable, argv, canonical execution directory, environment, stdout bytes, parser, attempt token, generation, and root-session attribution.
- [ ] 1.2 Add real-Git identity fixtures for root/subdirectory/symlink aliases, linked worktrees, bare repositories, separate Git directories, missing paths, malformed output, and discovery overrides; prove combined identity replaces repository-type and upstream identity discovery.
- [ ] 1.3 Test exact NUL effective-config framing including valueless versus empty values; pre-fetch porcelain target discovery; born/unborn pre/post `for-each-ref` framing/namespaces; worktree/HEAD comparison scope; asymmetric ahead/behind orientation parity with `rev-list`; unsupported `ahead-behind` fallback; exact targeted fetch refspec; exact symbolic remote-HEAD fallback; and native verbose status.
- [ ] 1.4 Add general rejected-probe tests for repository/worktree/ref/discovery compare-and-delete eviction, concurrent failure sharing, corrected retry, and protection from an older rejection deleting a newer promise.
- [ ] 1.5 Add normalized-spawn fingerprint tests covering resolved executable and PATH/PATHEXT, complete environment, Windows case-normalized duplicate keys, HOME/XDG, SSH/askpass/proxy/credential/transport inputs, Git discovery/storage/config injection, exact config bytes, domain separation, synthetic digest collision, and zero secret leakage to errors/diagnostics/traces/artifacts.
- [ ] 1.6 Add a real-Git relative-remote regression where two linked worktrees have identical raw remote config and fetch argv but their canonical execution directories resolve that remote to different repositories and therefore MUST NOT share.
- [ ] 1.7 Add a real-Git safe linked-worktree fixture with absolute/equivalently resolved transport, no CWD-sensitive helper/config/environment, identical effective config bytes, and positively proven equivalent spawn semantics; assert it shares one fetch.
- [ ] 1.8 Add exact-fetch epoch tests: identical concurrent A shares success/failure; settled A then distinct overlapping-destination B then A reruns; explicit retry after failure uses a new token; distinct mutations serialize.
- [ ] 1.9 Add deterministic linearizability barriers proving readers await active mutation, capture a generation, discard/retry when generation changes, and never publish a snapshot started before or during mutation after settlement.
- [ ] 1.10 Add fresh-context disposal and optional worktree-seeding tests, including post-identity ordering, stale/prunable refusal, semantic ambiguity refusal, and charged amortization.

## 2. Probe Context Implementation

- [ ] 2.1 Implement strict combined identity parsing, bare fallback, realpath canonical keys, and bare sentinel without parsing `.git`, gitfiles, `commondir`, refs, or object storage.
- [ ] 2.2 Implement exact byte parsers for config/ref/porcelain commands, valueless config, born/unborn ref paths, worktree/HEAD-scoped comparisons, and supported-Git `ahead-behind` fallback without lossy line or shell parsing.
- [ ] 2.3 Implement repository-, worktree-, generation-, and attempt-token-scoped maps; evict all retry-safe rejected probes with compare-and-delete and retain only classified exact-attempt failures for their attempt epoch.
- [ ] 2.4 Implement the versioned length-framed SHA-256 spawn-semantic record, retain normalized bytes for collision-safe equality, and redact source bytes from every observable surface.
- [ ] 2.5 Implement positive cross-worktree equivalence proof including canonical CWD/relative endpoint resolution and fail toward separate attempts for helpers/config/environment Git cannot prove CWD-independent.
- [ ] 2.6 Implement mutation epochs, overlapping-destination serialization, pre/post invalidation, and linearizable read validation/retry.
- [ ] 2.7 Inspect production code to confirm stable Git plumbing only and no arbitrary failed probe remains cached for the invocation.

## 3. Status Integration and #371 Preservation

- [ ] 3.1 Add failing wiring tests proving configured and standalone status receive one context and combined identity replaces `shouldIncludeWorkspaceRootInRepositoryChecks()` plus duplicate upstream/identity discovery.
- [ ] 3.2 Preserve `--local` as strictly network-free: no fetch, ls-remote, remote helper, credential helper, SSH, HTTP(S), or other transport-capable operation starts.
- [ ] 3.3 Add human and JSON freshness matrix coverage for successful, failed, skipped, not-applicable, local, and mixed command outcomes using the established schema and diagnostics.
- [ ] 3.4 Preserve configured-base, upstream/default deduplication, preferred/origin/unique symbolic HEAD fallback, detached/unborn HEAD, linked worktrees at different HEADs, missing ref, generic fetch failure, bare workspace, missing repository, ordering, and failure isolation.
- [ ] 3.5 Preserve exact NUL porcelain-v2 path cases and exactly one native verbose `git status`; prove no reconstructed native output.
- [ ] 3.6 Assert the exact clean-fixture command ledger and parser ownership, no hidden config/rev-list/porcelain probes, and maximum 7 normal / 8 verbose root sessions per named repository.
- [ ] 3.7 Run focused status, Git-remote, workspace-context, standalone, JSON contract, completion, and real built-executable tests.

## 4. Benchmark Provenance and Acceptance

- [ ] 4.1 Before editing the harness, capture immutable provenance for base CLI `b648825295a5c342b6920be0585711678377b452`: fixture definition hash/version, exact topology/config/remotes, adapter source hash and argv, Trace2 attribution rule, OS/architecture, Git/Node/Bun/pnpm versions, build command/options/environment, executable hash, warm-up/sample counts, and metric method.
- [ ] 4.2 Build the base and candidate binaries independently, record both executable hashes and build logs, and run the same unchanged external adapter against both; do not compare an internal base collector with a candidate CLI.
- [ ] 4.3 Programmatically reconcile named repositories plus unattributed equals aggregate; require no unexplained unattributed sessions and exact canonical fixture paths/semantic output.
- [ ] 4.4 Verify strict aggregate reductions from small 39/42 and large 93/102 normal/verbose baselines and strict reductions for every named repository, including representative main 13/14 and child 9/10, while meeting the 7/8 clean-fixture cap.
- [ ] 4.5 Reject and rerun evidence if fixture, adapter, command boundary, runtime, build, attribution, freshness, or native verbose provenance differs.

## 5. Verification and Delivery

- [ ] 5.1 Run CLI format, lint, typecheck, focused/full tests, benchmarks, contracts, completion, and build in producer-before-consumer order.
- [ ] 5.2 Obtain exact-head specification-compliance and architecture/code-quality review and resolve all blockers.
- [ ] 5.3 Commit/open the CLI child PR, verify exact-head CI, and record immutable evidence without modifying Rust.
- [ ] 5.4 After child merge, update evidence, strictly validate/archive this change, run all-spec/manifest/scenario/diff/coordinated checks, and deliver the signed meta closeout.