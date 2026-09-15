import { useRef } from 'react';

/**
 * Returns a function with a stable identity that always calls the latest `fn`.
 * Lets us pass callbacks into memoized components (like the 3D scene) without
 * re-rendering them every time the callback's dependencies change.
 */
export function useStableCallback<T extends (...args: any[]) => any>(fn: T): T {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const stableRef = useRef<T | null>(null);
  if (!stableRef.current) {
    stableRef.current = ((...args: Parameters<T>) => fnRef.current(...args)) as T;
  }
  return stableRef.current;
}
