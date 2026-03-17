import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { SemanticAnalysis } from '@/domain/semanticAnalysis';
import type { TruthTableData } from '@/domain/types';

interface SemanticAnalysisState {
  data?: SemanticAnalysis;
  loading: boolean;
  error?: string;
}

/**
 * Hook para realizar análise semântica baseada em uma tabela-verdade.
 * Extrai os resultados booleanos de cada linha e envia para o backend.
 */
export function useSemanticAnalysis(truthTable?: TruthTableData) {
  const [state, setState] = useState<SemanticAnalysisState>({ loading: false });

  useEffect(() => {
    let cancelled = false;

    // Verifica se a tabela-verdade está disponível
    if (!truthTable?.table?.length) {
      setState({ loading: false, data: undefined, error: undefined });
      return;
    }

    const tableData = truthTable; // Type guard

    async function run() {
      setState((prev) => ({ ...prev, loading: true, error: undefined }));

      try {
        // Extrai apenas os resultados (booleanos) de cada linha da tabela
        const results = tableData.table.map((row) => row.result);

        const payload = await invoke<string>('analyze_semantic_command', {
          results,
        });

        if (cancelled) return;

        const parsed: SemanticAnalysis = JSON.parse(payload);
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
  }, [truthTable]);

  return state;
}

