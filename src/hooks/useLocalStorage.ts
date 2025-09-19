import { useEffect, useMemo, useState } from 'react';

type Serializer<T> = {
  parse: (value: string) => T;
  stringify: (value: T) => string;
};

const createDefaultSerializer = <T,>(reviver?: (this: unknown, key: string, value: unknown) => unknown): Serializer<T> => ({
  parse: (value: string) => JSON.parse(value, reviver ?? undefined) as T,
  stringify: (value: T) => JSON.stringify(value)
});

export function useLocalStorage<T>(key: string, initialValue: T, serializer?: Serializer<T>) {
  const stableSerializer = useMemo(() => serializer ?? createDefaultSerializer<T>(), [serializer]);
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? stableSerializer.parse(item) : initialValue;
    } catch (error) {
      console.warn('Failed to parse local storage value', error);
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(key, stableSerializer.stringify(storedValue));
    } catch (error) {
      console.warn('Failed to write to local storage', error);
    }
  }, [key, stableSerializer, storedValue]);

  return [storedValue, setStoredValue] as const;
}
