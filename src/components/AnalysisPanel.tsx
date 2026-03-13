import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  CheckCircle2, AlertCircle, Calculator, ListTree, GitBranch,
  AlertTriangle, MapPin, Lightbulb, Table as TableIcon,
} from 'lucide-react';
import type { Formula } from '@/domain/types';
import { calculateLength, formatFormula, getSubformulas } from '@/domain/formula';
import { parseErrors, type ParseError } from '@/domain/errors';
import { useTruthTable } from '@/hooks/useTruthTable';
import { palette, connColor } from '@/config/palette';
import { SyntaxTreeView } from './SyntaxTreeView';

// ── Helpers ──────────────────────────────────────────────────────────────────

function colorizeFormula(text: string) {
  const parts = text.split(/(¬|∧|∨|→|↔)/);
  return parts.map((p, i) => {
    const c = connColor[p];
    return c
      ? <span key={i} style={{ color: c, fontWeight: 700 }}>{p}</span>
      : <span key={i}>{p}</span>;
  });
}

// ── Error card ───────────────────────────────────────────────────────────────

function ErrorCard({ error, formula }: { error: ParseError; formula: string }) {
  // Remove espaços: posição do erro refere-se apenas a tokens lógicos
  const f = formula.replace(/\s/g, '');
  const pos = error.position;
  const before = f.slice(0, pos);
  const at = f[pos] ?? '';
  const after = f.slice(pos + 1);

  // Ponteiro visual na fórmula
  const pointer = '·'.repeat(pos) + '▲';

  return (
    <div className="lf-err-card">
      {/* Cabeçalho com ícone de tipo de erro */}
      <div className="lf-err-header">
        <AlertTriangle size={14} />
        <span className="lf-err-kind">
          {error.kind === 'unclosed' ? 'Parêntese não fechado' :
           error.kind === 'unexpected' ? 'Token inesperado' : 'Erro de sintaxe'}
        </span>
      </div>

      {/* Visualização da fórmula com destaque no erro */}
      <div className="lf-err-formula-wrap">
        <code className="lf-err-formula">
          <span className="lf-err-formula-ok">{before}</span>
          <span className="lf-err-formula-bad">{at || '⌧'}</span>
          <span className="lf-err-formula-rest">{after}</span>
        </code>
        <code className="lf-err-pointer">{pointer}</code>
      </div>

      {/* Posição + o que foi encontrado vs esperado */}
      <div className="lf-err-detail">
        <div className="lf-err-detail-row">
          <MapPin size={12} />
          <span>{error.message}</span>
        </div>
      </div>

      {/* Explicação didática */}
      <div className="lf-err-explanation">
        <Lightbulb size={13} />
        <span>{error.explanation}</span>
      </div>
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

interface AnalysisPanelProps {
  isValid: boolean;
  ast?: Formula;
  errors: string[];
  formula: string;
  fontSize: number;
}

export function AnalysisPanel({ isValid, ast, errors, formula, fontSize }: AnalysisPanelProps) {
  // Tamanhos derivados do fontSize do editor
  const bigSize = Math.max(24, fontSize + 6);
  const chipSize = Math.max(11, Math.round(fontSize * 0.68));
  const parsedErrors = errors.length > 0 ? parseErrors(errors) : [];
  const { data: truthTable, loading: truthLoading, error: truthError } = useTruthTable(ast, true);

  const [page, setPage] = useState(0);
  const pageSize = 32;

  useEffect(() => {
    setPage(0);
  }, [truthTable?.generated_rows, formula]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((truthTable?.table.length ?? 0) / pageSize)),
    [truthTable?.table.length],
  );

  const pageRows = useMemo(() => {
    if (!truthTable) return [];
    const start = page * pageSize;
    return truthTable.table.slice(start, start + pageSize);
  }, [truthTable, page]);

  const canonicalFormula = ast ? formatFormula(ast) : formula;
  const rangeStart = truthTable ? page * pageSize + 1 : 0;
  const rangeEnd = truthTable ? Math.min((page + 1) * pageSize, truthTable.table.length) : 0;
  const resolutionColumns = (truthTable?.resolution_order?.length ?? 0) > 0
    ? (truthTable?.resolution_order ?? [])
    : [canonicalFormula];

  return (
    <div className="lf-panel">
      {/* ── Status ── */}
      {isValid ? (
        <div className="lf-status lf-status--ok">
          <CheckCircle2 size={15} />
          Fórmula Bem Formada (FBF)
        </div>
      ) : (
        parsedErrors.length > 0 && (
          <div className="lf-err-section">
            <div className="lf-err-section-head">
              <AlertCircle size={15} style={{ color: palette.err }} />
              <span>
                {parsedErrors.length === 1
                  ? 'Erro de sintaxe encontrado'
                  : `${parsedErrors.length} erros de sintaxe encontrados`}
              </span>
            </div>
            {parsedErrors.map((err, i) => (
              <ErrorCard key={i} error={err} formula={formula} />
            ))}
          </div>
        )
      )}

      {ast && (
        <div className="lf-cards">
          {/* Comprimento */}
          <div className="lf-card">
            <div className="lf-card-head">
              <span>Comprimento</span>
              <Calculator size={14} style={{ color: palette.or }} />
            </div>
            <div className="lf-card-big" style={{ fontSize: `${bigSize}px` }}>{calculateLength(ast)}</div>
          </div>

          {/* Subfórmulas */}
          <div className="lf-card">
            <div className="lf-card-head">
              <span>Subfórmulas</span>
              <ListTree size={14} style={{ color: palette.not }} />
            </div>
            <div className="lf-chips">
              {getSubformulas(ast)
                .sort((a, b) => a.length - b.length)
                .map((s, i) => (
                  <span key={i} className="lf-chip" style={{ fontSize: `${chipSize}px` }}>{colorizeFormula(s)}</span>
                ))}
            </div>
          </div>

          {/* Árvore de Sintaxe */}
          <div className="lf-card lf-card--tree">
            <div className="lf-card-head">
              <span>Árvore de Sintaxe</span>
              <GitBranch size={14} style={{ color: palette.iff }} />
            </div>
            <SyntaxTreeView ast={ast} />
          </div>

          {/* Tabela-Verdade */}
          <div className="lf-card lf-card--tree">
            <div className="lf-card-head">
              <span>Tabela-Verdade</span>
              <TableIcon size={14} style={{ color: palette.ok }} />
            </div>

            {truthLoading && <div className="lf-tt-status">Gerando interpretações...</div>}
            {!truthLoading && truthError && <div className="lf-tt-status lf-tt-status--err">{truthError}</div>}

            {!truthLoading && truthTable && (
              <div className="lf-tt-wrap" style={{ '--lf-tt-fs': `${chipSize}px` } as CSSProperties}>
                <div className="lf-tt-summary-head">
                  <code className="lf-tt-formula">{canonicalFormula}</code>
                  <div className="lf-tt-metrics">
                    <span className="lf-tt-pill">n = {truthTable.n}</span>
                    <span className="lf-tt-pill">Variáveis: {truthTable.variables.join(', ') || '—'}</span>
                    <span className="lf-tt-pill">2<sup>{truthTable.n}</sup> = {truthTable.total_interpretations}</span>
                  </div>
                </div>

                {truthTable.truncated && (
                  <div className="lf-tt-note">
                    Exibindo {truthTable.generated_rows} de {truthTable.total_interpretations} linhas para manter performance.
                  </div>
                )}

                <div className="lf-tt-scroll">
                  <table className="lf-tt-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        {truthTable.variables.map((variable) => (
                          <th key={variable}>{variable}</th>
                        ))}
                        {resolutionColumns.map((expression, idx) => {
                          const isFinal = idx === resolutionColumns.length - 1;
                          return (
                            <th key={expression} className={`lf-tt-expr-head ${isFinal ? 'lf-tt-result-col' : ''}`.trim()}>
                              {isFinal ? canonicalFormula : expression}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {pageRows.map((row, idx) => (
                        <tr key={`${page}-${idx}`}>
                          <td className="lf-tt-index">{page * pageSize + idx + 1}</td>
                          {truthTable.variables.map((variable) => (
                            <td key={variable}>
                              <span className={row.interpretation[variable] ? 'lf-badge lf-badge--true' : 'lf-badge lf-badge--false'}>
                                {row.interpretation[variable] ? 'V' : 'F'}
                              </span>
                            </td>
                          ))}
                          {resolutionColumns.map((expression, exprIdx) => {
                            const isFinal = exprIdx === resolutionColumns.length - 1;
                            const value = row.subformula_values?.[expression] ?? (isFinal ? row.result : false);
                            return (
                              <td key={expression} className={isFinal ? 'lf-tt-result-col' : undefined}>
                                <span className={value ? 'lf-badge lf-badge--true' : 'lf-badge lf-badge--false'}>
                                  {value ? 'V' : 'F'}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {truthTable.table.length > 0 && (
                  <div className="lf-tt-pagination">
                    <span className="lf-tt-page-info">Mostrando {rangeStart}–{rangeEnd} de {truthTable.table.length}</span>
                    <button
                      type="button"
                      className="lf-tt-page-btn"
                      disabled={page === 0}
                      onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                    >
                      Anterior
                    </button>
                    <span className="lf-tt-page-info">Página {page + 1} / {totalPages}</span>
                    <button
                      type="button"
                      className="lf-tt-page-btn"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
                    >
                      Próxima
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
