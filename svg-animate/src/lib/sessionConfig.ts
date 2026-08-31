import { useState } from "react";

function readSessionValue<T>(key: string, fallback: T): T {
  try {
    const raw = sessionStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
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
