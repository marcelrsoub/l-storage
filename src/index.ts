import type { TypedStorage } from './storage';
import { StorageSchema, StorageOptions, InferStorageTypes, TypedStorageError } from './types';
import { TypedStorageImpl } from './storage';

export function createTypedStorage<T extends StorageSchema>(
  schemas: T,
  options?: StorageOptions
): TypedStorage<T> {
  return new TypedStorageImpl(schemas, options);
}

export type { StorageSchema, StorageOptions, InferStorageTypes, TypedStorageError };