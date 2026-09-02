import { useState } from "react";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readSessionValue<T>(key: string, fallback: T): T {
  try {
    const raw = sessionStorage.getItem(key);
    if (raw === null) return fallback;
    const stored = JSON.parse(raw) as T;
    // Shallow-merge over the default rather than trusting the stored value
    // as-is: a widget's config shape can gain fields across versions (e.g.
    // adding a new slider), and a session with an older stored value would
    // otherwise come back missing that field entirely.
    return isPlainObject(fallback) && isPlainObject(stored)
      ? ({ ...fallback, ...stored } as T)
      : stored;
  } catch {
    return fallback;
  }
}

function writeSessionValue<T>(key: string, value: T) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private browsing, storage disabled, or quota exceeded — ignore.
  }
}

/**
 * Same interface as useState, but the value is namespaced under `key` in
 * sessionStorage: it survives switching away from and back to a widget
 * (component unmount/remount), and a page refresh, but resets when the tab
 * closes.
 */
export function useSessionConfig<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => readSessionValue(key, defaultValue));

  const update = (next: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const resolved =
        typeof next === "function" ? (next as (prev: T) => T)(prev) : next;
      writeSessionValue(key, resolved);
      return resolved;
    });
  };

  return [value, update] as const;
}
