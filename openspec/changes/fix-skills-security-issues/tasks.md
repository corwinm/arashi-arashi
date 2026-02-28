## 1. Replace Unverifiable Installation Guidance

- [x] 1.1 Audit `repos/arashi-skills/arashi/SKILL.md` and security-flagged reference docs to locate every `curl | bash` and similar remote-script execution pattern.
- [x] 1.2 Replace unsafe installation examples with verifiable distribution workflows (trusted package manager and/or verified release artifact download path).
- [x] 1.3 Update documentation text to require integrity/provenance checks before executing downloaded binaries or lifecycle hook scripts.

## 2. Enforce Least Privilege and Shell-Safe Examples

- [x] 2.1 Remove default privileged install steps (for example `sudo mv` to system paths) and provide user-scoped alternatives as the primary guidance.
- [x] 2.2 Revise repository/worktree selection examples to avoid unsanitized command substitution and use shell-safe argument handling.
- [x] 2.3 Add concise risk/trust notes where optional privileged or advanced workflows remain necessary.

## 3. Versioning and Verification

- [x] 3.1 Bump `arashi` skill version metadata in `repos/arashi-skills` to reflect the security guidance update.
- [x] 3.2 Run repository validation (lint/tests and any security scanners used by SKILLS checks) and address regressions.
- [x] 3.3 Verify scanner-reported findings from issue #124 are remediated, then capture results for PR description and cross-repo references if companion docs/spec PRs are needed.
