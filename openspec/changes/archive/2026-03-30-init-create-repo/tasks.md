## 1. Implement init bootstrap flow in `repos/arashi`

- [x] 1.1 Refactor `src/commands/init.ts` so the main initialization path can run against a resolved repository root instead of assuming `process.cwd()` is already a git repository
- [x] 1.2 Add interactive non-repository bootstrap prompts that offer repository creation and validate only `.` or a simple child directory name
- [x] 1.3 Create the target repository with `git init`, then continue the standard Arashi init flow with correct success, error, dry-run, and rollback behavior for the resolved root

## 2. Add CLI coverage for bootstrap behavior

- [x] 2.1 Add integration tests for declining bootstrap, bootstrapping the current directory with `.`, bootstrapping a child directory, and rejecting unsupported target paths
- [x] 2.2 Update existing non-repository init expectations and confirm existing in-repository init tests still cover the unchanged success path

## 3. Update onboarding docs in `repos/arashi-docs`

- [x] 3.1 Update `docs/getting-started/index.md` to explain where to run `arashi init` for existing-repository and new-repository workflows
- [x] 3.2 Update `docs/commands/init.md` with the bootstrap prompt behavior and examples for `.` and a child directory name

## 4. Update Arashi skill guidance in `repos/arashi-skills`

- [x] 4.1 Update the Arashi tutorial, workflow, and command reference content so the init bootstrap workflow matches the new CLI behavior
- [x] 4.2 Update troubleshooting and cheatsheet guidance so non-repository `arashi init` usage points users to the current-directory and child-directory bootstrap options

## 5. Validate touched repos

- [x] 5.1 Run `bun run lint`, `bun test`, and `bun run build` in `repos/arashi` after the CLI changes are complete
- [x] 5.2 Run any applicable docs and skills validation checks, then verify the documented bootstrap examples and prompt wording match the implemented CLI flow
