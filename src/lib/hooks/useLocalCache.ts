import { SetStateAction, useCallback, useEffect, useState } from "react";

type AsyncStorageLike = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

const fallbackMemoryCache = new Map<string, string>();
let warnedMissingAsyncStorage = false;

function getAsyncStorage(): AsyncStorageLike | null {
  try {
    const candidate = require("@react-native-async-storage/async-storage");
    const storage = (candidate?.default ?? candidate) as AsyncStorageLike | undefined;
    if (
      storage &&
      typeof storage.getItem === "function" &&
      typeof storage.setItem === "function" &&
      typeof storage.removeItem === "function"
    ) {
      return storage;
    }
    return null;
  } catch {
    if (!warnedMissingAsyncStorage) {
      warnedMissingAsyncStorage = true;
      console.warn(
        "[useLocalCache] AsyncStorage module not installed. Falling back to memory-only cache.",
      );
    }
    return null;
  }
}

async function getRawCacheValue(key: string): Promise<string | null> {
  const asyncStorage = getAsyncStorage();
  if (asyncStorage) {
    return asyncStorage.getItem(key);
  }
  return fallbackMemoryCache.get(key) ?? null;
}

async function setRawCacheValue(key: string, value: string): Promise<void> {
  const asyncStorage = getAsyncStorage();
  if (asyncStorage) {
    await asyncStorage.setItem(key, value);
    return;
  }
  fallbackMemoryCache.set(key, value);
}

async function removeRawCacheValue(key: string): Promise<void> {
  const asyncStorage = getAsyncStorage();
  if (asyncStorage) {
    await asyncStorage.removeItem(key);
    return;
  }
  fallbackMemoryCache.delete(key);
}

export function useLocalCache<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;

    const loadCachedValue = async () => {
      try {
        const raw = await getRawCacheValue(key);
        if (!active || raw === null) return;
        const parsed = JSON.parse(raw) as T;
        setValue(parsed);
      } catch {
        // Keep initial value when cache is missing or malformed.
      } finally {
        if (active) {
          setHydrated(true);
        }
      }
    };

    void loadCachedValue();
    return () => {
      active = false;
    };
  }, [key]);

  const setCachedValue = useCallback(
    (nextValue: SetStateAction<T>) => {
      setValue((previousValue) => {
        const resolvedValue =
          typeof nextValue === "function"
            ? (nextValue as (prev: T) => T)(previousValue)
            : nextValue;
        void setRawCacheValue(key, JSON.stringify(resolvedValue));
        return resolvedValue;
      });
    },
    [key],
  );

  const clear = useCallback(() => {
    setValue(initialValue);
    void removeRawCacheValue(key);
  }, [initialValue, key]);

  return {
    value,
    setValue: setCachedValue,
    hydrated,
    clear,
  };
}
