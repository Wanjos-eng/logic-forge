import {
  CheckCircle2, AlertCircle, Calculator, ListTree, GitBranch,
  AlertTriangle, MapPin, Lightbulb,
} from 'lucide-react';
import type { Formula } from '@/domain/types';
import { calculateLength, getSubformulas } from '@/domain/formula';
import { parseErrors, type ParseError } from '@/domain/errors';
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
        </div>
      )}
    </div>
  );
}
