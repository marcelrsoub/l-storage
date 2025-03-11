import { z } from 'zod';
import type { StorageSchema, StorageOptions, TypedStorageError, TypedStorage } from './types';

export type { TypedStorage };

export class TypedStorageImpl<T extends StorageSchema> implements TypedStorage<T> {
  private schemas: T;
  private prefix: string;
  private strict: boolean;
  private keys: Set<string>;

  constructor(schemas: T, options: StorageOptions = {}) {
    this.schemas = schemas;
    this.prefix = options.prefix ?? '';
    this.strict = options.strict ?? true;
    this.keys = new Set(Object.keys(schemas));
  }

  private getFullKey(key: keyof T): string {
    return this.prefix ? `${this.prefix}:${String(key)}` : String(key);
  }

  private createError(
    message: string,
    key: string,
    value: unknown,
    type: TypedStorageError['type']
  ): TypedStorageError {
    const error = new Error(message) as TypedStorageError;
    error.key = key;
    error.value = value;
    error.type = type;
    return error;
  }

  get<K extends keyof T>(key: K): z.infer<T[K]> | null {
    const fullKey = this.getFullKey(key);
    const raw = localStorage.getItem(fullKey);

    if (raw === null) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw);
      const schema = this.schemas[key];
      const result = schema.safeParse(parsed);

      if (!result.success) {
        if (this.strict) {
          throw this.createError(
            `Validation failed for key "${String(key)}": ${result.error.message}`,
            String(key),
            parsed,
            'validation'
          );
        }
        return null;
      }

      return result.data;
    } catch (error) {
      if (this.strict) {
        throw this.createError(
          `Failed to parse stored value for key "${String(key)}"`,
          String(key),
          raw,
          'parsing'
        );
      }
      return null;
    }
  }

  set<K extends keyof T>(key: K, value: z.infer<T[K]>): void {
    const fullKey = this.getFullKey(key);
    const schema = this.schemas[key];
    
    const result = schema.safeParse(value);
    if (!result.success) {
      throw this.createError(
        `Invalid value for key "${String(key)}": ${result.error.message}`,
        String(key),
        value,
        'validation'
      );
    }

    try {
      localStorage.setItem(fullKey, JSON.stringify(value));
    } catch (error) {
      throw this.createError(
        `Failed to store value for key "${String(key)}"`,
        String(key),
        value,
        'storage'
      );
    }
  }

  remove(key: keyof T): void {
    const fullKey = this.getFullKey(key);
    localStorage.removeItem(fullKey);
  }

  clear(): void {
    for (const key of this.keys) {
      this.remove(key);
    }
  }

  getRegisteredKeys(): Array<keyof T> {
    return Array.from(this.keys);
  }

  has(key: keyof T): boolean {
    const fullKey = this.getFullKey(key);
    return localStorage.getItem(fullKey) !== null;
  }
}