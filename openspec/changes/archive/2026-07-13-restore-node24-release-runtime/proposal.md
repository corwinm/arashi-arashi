## Why

Arashi's release workflow remains pinned to Node 22 because `@semantic-release/github` 12.0.8 failed to upload release assets under Node 24, even though the upstream defect has now been fixed in version 12.0.9. Keeping the workaround indefinitely leaves the release job on an older runtime and preserves a known-broken dependency resolution in the lockfile.

## What Changes

- Require the Arashi release toolchain to resolve `@semantic-release/github` 12.0.9 or later, which contains the Node 24 asset-upload fix.
- Restore the `corwinm/arashi` semantic-release job to Node 24 and remove the obsolete Node 22 workaround comment.
- Validate the locked release dependency, workflow configuration, normal repository quality gates, semantic-release dry-run/build path, and the production asset-upload path at the next release.
- Keep Node 26 adoption out of scope until semantic-release supports that non-LTS runtime and its separate compatibility issue is resolved.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `github-actions-node-runtime-maintenance`: Extend project-runtime maintenance requirements to cover temporary release-runtime compatibility pins, minimum fixed release-plugin versions, and removal of workarounds after upstream validation.

## Impact

- `corwinm/arashi` dependency manifest/lockfile and `.github/workflows/release.yml`.
- The semantic-release GitHub asset-upload path for wrappers, binaries, and checksums.
- No CLI behavior, public API, documentation-site content, skill guidance, or other child repository is expected to change.
- Originating issue: https://github.com/corwinm/arashi-arashi/issues/168
- Upstream resolution: https://github.com/semantic-release/github/issues/1224 and https://github.com/semantic-release/github/pull/1260
