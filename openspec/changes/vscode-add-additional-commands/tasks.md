## 1. Add extension command support

- [x] 1.1 Add VSCode command contributions for Arashi pull and sync in extension metadata
- [x] 1.2 Register pull and sync command handlers using the existing extension command registration pattern
- [x] 1.3 Wire pull and sync handlers to invoke the corresponding Arashi CLI commands through the existing execution path
- [x] 1.4 Add/verify user-visible error messaging when pull or sync CLI execution fails

## 2. Update extension README install guidance

- [x] 2.1 Identify the canonical docs-site URL for Arashi CLI installation instructions
- [x] 2.2 Update extension README install section to link to the docs-site install guidance
- [x] 2.3 Remove duplicated platform-specific install steps from extension README while preserving concise onboarding context

## 3. Align extension icon branding

- [x] 3.1 Copy or reference the docs-site-aligned icon asset for the VSCode extension
- [x] 3.2 Update extension manifest/icon metadata to point at the aligned icon asset path
- [x] 3.3 Verify icon file format and dimensions satisfy VSCode extension packaging requirements

## 4. Validate and prepare release

- [x] 4.1 Verify command palette shows pull and sync and both execute successfully in a local extension run
- [x] 4.2 Verify README renders correct docs-site installation link in extension repository/marketplace context
- [x] 4.3 Run extension packaging/build checks and confirm no icon or metadata validation errors
