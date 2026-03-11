import { useState, useCallback, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { Formula, ValidationResult } from '@/domain/types';

/**
 * Hook que encapsula a lógica de validação de fórmulas via Tauri.
 * Debounce de 300ms para não sobrecarregar o backend.
 */
export function useValidation(input: string) {
  const [validation, setValidation] = useState<ValidationResult>({
    is_valid: false,
    errors: [],
  });

  const validate = useCallback(async (text: string) => {
    if (!text.trim()) {
      setValidation({ is_valid: false, errors: [] });
      return;
    }
    try {
      const astJson = await invoke<string>('validate_formula', { input: text });
      const ast: Formula = JSON.parse(astJson);
      setValidation({ is_valid: true, ast, errors: [] });
    } catch (err: unknown) {
      const errors = Array.isArray(err) ? (err as string[]) : [String(err)];
      setValidation({ is_valid: false, errors });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => validate(input), 300);
    return () => clearTimeout(timer);
  }, [input, validate]);

  return validation;
}
