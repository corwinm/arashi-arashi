# Research: Prompt Utilities

**Feature**: 007-prompt-utilities  
**Date**: 2026-02-04  
**Status**: Complete

## Technology Decisions

### Decision 1: Use @inquirer/prompts
**Rationale**: Modern, modular version of inquirer with TypeScript support, tree-shakeable, and maintained.
**Selected**: @inquirer/prompts v6+

**API modules**:
- `@inquirer/confirm` - Yes/no prompts
- `@inquirer/select` - Single choice selection
- `@inquirer/checkbox` - Multiple choice selection
- `@inquirer/input` - Text input

### Decision 2: Graceful Ctrl+C Handling
**Rationale**: @inquirer/prompts throws on Ctrl+C - catch and exit with code 2 (industry standard).
**Implementation**: Wrap all prompt calls in try/catch, detect abort signal, call `process.exit(2)`.

### Decision 3: Future --yes Flag Support
**Rationale**: Prep for non-interactive mode by designing functions to accept default values.
**Implementation**: All functions accept optional default/fallback parameters.

## API Design

```typescript
export async function confirm(message: string, defaultValue?: boolean): Promise<boolean>
export async function select<T>(message: string, choices: Choice<T>[]): Promise<T>
export async function multiSelect<T>(message: string, choices: Choice<T>[]): Promise<T[]>
export async function input(message: string, defaultValue?: string): Promise<string>

type Choice<T> = { value: T; name: string; description?: string }
```

## Best Practices

- Always provide default values for confirm prompts
- Validate empty choice lists before calling select
- Test with mocked @inquirer/prompts using Bun's mock system
- Ensure terminal restored on exit (handled by inquirer)
