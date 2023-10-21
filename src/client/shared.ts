import { Dispatch, SetStateAction, useEffect, useState } from "react";

type ValueOrFunction<T> = T | (() => T);

export function createShared<T>(initialValue: ValueOrFunction<T>) {
  const listeners = new Set<(value: T) => void>();
  let currentValue =
    initialValue instanceof Function ? initialValue() : initialValue;

  const notifyListeners = (value: SetStateAction<T>) => {
    listeners.forEach((listener) => {
      const newValue = value instanceof Function ? value(currentValue) : value;
      listener(newValue);
    });
  };

  return (): [T, Dispatch<SetStateAction<T>>] => {
    const [value, setValue] = useState(currentValue);

    useEffect(() => {
      listeners.add(setValue);
      return () => {
        listeners.delete(setValue);
      };
    }, []);

    return [value, notifyListeners];
  };
}
