import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { Formula, TruthTableData } from '@/domain/types';

interface TruthTableState {
  data?: TruthTableData;
  loading: boolean;
  error?: string;
}

/**
 * Hook para gerar a tabela-verdade no backend e trazer JSON pronto para o frontend.
 */
export function useTruthTable(ast?: Formula, includeSubformulas = false) {
  const [state, setState] = useState<TruthTableState>({ loading: false });

  useEffect(() => {
    let cancelled = false;

    if (!ast) {
      setState({ loading: false, data: undefined, error: undefined });
      return;
    }

    async function run() {
      setState((prev) => ({ ...prev, loading: true, error: undefined }));

      try {
        const astJson = JSON.stringify(ast);
        const payload = await invoke<string>('generate_truth_table_command', {
          astJson,
          includeSubformulas,
          maxRows: 4096,
        });

        if (cancelled) return;

        const parsed: TruthTableData = JSON.parse(payload);
        setState({ loading: false, data: parsed, error: undefined });
      } catch (err: unknown) {
        if (cancelled) return;
        setState({ loading: false, data: undefined, error: String(err) });
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [ast, includeSubformulas]);

  return state;
}
