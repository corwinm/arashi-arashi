## 1. Installer Refactor

- [x] 1.1 In `repos/arashi/`, extract binary install logic from `scripts/postinstall.js` into a reusable published runtime module with testable functions for platform asset selection, download, chmod, verification, cleanup, and already-installed detection.
- [x] 1.2 Update `bin/arashi.js` to use the shared installer module for first-use fallback instead of spawning `scripts/postinstall.js`.
- [x] 1.3 Update first-use fallback output and failure handling so missing binaries are installed before command delegation, partial downloads are removed, and failures exit non-zero with manual-install guidance.

## 2. Explicit Install Command

- [x] 2.1 Add explicit `arashi install` handling in the npm JavaScript entrypoint so it installs the matching platform binary and exits successfully without requiring the native binary to already exist.
- [x] 2.2 Add a visible compiled CLI `install` command/help entry in `repos/arashi/src/commands/` and register it in `src/index.ts` with clear messaging for direct binary/curl contexts.
- [x] 2.3 Ensure `arashi install` is idempotent when the matching binary already exists and reports unsupported platforms clearly.

## 3. Package Metadata

- [x] 3.1 Remove `scripts.postinstall` from `repos/arashi/package.json`.
- [x] 3.2 Remove the old postinstall script from published package `files`, while keeping the new runtime installer module included.
- [x] 3.3 Verify the npm `bin` entrypoint remains `./bin/arashi.js` and all required wrapper files remain published.

## 4. Tests

- [x] 4.1 Add unit tests for platform-to-asset resolution, version-specific release URL construction, already-installed detection, and unsupported platform errors.
- [x] 4.2 Add tests for installer download success, verification failure cleanup, and no-op behavior when a matching binary already exists using mocked filesystem/network/process boundaries.
- [x] 4.3 Add entrypoint-level tests for first-use fallback and explicit `arashi install` behavior when the binary is missing.
- [x] 4.4 Add package metadata coverage that fails if `postinstall` lifecycle behavior is reintroduced.

## 5. Documentation

- [x] 5.1 Update `repos/arashi/README.md` and `repos/arashi/docs/INSTALLATION.md` to describe script-free npm installs, first-use binary installation, and `arashi install`.
- [x] 5.2 Review `repos/arashi-docs/` for npm install or postinstall references and update relevant user-facing pages.
- [x] 5.3 Review `repos/arashi-skills/` for install workflow guidance and update only if it mentions npm postinstall or binary installation recovery.

## 6. Validation

- [x] 6.1 Run `bun run lint` in `repos/arashi/`.
- [x] 6.2 Run `bun run test` in `repos/arashi/`.
- [x] 6.3 Run `bun run build` in `repos/arashi/`.
- [x] 6.4 If docs changed in `repos/arashi-docs/`, run `bun run validate` there.
- [x] 6.5 Run `openspec status --change remove-arashi-postinstall-scripts` and confirm the change is apply-ready.
