import { Injectable } from '@angular/core';

export type BrowserStorageType = 'local' | 'session';

export interface StorageKeyPair<T = unknown> {
  key: string;
  value: T;
}

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly defaultStorageType: BrowserStorageType = 'local';

  setKeyPair<T>(pair: StorageKeyPair<T>, type: BrowserStorageType = 'local'): void {
    this.setItem(pair.key, pair.value, type);
  }

  getKeyPair<T>(key: string, type: BrowserStorageType = 'local'): StorageKeyPair<T> | null {
    const value = this.getItem<T>(key, type);
    return value === null ? null : { key, value };
  }

  setItem<T>(key: string, value: T, type: BrowserStorageType = 'local'): void {
    const storage = this.getStorage(type);
    if (!storage) {
      return;
    }

    try {
      storage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage might be unavailable, full, or blocked by browser settings.
    }
  }

  getItem<T>(key: string, type: BrowserStorageType = 'local'): T | null {
    const storage = this.getStorage(type);
    if (!storage) {
      return null;
    }

    const rawValue = storage.getItem(key);
    if (rawValue === null) {
      return null;
    }

    try {
      return JSON.parse(rawValue) as T;
    } catch {
      return rawValue as unknown as T;
    }
  }

  removeItem(key: string, type: BrowserStorageType = 'local'): void {
    const storage = this.getStorage(type);
    storage?.removeItem(key);
  }

  hasKey(key: string, type: BrowserStorageType = 'local'): boolean {
    const storage = this.getStorage(type);
    return storage ? storage.getItem(key) !== null : false;
  }

  clear(type: BrowserStorageType = 'local'): void {
    const storage = this.getStorage(type);
    storage?.clear();
  }

  keys(type: BrowserStorageType = 'local'): string[] {
    const storage = this.getStorage(type);
    if (!storage) {
      return [];
    }

    return Array.from({ length: storage.length }, (_, index) => storage.key(index) ?? '').filter(
      (key) => key !== '',
    );
  }

  getAngularItem<T>(key: string): T | null {
    return this.getItem<T>(key, this.defaultStorageType);
  }

  setAngularItem<T>(key: string, value: T): void {
    this.setItem(key, value, this.defaultStorageType);
  }

  getBrowserItem<T>(key: string, type: BrowserStorageType = 'local'): T | null {
    return this.getItem<T>(key, type);
  }

  setBrowserItem<T>(key: string, value: T, type: BrowserStorageType = 'local'): void {
    this.setItem(key, value, type);
  }

  private getStorage(type: BrowserStorageType): Storage | null {
    if (typeof window === 'undefined') {
      return null;
    }

    return type === 'session' ? window.sessionStorage : window.localStorage;
  }
}
