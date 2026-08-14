## Context

`add` currently validates Git URLs with command-owned regular expressions. It accepts `git@host:path` and `ssh://user@host/path`, but rejects Git's valid SCP-like `host:path` form when no user is present. `clone` infers one SSH/HTTPS preference for a run and reconstructs every selected URL through `applyCloneProtocol`; that can alter an already-correct SSH URL and can fabricate `https://<ssh-alias>/...` from a machine-local alias.

SSH alias resolution belongs to Git/OpenSSH and can depend on user-specific configuration, `Include` files, identity selection, proxies, ports, and environment. Arashi cannot reliably distinguish a DNS hostname from an alias by syntax alone and must not inspect potentially sensitive SSH configuration.

The change affects CLI parsing and clone URL selection, plus canonical docs, generated exports, packaged skills, and coordinated semantic validation. Configuration remains a string `gitUrl`; no migration or dependency is required.

## Goals / Non-Goals

**Goals:**

- Accept Git SSH/SCP syntax with an optional explicit user.
- Normalize outer whitespace once for an `add` CLI argument, then preserve the normalized URL in Git argv, result output, and configuration; preserve an already-configured clone URL byte-for-byte whenever conversion is forbidden or unnecessary.
- Prevent automatic SSH-to-HTTPS rewriting through opaque hosts.
- Retain existing add rollback, clone partial-success, output, and JSON contracts.
- Make machine-local portability and Git-native per-user rewriting clear across maintained guidance.

**Non-Goals:**

- Read, parse, resolve, validate, or edit SSH configuration.
- Probe SSH connectivity separately from the requested Git operation.
- Infer whether a host token is a DNS name or an alias.
- Store keys, identity files, resolved hostnames, or a new per-machine Arashi override.
- Redesign repository configuration or clone selection.

## Decisions

### 1. Parse supported Git remote forms structurally, but delegate reachability to Git

Arashi will recognize:

- `https://host/path`
- `git://host/path`
- `file://...` and existing supported absolute local paths
- `ssh://[user@]host/path`
- `[user@]host:path`, including `host:path`

The SCP-like parser will require a non-empty host and path, require that no slash appears before the first colon, reject whitespace and Windows drive syntax before SSH classification, and derive the repository name from the final path segment using the existing safe-name constraint. The optional user and host are descriptive parse results only. Both `host:repo.git` and `host:owner/repo.git` remain valid Git forms.

This keeps early errors useful without pretending Arashi can authenticate or resolve the remote. Relying exclusively on a broad “contains colon” check was rejected because it can misclassify Windows drive paths and malformed values. Invoking SSH as a preflight was rejected because it duplicates Git behavior, can prompt or hang, and expands the security boundary.

### 2. Treat every parsed SSH host as opaque

Arashi will not distinguish aliases from public hostnames. It will never read `~/.ssh/config`, call `ssh -G`, expand `HostName`, or persist a resolved host.

Syntactic alias detection such as “hostname has no dot” was rejected because SSH aliases may contain dots and real intranet hostnames may not. Parsing SSH configuration was rejected because resolution is contextual and its contents can expose usernames, network topology, proxy commands, and identity paths.

### 3. Preserve URLs already using the selected protocol

Protocol application will first detect the source protocol. If it already matches the preferred protocol, the function returns the original input URL rather than reconstructing it. Protocol detection may inspect a trimmed view, but preservation uses the authoritative input bytes. This preserves `ssh://` form, optional usernames, aliases, suffix choices, and an already-configured value exactly.

For `add`, URL parsing trims outer whitespace once; the resulting normalized `urlInfo.url` becomes the single value passed to Git, returned in human/JSON results, and persisted. For `clone`, configuration is already the source of truth, so preserved SSH URLs are passed through byte-for-byte rather than silently normalized. This removes the current add inconsistency in which validation/persistence use the trimmed URL while clone/result paths can use the raw argument.

Reconstruction remains allowed for HTTPS-to-SSH conversion because the HTTPS URL provides an explicit network host and repository path and the existing product behavior intentionally chooses Git's conventional `git@host:path.git` form.

### 4. Never automatically convert SSH URLs to HTTPS

An SSH remote does not contain a trustworthy HTTPS host mapping. When HTTPS is inferred or selected and a repository has an SSH URL, Arashi will preserve that repository's SSH URL rather than manufacture an HTTPS URL. Interactive copy and documentation will explain that SSH URLs remain unchanged. Thus a mixed workspace may remain mixed even after HTTPS is selected; the preference is best-effort and subordinate to preserving configured SSH routing.

Failing the whole clone run was rejected because the stored SSH URL is already cloneable and preserving it is safer. Resolving an alias through SSH configuration was rejected by the opaque-host boundary. A hardcoded host allowlist was rejected because it would privilege specific forges, mishandle enterprise hosts, and still not prove account/path equivalence.

### 5. Preserve existing mutation and reporting boundaries

`add` continues to clone with the once-normalized supplied URL and enters its existing rollback path if Git fails. `clone` continues processing selected repositories independently and reports per-repository failure/partial success through existing human and JSON envelopes. Errors identify the repository and retain the underlying Git failure; Arashi adds no separate SSH probe or credential diagnosis.

Tests will inject or use local Git boundaries so they can prove exact argv/url preservation and rollback without depending on a developer's real SSH configuration or external network.

### 6. Enforce guidance semantically across maintained surfaces

Canonical add/clone/configuration guidance will show supported forms, state that aliases are machine-local, and recommend canonical committed remotes with local Git `url.<base>.insteadOf` rewriting when portability matters. Generated agent-readable exports and packaged skill guidance must carry the same ownership and portability boundaries. The coordinated checker will use positive and negative semantic assertions so stale guidance or claims that Arashi manages SSH configuration fail deterministically.

The VS Code extension is not an owning behavior surface for this slice: it delegates add/clone behavior to the CLI and introduces no parser or stored URL policy. Presentation content is also excluded unless source inspection finds maintained alias-specific guidance.

## Risks / Trade-offs

- [A shared config may contain a machine-local alias unavailable to collaborators] → Document the boundary prominently and recommend canonical remotes plus local Git `insteadOf` rules.
- [Best-effort HTTPS preference can leave a mixed-protocol clone run] → Make preservation precedence explicit in prompt/help/docs and test it; never claim strict conversion when SSH sources are present.
- [Broader SCP syntax could misclassify local paths] → Use a constrained grammar, preserve existing absolute/file handling, and add Windows-drive and malformed-input negative tests.
- [Underlying Git errors vary by platform and Git version] → Assert stable Arashi context and mutation outcomes rather than exact external stderr wording.
- [Docs drift across repositories] → Add focused semantic checks reachable from coordinated CI and validate generated exports/package contents.

## Migration Plan

1. Add focused RED tests for no-user SCP aliases, exact preservation, asymmetric protocol conversion, and failure rollback/partial results.
2. Implement parser and clone URL-policy changes without changing configuration schema.
3. Update canonical docs, generated exports, packaged skills, and coordinated checks.
4. Release through the normal CLI/docs/skills flow. Existing configurations remain valid and require no rewrite.

Rollback is a normal code/docs revert. No persisted data transformation is needed; URLs stored by prior and new versions remain ordinary Git remote strings.

## Open Questions

None. The proposal intentionally chooses preservation over strict per-run protocol uniformity whenever the source URL is SSH.
