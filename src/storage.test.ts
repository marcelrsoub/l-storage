import { describe, it, expect, beforeEach } from 'vitest';
import { z } from 'zod';
import { createTypedStorage } from './index';

describe('TypedStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const schemas = {
    user: z.object({
      name: z.string(),
      age: z.number()
    }),
    theme: z.enum(['light', 'dark']),
    settings: z.record(z.any())
  };

  it('should store and retrieve valid data', () => {
    const storage = createTypedStorage(schemas);
    const user = { name: 'John', age: 30 };
    
    storage.set('user', user);
    expect(storage.get('user')).toEqual(user);
  });

  it('should handle null for non-existent keys', () => {
    const storage = createTypedStorage(schemas);
    expect(storage.get('user')).toBeNull();
  });

  it('should throw on invalid data in strict mode', () => {
    const storage = createTypedStorage(schemas);
    expect(() => {
      storage.set('user', { name: 'John' } as any);
    }).toThrow();
  });

  it('should handle prefixed keys', () => {
    const storage = createTypedStorage(schemas, { prefix: 'app' });
    const theme = 'dark';
    
    storage.set('theme', theme);
    expect(localStorage.getItem('app:theme')).toBe(JSON.stringify(theme));
    expect(storage.get('theme')).toBe(theme);
  });

  it('should track registered keys', () => {
    const storage = createTypedStorage(schemas);
    const keys = storage.getRegisteredKeys();
    
    expect(keys).toContain('user');
    expect(keys).toContain('theme');
    expect(keys).toContain('settings');
  });

  it('should clear all registered keys', () => {
    const storage = createTypedStorage(schemas);
    storage.set('user', { name: 'John', age: 30 });
    storage.set('theme', 'light');
    
    storage.clear();
    expect(storage.get('user')).toBeNull();
    expect(storage.get('theme')).toBeNull();
  });

  it('should check key existence', () => {
    const storage = createTypedStorage(schemas);
    storage.set('theme', 'light');
    
    expect(storage.has('theme')).toBe(true);
    expect(storage.has('user')).toBe(false);
  });
});