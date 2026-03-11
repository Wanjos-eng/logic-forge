import { useState, useCallback } from 'react';

const SIZES = [14, 16, 20, 24, 28, 32, 40, 48, 56, 64] as const;
const DEFAULT_INDEX = 1; // 16px

/**
 * Hook para controlar o tamanho da fonte da fórmula.
 */
export function useFontSize() {
  const [sizeIndex, setSizeIndex] = useState(DEFAULT_INDEX);

  const fontSize = SIZES[sizeIndex];

  const increase = useCallback(() => {
    setSizeIndex((i) => Math.min(i + 1, SIZES.length - 1));
  }, []);

  const decrease = useCallback(() => {
    setSizeIndex((i) => Math.max(i - 1, 0));
  }, []);

  const canIncrease = sizeIndex < SIZES.length - 1;
  const canDecrease = sizeIndex > 0;

  return { fontSize, increase, decrease, canIncrease, canDecrease };
}
