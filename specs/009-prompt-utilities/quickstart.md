# Quickstart: Prompt Utilities

## Installation

```typescript
import { confirm, select, multiSelect, input } from './lib/prompts';
```

## Examples

### Confirmation
```typescript
const shouldProceed = await confirm('Continue with operation?', true);
if (!shouldProceed) {
  console.log('Aborted');
  return;
}
```

### Single Selection
```typescript
const branch = await select('Select branch:', [
  { value: 'main', name: 'main' },
  { value: 'feature', name: 'feature' }
]);
console.log(`Selected: ${branch}`);
```

### Multiple Selection
```typescript
const repos = await multiSelect('Select repositories:', [
  { value: 'repo1', name: 'Repository 1' },
  { value: 'repo2', name: 'Repository 2' },
  { value: 'repo3', name: 'Repository 3' }
]);
console.log(`Selected ${repos.length} repos`);
```

### Text Input
```typescript
const name = await input('Enter branch name:', 'feature-branch');
console.log(`Branch: ${name}`);
```

## Ctrl+C Handling

All prompts exit cleanly on Ctrl+C with code 2. No special handling required.

## Testing

Mock @inquirer/prompts in tests:
```typescript
import { mock } from 'bun:test';
mock('@inquirer/confirm', () => ({ default: async () => true }));
```
