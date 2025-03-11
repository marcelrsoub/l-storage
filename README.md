# Typed localStorage

A type-safe wrapper around the browser's localStorage API using Zod for runtime validation and TypeScript type inference.

## Features

- Type-safe get/set operations using Zod schemas
- Complete access to all native localStorage methods
- Automatic key tracking and management
- TypeScript type inference for stored values
- Runtime validation using Zod
- Configurable key prefixing
- Strict/lenient validation modes

## Installation

```bash
npm install typed-local-storage zod
```

```bash
pnpm install typed-local-storage zod
```

```bash
yarn add typed-local-storage zod
```

```bash
bun add typed-local-storage zod
```

## Usage

```typescript
import { createTypedStorage } from 'typed-local-storage';
import { z } from 'zod';

// Define your storage schema
const storage = createTypedStorage({
  user: z.object({
    name: z.string(),
    age: z.number()
  }),
  theme: z.enum(['light', 'dark']),
  settings: z.record(z.any())
}, {
  prefix: 'app', // optional prefix for all keys
  strict: true   // throw on validation errors
});

// Type-safe operations
storage.set('user', { name: 'John', age: 30 }); // ✅ Valid
storage.set('user', { name: 'John' }); // ❌ TypeScript error
storage.set('theme', 'light'); // ✅ Valid
storage.set('theme', 'blue'); // ❌ TypeScript error

// Get values with correct types
const user = storage.get('user'); // type: { name: string, age: number } | null
const theme = storage.get('theme'); // type: 'light' | 'dark' | null

// Manage keys
storage.remove('user');
storage.clear();
const keys = storage.getRegisteredKeys();
const hasUser = storage.has('user');
```

## API Reference

### `createTypedStorage(schemas, options?)`

Creates a new typed storage instance.

#### Parameters

- `schemas`: Record of Zod schemas defining the structure of stored data
- `options`: (optional) Configuration options
  - `prefix`: String prefix for all storage keys
  - `strict`: Whether to throw on validation errors (default: true)

#### Methods

- `get(key)`: Get a value by key (returns null if not found)
- `set(key, value)`: Set a value for a key
- `remove(key)`: Remove a value by key
- `clear()`: Clear all registered keys
- `getRegisteredKeys()`: Get array of all registered keys
- `has(key)`: Check if a key exists

## Error Handling

In strict mode (default), the library throws typed errors for:
- Invalid data validation
- JSON parsing failures
- Storage quota exceeded

Each error includes:
- `key`: The storage key that caused the error
- `value`: The value that failed
- `type`: Error type ('validation' | 'parsing' | 'storage')

## License

MIT