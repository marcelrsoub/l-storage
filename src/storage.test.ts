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

describe('Default Values', () => {
  const schemasWithDefaults = {
    theme: z.enum(['light', 'dark']).default('light'),
    user: z.object({
      name: z.string(),
      age: z.number()
    }).default({ name: 'Guest', age: 0 }),
    counter: z.number().default(1),
    // Add a key without a default
    preferences: z.object({
      notifications: z.boolean()
    })
  };
  
  it('should return default values for non-existent keys', () => {
    const storage = createTypedStorage(schemasWithDefaults);
    
    expect(storage.get('theme')).toBe('light');
    expect(storage.get('user')).toEqual({ name: 'Guest', age: 0 });
    expect(storage.get('counter')).toBe(1);
  });
  
  it('should return null for non-existent keys without defaults', () => {
    const storage = createTypedStorage(schemasWithDefaults);
    
    expect(storage.get('preferences')).toBeNull();
  });
  
  it('should return stored values instead of defaults when keys exist', () => {
    const storage = createTypedStorage(schemasWithDefaults);
    
    storage.set('theme', 'dark');
    storage.set('user', { name: 'John', age: 30 });
    storage.set('counter', 5);
    
    expect(storage.get('theme')).toBe('dark');
    expect(storage.get('user')).toEqual({ name: 'John', age: 30 });
    expect(storage.get('counter')).toBe(5);
  });
  
  it('should return default values after removing keys', () => {
    const storage = createTypedStorage(schemasWithDefaults);

    storage.remove('theme');
    storage.set('theme', 'dark');
    storage.remove('theme');
    
    expect(storage.get('theme')).toBe('light');
  });
  
  it('should return default values after clearing storage', () => {
    const storage = createTypedStorage(schemasWithDefaults);
    
    storage.set('theme', 'dark');
    storage.set('user', { name: 'John', age: 30 });
    
    storage.clear();
    
    expect(storage.get('theme')).toBe('light');
    expect(storage.get('user')).toEqual({ name: 'Guest', age: 0 });
  });
});