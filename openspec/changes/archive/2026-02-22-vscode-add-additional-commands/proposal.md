## Why

The VSCode extension proof of concept does not yet expose key CLI workflows users need in day-to-day use. Expanding command coverage and improving extension documentation/branding now makes the extension more useful and consistent with the docs experience.

## What Changes

- Add additional VSCode extension commands that were not included in the initial proof of concept, including pull and sync workflows.
- Update the extension README to direct users to the docs site for full CLI installation guidance.
- Update the extension icon to use the same icon asset used on the docs site.

## Capabilities

### New Capabilities
- `vscode-extension-additional-commands`: Adds missing command entries and execution paths in the extension for workflows such as pull and sync.
- `vscode-extension-install-guidance-linking`: Ensures extension documentation points users to the docs site for authoritative CLI installation instructions.
- `vscode-extension-icon-alignment`: Aligns extension branding by using the docs-site icon in VSCode extension assets/manifest.

### Modified Capabilities
- None.

## Impact

- Affected code: VSCode extension command registration/execution code, extension README content, and extension icon/manifest assets.
- User-facing impact: More complete command access from VSCode, clearer installation guidance, and consistent branding.
- External systems: VSCode command palette surfaces and Marketplace-visible extension metadata/assets.
