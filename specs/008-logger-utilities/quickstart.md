# Quickstart: Logger Utilities

## Installation

```typescript
import { info, success, warn, error, spinner, table, section } from './lib/logger';
```

## Examples

### Basic Messages
```typescript
info('Starting process...');
success('Operation completed!');
warn('Configuration file missing');
error('Failed to connect to database');
```

### Progress Spinners
```typescript
const s = spinner('Fetching repositories...');
s.start();
await fetchRepos();
s.succeed('Repositories fetched!');
```

### Tables
```typescript
const data = [
  { name: 'Alice', role: 'Admin', status: 'Active' },
  { name: 'Bob', role: 'User', status: 'Inactive' }
];
table(data);
```

### Section Headers
```typescript
section('Configuration');
info('Loading config from .arashi/config.json');

section('Repositories');
table(repos);
```

## NO_COLOR Support

Set environment variable to disable colors:
```bash
NO_COLOR=1 arashi create feature-branch
```
