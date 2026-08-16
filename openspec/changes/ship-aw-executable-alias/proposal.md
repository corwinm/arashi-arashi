## Why

Arashi's frequent interactive workflows currently require the full `arashi` executable name, while a user-created shell alias is unavailable to scripts, agents, editors, CI, and other non-interactive callers and behaves inconsistently across shell completion systems. Shipping `aw` as a first-class alias for **Arashi Workspace** gives users a short supported entrypoint without renaming the product or duplicating the native implementation.

## What Changes

- Ship `aw` beside canonical `arashi` across npm-managed installs and supported direct macOS, Linux, and Windows installations, with both names dispatching to the same package entrypoint or platform binary.
- Preserve `arashi` as the canonical product, help, configuration, environment-variable, release, and documentation vocabulary; `aw` is additive and does not deprecate or replace it.
- Make direct installers fail before mutation rather than overwrite an unrelated pre-existing `aw`, and extend coherent install/update rollback and smoke verification to the complete canonical-plus-alias payload.
- Make Bash, Zsh, and Fish parent-shell integration and generated completion work equivalently through both executable names while retaining one idempotent Arashi-managed startup block.
- Verify human/JSON command parity and npm-wrapper `install`/`update` interception through real `arashi` and `aw` entrypoints.
- Publish concise user and agent-readable guidance defining `aw` as “Arashi Workspace,” including current npm, direct-install, manual Windows payload, completion, and shell-integration behavior.
- Add source, package, installer, native-shell, completion, release-contract, documentation, and published-release acceptance gates before delivery.

## Capabilities

### New Capabilities

- `executable-aliases`: Defines canonical `arashi` identity, supported `aw` distribution and command parity, collision-safe ownership, POSIX direct-install transaction behavior, and release-level verification.

### Modified Capabilities

- `npm-binary-installation`: Exposes both npm executable names through one entrypoint and requires equivalent first-use and explicit-install behavior.
- `windows-powershell-installer`: Extends the verified Windows release/install/update payload, collision preflight, rollback, and Git Bash/PowerShell/Command Prompt acceptance to `aw`.
- `shell-integration`: Generates parent-shell wrappers for both names and upgrades one managed startup block idempotently.
- `shell-completions`: Registers and verifies identical Bash, Zsh, and Fish completion for `arashi` and `aw`.
- `cli-self-update`: Preserves alias availability and wrapper-intercepted update parity across npm-managed and direct-binary updates.
- `docs-landing-and-social-content`: Introduces the alias concisely and keeps Windows install/manual payload guidance complete.
- `docs-agent-readable-exports`: Carries canonical alias and installation guidance into generated Markdown and LLM-oriented exports.
- `arashi-skill-guidance`: Teaches the supported alias concisely in authored and packaged agent guidance while retaining canonical `arashi` entry commands and command discovery.
- `cross-repo-command-contracts`: Adds a source-derived executable-distribution contract and coordinated semantic enforcement without treating `aw` as a Commander subcommand alias.

## Impact

- CLI package and wrappers: `repos/arashi/package.json`, `bin/arashi.js`, platform wrappers, installer/update helpers, shell integration, completion renderers, generated completion artifacts, release/checksum metadata, retained archive packaging, and source/package/native acceptance tests.
- Direct installers: `repos/arashi/scripts/install.sh`, `scripts/install.ps1`, transactional replacement and collision ownership, Windows default-installer acceptance, and direct-update regression coverage.
- Documentation and skills: maintained CLI installation/shell guidance, docs-site onboarding and troubleshooting, generated Markdown/LLM exports, concise authored/extracted skill guidance, and focused semantic checkers registered through stable aggregates.
- Meta contracts: a generated executable-distribution contract or equivalent source-owned artifact plus coordinated validation and deliberate-drift fixtures.
- Release: additive minor release followed by npm-managed and direct-install verification of both executable names on supported platforms.
- No configuration schema, environment variable, command-path, or VS Code command mapping changes are intended. Packaged skills continue to teach canonical `arashi` commands while identifying `aw` as an equivalent installed shorthand, without alias-specific workflow expansion.
