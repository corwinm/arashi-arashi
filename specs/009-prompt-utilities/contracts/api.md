# API Contract: Prompt Utilities

## Functions

### `confirm(message: string, defaultValue?: boolean): Promise<boolean>`
Display yes/no prompt. Returns user's choice.

**Ctrl+C**: Exits process with code 2.

Example:
```typescript
const shouldDelete = await confirm('Delete worktree?', false);
if (shouldDelete) { /* delete */ }
```

### `select<T>(message: string, choices: Choice<T>[]): Promise<T>`
Display single-selection list. Returns selected value.

**Parameters**:
- `choices`: Array of `{ value: T, name: string, description?: string }`

**Throws**: Error if choices array is empty.

**Ctrl+C**: Exits process with code 2.

Example:
```typescript
const branch = await select('Select branch:', [
  { value: 'main', name: 'main', description: 'Main branch' },
  { value: 'dev', name: 'dev', description: 'Development branch' }
]);
```

### `multiSelect<T>(message: string, choices: Choice<T>[]): Promise<T[]>`
Display multi-selection list (checkboxes). Returns array of selected values.

**Ctrl+C**: Exits process with code 2.

### `input(message: string, defaultValue?: string): Promise<string>`
Display text input prompt. Returns entered string.

**Ctrl+C**: Exits process with code 2.

## Types

```typescript
type Choice<T> = {
  value: T;
  name: string;
  description?: string;
}
```
