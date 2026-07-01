import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Load from localstorage on mount
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setTimeout(() => {
          setStoredValue(JSON.parse(item));
        }, 0);
      }
    } catch (error) {
      console.error("useLocalStorage read error:", error);
    }
  }, [key]);

  // Setter function
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error("useLocalStorage write error:", error);
    }
  };

  return [storedValue, setValue] as const;
}
