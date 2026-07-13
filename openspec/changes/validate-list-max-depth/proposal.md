## Why

`arashi list --max-depth` currently accepts malformed values such as `abc`, partial numbers, fractions, and negatives. A non-numeric value becomes `NaN`, which disables the repository traversal depth guard and can cause a much broader filesystem scan than the user requested.

## What Changes

- Require `--max-depth` to be a non-negative safe integer.
- Reject malformed values before repository discovery begins with a clear CLI error.
- Preserve the existing default depth and valid zero-depth behavior.
- Add focused regression coverage for accepted and rejected values.

## Capabilities

### New Capabilities

- `cli-numeric-option-validation`: Defines safe validation behavior for numeric CLI options that bound filesystem work.

### Modified Capabilities

None.

## Impact

The change affects the Arashi CLI's `list` command option parsing and focused command tests. It does not change configuration, dependencies, repository discovery behavior for valid inputs, or companion documentation workflows.
