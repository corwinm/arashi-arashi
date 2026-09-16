## 1. Probe Context Contract Tests

- [ ] 1.1 Add a deterministic fake-runner test harness for invocation lifetime, scoped promise sharing, ref generations, mutation barriers, and compare-and-delete rejection eviction
- [ ] 1.2 Add real-Git identity fixtures for root/subdirectory/symlink aliases, linked worktrees, bare repositories, separate Git directories, missing paths, and malformed/failing discovery
- [ ] 1.3 Add environment/config fixtures for `GIT_DIR`, `GIT_WORK_TREE`, worktree/conditional config, config injection, namespace/storage overrides, and fingerprint secrecy
- [ ] 1.4 Add optional worktree-list seeding tests proving post-identity ordering, canonicalization, stale/prunable refusal, environment safety, and amortized probe counts
- [ ] 1.5 Add exact-fetch tests for shared success, shared classified failure, semantic-fingerprint separation, differing refspec/options, and one-repository mutation sequencing
- [ ] 1.6 Add barrier tests proving fresh ref snapshots after successful fetch and after a failing fetch that mutates refs, with no pre-fetch or in-flight snapshot reuse
- [ ] 1.7 Add a fresh-context test proving no probe or failure survives into a second command invocation

## 2. Probe Context Implementation

- [ ] 2.1 Implement combined plumbing identity discovery, strict parsing, bare-compatible fallback, and realpath canonical repository/worktree keys without Git-internal filesystem parsing
- [ ] 2.2 Implement repository-, worktree-, and generation-scoped probe maps with in-flight sharing and retry-safe rejected-discovery eviction
- [ ] 2.3 Implement effective Git configuration/environment snapshots and secret-safe internal fingerprints at the normalized Git spawn boundary
- [ ] 2.4 Implement exact targeted-fetch attempt keys, shared success/failure results, repository mutation sequencing, and pre/post-settlement generation barriers
- [ ] 2.5 Implement optional post-proof `worktree list --porcelain` seeding only where charged probe accounting demonstrates amortization
- [ ] 2.6 Run all standalone context tests and inspect production code to confirm no `.git`, gitfile, `commondir`, ref, or object-storage parser was introduced

## 3. Status Integration Tests

- [ ] 3.1 Add failing status wiring tests proving configured and standalone repository inspections receive one invocation context while worktree-local facts remain separate
- [ ] 3.2 Add deterministic status parity tests for refreshed/local freshness, configured base, upstream/default target deduplication, preferred and fallback symbolic remote HEAD, detached and unborn HEAD, missing remote ref, generic fetch failure, bare workspace, and missing repositories
- [ ] 3.3 Add NUL-delimited porcelain-v2 regression fixtures for tabs, newlines, Unicode, rename/copy origins, conflicts, ignored files, and type changes
- [ ] 3.4 Add verbose parity tests proving exactly one native `git status` and unchanged native output
- [ ] 3.5 Add deterministic command-ledger assertions for the exact 7 normal / 8 verbose fixture budget, including charged optional worktree seeding

## 4. Status Integration

- [ ] 4.1 Create one context at the status command boundary and thread it through configured and implicit standalone inspection dependencies
- [ ] 4.2 Replace duplicate topology, effective-config, ref, target, fetch, and comparison probes with scope-correct context calls while preserving output order and repository-local failure isolation
- [ ] 4.3 Preserve resolve-target → pre-ref snapshot → targeted fetch → post-ref snapshot → porcelain reporting order and factual command-level freshness aggregation
- [ ] 4.4 Preserve remote-aware symbolic HEAD fallback and all #371 human/JSON warnings, errors, path parsing, and native verbose behavior
- [ ] 4.5 Run focused status, Git-remote, workspace-context, standalone, JSON contract, and completion tests plus a real built-executable smoke

## 5. Benchmark Acceptance

- [ ] 5.1 Record same-revision base artifacts for refreshed small/large normal/verbose status using the unchanged fixture, topology, configuration, command boundary, runtime, and Trace2 attribution rules
- [ ] 5.2 Run candidate artifacts and programmatically verify counts reconcile as named repositories plus unattributed equals aggregate with no unexplained unattributed sessions
- [ ] 5.3 Verify candidate aggregate counts are strictly below small 39/42 and large 93/102 normal/verbose baselines
- [ ] 5.4 Verify every named repository is strictly lower in all four comparisons, including representative main 13/14 and child 9/10 normal/verbose baselines, and verify the conservative 7/8 target
- [ ] 5.5 Verify benchmark semantic output, canonical repository paths, fixture topology, freshness, and native verbose parity are unchanged

## 6. Verification and Delivery

- [ ] 6.1 Run CLI format, lint, typecheck, focused and full tests, benchmark tests, contract checks, completion checks, and build in producer-before-consumer order
- [ ] 6.2 Independently review specification compliance before code quality and resolve all blocking findings at the exact child head
- [ ] 6.3 Commit and open the issue-linked CLI child pull request, verify exact-head CI, and record immutable benchmark and review evidence without modifying Rust
- [ ] 6.4 After the child merges, update implementation evidence, strictly validate and archive this OpenSpec change, run meta and coordinated checks, and deliver the signed meta closeout separately
