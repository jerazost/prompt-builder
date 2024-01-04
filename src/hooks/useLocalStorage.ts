import { useState } from "react";

export const useLocalStorage = <T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((val: T) => T)) => void] => {
  // Create state variable to store
  // localStorage value in state
  const [localStorageValue, setLocalStorageValue] = useState<T>(() => {
    try {
      const value = localStorage.getItem(key);
      // If value is already present in
      // localStorage then return it

      // Else set default value in
      // localStorage and then return it
      if (value) {
        return JSON.parse(value) as T;
      } else {
        localStorage.setItem(key, JSON.stringify(defaultValue));
        return defaultValue;
      }
    } catch (error) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
  });

  // this method update our localStorage and our state
  const setLocalStorageStateValue = (valueOrFn: T | ((val: T) => T)): void => {
    let newValue: T;
    if (typeof valueOrFn === "function") {
      const fn = valueOrFn as (val: T) => T;
      newValue = fn(localStorageValue);
    } else {
      newValue = valueOrFn as T;
    }
    localStorage.setItem(key, JSON.stringify(newValue));
    setLocalStorageValue(newValue);
  };
  return [localStorageValue, setLocalStorageStateValue];
};
