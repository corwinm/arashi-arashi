## 1. Config and defaults resolution

- [x] 1.1 Extend workspace config types and parsing to support command-scoped defaults for `create` (auto-switch + launch) and `switch` (launch).
- [x] 1.2 Implement a shared defaults resolution helper with precedence: explicit CLI flag > opt-out flag > config default > built-in default.
- [x] 1.3 Add validation/error handling for invalid default combinations so missing or malformed fields preserve backward-compatible behavior.

## 2. Create command behavior

- [x] 2.1 Add/create CLI option wiring for one-off opt-out flags that disable configured create defaults for switch and launch behavior.
- [x] 2.2 Update `create` execution flow to apply resolved defaults for post-create switch and launch actions while honoring explicit CLI overrides.
- [x] 2.3 Ensure `create` reuses existing launch execution paths so default-triggered launches behave the same as explicit launch options.

## 3. Switch command behavior

- [x] 3.1 Add/surface CLI launch opt-out handling for `switch` so configured default launch can be skipped per invocation.
- [x] 3.2 Update `switch` option resolution to merge CLI launch options and config defaults using the shared precedence helper.
- [x] 3.3 Ensure `switch` default launch uses the existing launch execution pathway and preserves current behavior when defaults are absent.

## 4. Verification and documentation

- [x] 4.1 Add unit tests for default resolution precedence and opt-out semantics across create/switch option combinations.
- [x] 4.2 Add integration tests covering configured defaults, explicit CLI overrides, per-invocation opt-outs, and no-default backward compatibility.
- [x] 4.3 Update command help and user-facing docs with config examples, precedence rules, and opt-out usage for `create` and `switch`.
