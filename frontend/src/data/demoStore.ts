import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

export function useDemoCollection<T>(
  key: string,
  initial: T[],
): [T[], Dispatch<SetStateAction<T[]>>] {
  const [items, setItems] = useState<T[]>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? (JSON.parse(saved) as T[]) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch {
      /* используем данные в памяти */
    }
  }, [items, key]);
  return [items, setItems];
}
