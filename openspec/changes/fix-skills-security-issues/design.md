## Context

Issue #124 identifies repeated security findings in `arashi-skills` documentation and skill artifacts: unverifiable remote script execution (`curl | bash`), privileged install steps, dynamic execution of downloaded binaries/hooks without integrity checks, and unsafe shell substitution patterns. The repository already has a security-compliance capability, but current requirements do not explicitly prohibit these documentation patterns, so scanner findings can recur even when CI passes unrelated checks.

Constraints:
- Keep guidance practical for contributors across macOS and Linux shells.
- Prefer low-friction, auditable installation paths over bespoke bootstrap scripts.
- Changes must remain compatible with existing skill packaging and release workflows.

## Goals / Non-Goals

**Goals:**
- Define explicit requirements for safe installation and command examples in skill docs.
- Eliminate high-risk guidance patterns that trigger security scanners.
- Require verifiable provenance/integrity checks before executing downloaded artifacts.
- Ensure metadata versioning is updated when security guidance changes are released.

**Non-Goals:**
- Re-architecting Arashi CLI distribution infrastructure.
- Building a new signed-update framework in this change.
- Refactoring unrelated skill content outside security-sensitive guidance.

## Decisions

1. Add normative spec requirements under `skills-security-audit-compliance` for install-command safety and shell-command hygiene.
   - Rationale: This keeps security expectations enforceable and testable at the requirements layer rather than as ad hoc reviewer preference.
   - Alternatives considered:
     - Only patching docs without spec updates (rejected: high regression risk).
     - Creating a separate capability for docs hygiene (rejected: unnecessary fragmentation for tightly related behavior).

2. Replace remote-script execution guidance with verifiable distribution methods (trusted package manager or release artifact verification workflow).
   - Rationale: Avoids direct runtime execution of untrusted network content.
   - Alternatives considered:
     - Keep `curl | bash` with warning text (rejected: still unacceptable risk pattern).
     - Keep custom installer but add optional checksum section (rejected: primary path would remain unsafe).

3. Require least-privilege examples and safe command composition in docs.
   - Rationale: Security scanners and users both treat documentation as executable policy; examples must avoid normalizing unsafe practices.
   - Alternatives considered:
     - Allow `sudo` and command substitution with disclaimers (rejected: scanners still flag and users may copy insecure defaults).

## Risks / Trade-offs

- [Risk] Safer install guidance may be longer than one-line bootstrap commands -> Mitigation: provide concise, copy-pasteable verified examples.
- [Risk] Some users rely on existing installer docs -> Mitigation: include migration notes in docs and keep fallback options explicit and verified.
- [Risk] Scanner rule differences can produce new false positives -> Mitigation: codify prohibited patterns in specs and align docs to deterministic examples.

## Migration Plan

1. Update `arashi-skills` skill docs and references to remove flagged install and command patterns.
2. Add/adjust examples to use verified installation and safe shell handling.
3. Update skill version metadata to publish the remediated guidance.
4. Run project lint/test/build and applicable security checks before merge.

Rollback strategy:
- Revert documentation and version changes if critical usability issues emerge, then re-issue with revised verified examples while preserving the no-`curl | bash` policy.

## Open Questions

- Which single verification method should be the canonical default (checksum-only, signature-only, or both) for release artifacts?
- Should CI add explicit pattern checks for prohibited install snippets in documentation files?
