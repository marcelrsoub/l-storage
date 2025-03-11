import { z } from 'zod';

export type StorageSchema = Record<string, z.ZodType>;

export type InferStorageTypes<T extends StorageSchema> = {
  [K in keyof T]: z.infer<T[K]>;
};

export interface StorageOptions {
  /** Prefix for all storage keys */
  prefix?: string;
  /** Whether to throw errors on validation failures */
  strict?: boolean;
}

export interface TypedStorageError extends Error {
  key: string;
  value: unknown;
  type: 'validation' | 'parsing' | 'storage';
}

export interface TypedStorage<T extends StorageSchema> {
  get<K extends keyof T>(key: K): z.infer<T[K]>;
  set<K extends keyof T>(key: K, value: z.infer<T[K]>): void;
  remove(key: keyof T): void;
  clear(): void;
  getRegisteredKeys(): Array<keyof T>;
  has(key: keyof T): boolean;
}