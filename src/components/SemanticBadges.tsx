import { useState, type ReactNode } from 'react';
import { Zap, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import type { SemanticAnalysis } from '@/domain/semanticAnalysis';
import {
  getSemanticDescription,
  getTruePercentage,
} from '@/domain/semanticAnalysis';

interface SemanticBadgesProps {
  analysis?: SemanticAnalysis;
  loading: boolean;
  error?: string;
}

interface BadgeButtonProps {
  label: string;
  icon: ReactNode;
  tone: 'tautology' | 'contradiction' | 'contingency' | 'satisfiable';
  onClick: () => void;
  tooltip?: string;
}

function BadgeButton({ label, icon, tone, onClick, tooltip }: BadgeButtonProps) {
  const toneClassMap = {
    tautology: 'lf-sem-badge--tautology',
    contradiction: 'lf-sem-badge--contradiction',
    contingency: 'lf-sem-badge--contingency',
    satisfiable: 'lf-sem-badge--satisfiable',
  } as const;

  return (
    <button
      onClick={onClick}
      className={`
        lf-sem-badge ${toneClassMap[tone]}
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
        font-medium text-sm transition-all duration-150
        cursor-help
      `}
      title={tooltip}
    >
      <span className="flex items-center justify-center w-4 h-4">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

interface ModalProps {
  title: string;
  tone: 'tautology' | 'contradiction' | 'contingency' | 'satisfiable';
  description: string;
  formalLatex?: string;
  citation: string;
  stats: {
    trueCount: number;
    falseCount: number;
    total: number;
    percentage: number;
  };
  onClose: () => void;
}

function SemanticModal({ title, tone, description, formalLatex, citation, stats, onClose }: ModalProps) {
  const modalToneClassMap = {
    tautology: 'lf-sem-modal--tautology',
    contradiction: 'lf-sem-modal--contradiction',
    contingency: 'lf-sem-modal--contingency',
    satisfiable: 'lf-sem-modal--satisfiable',
  } as const;

  return (
    <div className="lf-sem-overlay fixed inset-0 flex items-center justify-center p-4 z-50">
      <div
        className={`
          lf-sem-modal ${modalToneClassMap[tone]}
          rounded-lg max-w-2xl w-full p-6
        `}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="lf-sem-title text-2xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="lf-sem-close transition-colors p-1"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className="lf-sem-desc rounded-lg p-4 mb-4">
          <p className="lf-sem-desc-text leading-relaxed mb-3 whitespace-pre-line">{description}</p>
          {formalLatex && (
            <div className="lf-sem-desc-text rounded-md border px-3 py-2 mb-3 overflow-x-auto">
              <p className="text-xs uppercase tracking-wide opacity-80 mb-2">Forma formal</p>
              <BlockMath math={formalLatex} />
            </div>
          )}
          <p className="lf-sem-citation text-sm italic">{citation}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="lf-sem-stat lf-sem-stat--true rounded-lg p-4">
            <p className="font-semibold flex items-center gap-2">
              <CheckCircle2 size={18} />
              Linhas Verdadeiras
            </p>
            <p className="text-2xl font-bold mt-2">{stats.trueCount}</p>
            <p className="text-sm mt-1">{stats.percentage.toFixed(1)}% do total</p>
          </div>

          <div className="lf-sem-stat lf-sem-stat--false rounded-lg p-4">
            <p className="font-semibold flex items-center gap-2">
              <AlertCircle size={18} />
              Linhas Falsas
            </p>
            <p className="text-2xl font-bold mt-2">{stats.falseCount}</p>
            <p className="text-sm mt-1">{(100 - stats.percentage).toFixed(1)}% do total</p>
          </div>
        </div>

        <div className="lf-sem-total rounded-lg p-4 mb-4">
          <p className="font-medium">Total de Interpretações</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>

        <button
          onClick={onClose}
          className="lf-sem-ack w-full py-2 px-4 rounded-lg font-semibold transition-all duration-150"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}

interface InfoCard {
  title: string;
  tone: 'tautology' | 'contradiction' | 'contingency' | 'satisfiable';
  description: string;
  formalLatex?: string;
  citation: string;
}

export function SemanticBadges({ analysis, loading, error }: SemanticBadgesProps) {
  const [activeInfo, setActiveInfo] = useState<InfoCard | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-3">
        <div className="animate-spin">
          <Zap size={16} className="text-gray-400" />
        </div>
        <span className="text-sm text-gray-500">Analisando formulação semântica...</span>
      </div>
    );
  }

  if (error || !analysis) {
    return null;
  }

  const primary = getSemanticDescription(analysis);
  const percentage = getTruePercentage(analysis);

  const satisfiableInfo: InfoCard = {
    title: 'Satisfatível',
    tone: 'satisfiable',
    description:
      'Uma fórmula H é satisfatível quando existe pelo menos uma interpretação em que ela assume valor verdadeiro. Em linguagem de tabela-verdade, basta que a coluna final tenha ao menos uma linha com valor T. Assim, a satisfatibilidade expressa possibilidade lógica de verdade, mesmo que a fórmula não seja verdadeira em todos os casos.',
    formalLatex: '\\exists I,\\ I[H] = T',
    citation: '— Souza, J.N. (2002); Silva, F.S.C.; Finger, M.; Melo, A.C.V. (2006); Barwise, J.; Etchemendy, J. (2000); Dalen, D. (1994).',
  };

  const badges: BadgeButtonProps[] = [];

  if (analysis.is_tautology) {
    badges.push({
      label: 'Tautologia',
      icon: <CheckCircle2 size={16} />,
      tone: 'tautology',
      onClick: () => setActiveInfo({
        title: primary.label,
        tone: 'tautology',
        description: primary.description,
        formalLatex: primary.formalLatex,
        citation: primary.citation,
      }),
      tooltip: 'Tautologia: ∀I, I[H] = T. Clique para ver a explicação completa.',
    });
    badges.push({
      label: 'Satisfatível',
      icon: <CheckCircle2 size={16} />,
      tone: 'satisfiable',
      onClick: () => setActiveInfo(satisfiableInfo),
      tooltip: 'Satisfatível: ∃I, I[H] = T. Toda tautologia é satisfatível.',
    });
  } else if (analysis.is_contradiction) {
    badges.push({
      label: 'Contradição',
      icon: <AlertCircle size={16} />,
      tone: 'contradiction',
      onClick: () => setActiveInfo({
        title: primary.label,
        tone: 'contradiction',
        description: primary.description,
        formalLatex: primary.formalLatex,
        citation: primary.citation,
      }),
      tooltip: 'Contradição: ∀I, I[H] = F. Clique para ver a explicação completa.',
    });
  } else if (analysis.is_contingency) {
    badges.push({
      label: 'Contingência',
      icon: <HelpCircle size={16} />,
      tone: 'contingency',
      onClick: () => setActiveInfo({
        title: primary.label,
        tone: 'contingency',
        description: primary.description,
        formalLatex: primary.formalLatex,
        citation: primary.citation,
      }),
      tooltip: 'Contingência: ∃I1, I2 | I1[H] = T e I2[H] = F. Clique para ver a explicação completa.',
    });
    badges.push({
      label: 'Satisfatível',
      icon: <CheckCircle2 size={16} />,
      tone: 'satisfiable',
      onClick: () => setActiveInfo(satisfiableInfo),
      tooltip: 'Satisfatível: ∃I, I[H] = T. Possui pelo menos uma interpretação verdadeira.',
    });
  }

  return (
    <>
      <div className="flex w-full flex-wrap justify-center gap-2 py-3">
        {badges.map((badge, idx) => (
          <BadgeButton key={idx} {...badge} />
        ))}
      </div>

      {activeInfo && (
        <SemanticModal
          title={activeInfo.title}
          tone={activeInfo.tone}
          description={activeInfo.description}
          formalLatex={activeInfo.formalLatex}
          citation={activeInfo.citation}
          stats={{
            trueCount: analysis.true_count,
            falseCount: analysis.false_count,
            total: analysis.total_interpretations,
            percentage,
          }}
          onClose={() => setActiveInfo(null)}
        />
      )}
    </>
  );
}
