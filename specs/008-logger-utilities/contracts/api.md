# API Contract: Logger Utilities

## Functions

### `info(message: string): void`
Print informational message in default color.

### `success(message: string): void`
Print success message in green with ✓ symbol.

### `warn(message: string): void`
Print warning message in yellow with ⚠ symbol.

### `error(message: string): void`
Print error message in red with ✗ symbol.

### `spinner(text: string): Ora`
Create and return ora spinner instance. Caller controls start/stop.

Example:
```typescript
const s = spinner('Loading...');
s.start();
// do work
s.succeed('Done!');
```

### `table(data: Array<Record<string, string>>): void`
Format and print tabular data with auto-sized columns.

### `section(title: string): void`
Print section header with visual emphasis (bold/underline).

## NO_COLOR Behavior

All functions respect `process.env.NO_COLOR`:
- Colors stripped
- Symbols replaced: ✓→[OK], ⚠→[WARN], ✗→[ERR]
- Spinners use dots instead of animation
