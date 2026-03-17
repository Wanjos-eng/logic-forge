/**
 * Tipos e interfaces para análise semântica de fórmulas proposicionais.
 * Baseado em propriedades extraídas da tabela-verdade.
 */

export type SemanticType = 'tautology' | 'contradiction' | 'contingency' | 'unsupported';

export interface SemanticAnalysis {
  /** Verdadeiro se a fórmula é uma tautologia (100% das linhas são verdadeiras) */
  is_tautology: boolean;

  /** Verdadeiro se a fórmula é uma contradição (100% das linhas são falsas) */
  is_contradiction: boolean;

  /** Verdadeiro se a fórmula é contingente (mistura de verdadeiras e falsas) */
  is_contingency: boolean;

  /** Verdadeiro se a fórmula é satisfatível (tem pelo menos uma linha verdadeira) */
  is_satisfiable: boolean;

  /** Número de linhas verdadeiras (para exibição na UI) */
  true_count: number;

  /** Número de linhas falsas (para exibição na UI) */
  false_count: number;

  /** Total de interpretações (para cálculo de porcentagem) */
  total_interpretations: number;
}

/**
 * Definição de descrição semântica com citação acadêmica.
 */
export interface SemanticDescription {
  type: SemanticType;
  label: string;
  description: string;
  formalLatex?: string;
  citation: string;
}

/**
 * Mapa de descrições semânticas com base acadêmica.
 * Baseado na bibliografia da disciplina:
 * - SOUZA, J.N. Lógica para Ciência da Computação.
 * - BARWISE, J.; ETCHEMENDY, J. Language, Proof and Logic.
 * - SILVA, F.S.C.; FINGER, M.; MELO, A.C.V. Lógica para Computação.
 * - DALEN, D. Logic and Structure.
 */
export const SEMANTIC_DESCRIPTIONS: Record<SemanticType, SemanticDescription> = {
  tautology: {
    type: 'tautology',
    label: 'Tautologia',
    description:
      'Uma fórmula H é classificada como tautologia quando ela resulta verdadeira em todas as possíveis interpretações das proposições atômicas que a compõem. Em termos de tabela-verdade, isso significa que a coluna final da fórmula contém apenas valores verdadeiros, sem nenhuma exceção. Por isso, dizemos que sua verdade é lógica (válida pela forma), e não dependente de um caso particular.',
    formalLatex: '\\forall I,\\ I[H] = T',
    citation: '— Souza, J.N. (2002); Silva, F.S.C.; Finger, M.; Melo, A.C.V. (2006); Dalen, D. (1994).',
  },
  contradiction: {
    type: 'contradiction',
    label: 'Contradição',
    description:
      'Uma fórmula H é uma contradição quando ela resulta falsa em todas as interpretações possíveis. Na tabela-verdade, a coluna final apresenta somente valores falsos, indicando que não existe nenhuma valoração que torne a fórmula verdadeira. Por esse motivo, a contradição também é chamada de fórmula insatisfatível.',
    formalLatex: '\\forall I,\\ I[H] = F',
    citation: '— Souza, J.N. (2002); Silva, F.S.C.; Finger, M.; Melo, A.C.V. (2006); Barwise, J.; Etchemendy, J. (2000).',
  },
  contingency: {
    type: 'contingency',
    label: 'Contingência',
    description:
      'Uma fórmula H é contingente quando seu valor de verdade depende da interpretação adotada: em algumas valorações ela é verdadeira, e em outras é falsa. Em consequência, ela não é tautologia (pois nem sempre é verdadeira) e também não é contradição (pois nem sempre é falsa). Esse é o caso mais comum em fórmulas proposicionais não triviais.',
    formalLatex: '\\exists I_1, I_2\\mid I_1[H] = T \\land I_2[H] = F',
    citation: '— Souza, J.N. (2002); Silva, F.S.C.; Finger, M.; Melo, A.C.V. (2006); Barwise, J.; Etchemendy, J. (2000).',
  },
  unsupported: {
    type: 'unsupported',
    label: 'Análise indisponível',
    description: 'Não foi possível realizar a análise semântica.',
    citation: '',
  },
};

/**
 * Obtém a descrição semântica baseada na análise.
 */
export function getSemanticDescription(analysis: SemanticAnalysis): SemanticDescription {
  if (analysis.is_tautology) {
    return SEMANTIC_DESCRIPTIONS.tautology;
  } else if (analysis.is_contradiction) {
    return SEMANTIC_DESCRIPTIONS.contradiction;
  } else if (analysis.is_contingency) {
    return SEMANTIC_DESCRIPTIONS.contingency;
  } else {
    return SEMANTIC_DESCRIPTIONS.unsupported;
  }
}

/**
 * Calcula a porcentagem de linhas verdadeiras.
 */
export function getTruePercentage(analysis: SemanticAnalysis): number {
  if (analysis.total_interpretations === 0) {
    return 0;
  }
  return (analysis.true_count / analysis.total_interpretations) * 100;
}
