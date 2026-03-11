/**
 * Erro de sintaxe estruturado, parseado a partir do formato do backend Rust.
 *
 * O backend envia cada erro como string no formato:
 *   "posição|tipo|encontrado|esperados|explicação|mensagem"
 */
export interface ParseError {
  /** Posição (índice) na string onde o erro ocorreu */
  position: number;
  /** Tipo do erro: unexpected, unclosed, custom */
  kind: 'unexpected' | 'unclosed' | 'custom';
  /** Descrição do token encontrado (em português) */
  found: string;
  /** Descrição dos tokens esperados (em português) */
  expected: string;
  /** Explicação didática do erro */
  explanation: string;
  /** Mensagem legível completa */
  message: string;
  /** String bruta original (fallback) */
  raw: string;
}

/**
 * Parseia uma string de erro estruturada vinda do backend Rust.
 * Formato: "pos|tipo|encontrado|esperados|explicação|mensagem"
 */
export function parseError(raw: string): ParseError {
  const parts = raw.split('|');

  // Se o formato não bater, retorna um erro genérico
  if (parts.length < 6) {
    return {
      position: 0,
      kind: 'custom',
      found: '',
      expected: '',
      explanation: raw,
      message: raw,
      raw,
    };
  }

  const [posStr, kind, found, expected, explanation, ...messageParts] = parts;

  return {
    position: parseInt(posStr, 10) || 0,
    kind: (kind as ParseError['kind']) || 'custom',
    found,
    expected,
    explanation,
    message: messageParts.join('|'), // a mensagem pode conter '|'
    raw,
  };
}

/**
 * Parseia um array de strings de erro brutas em ParseError[].
 */
export function parseErrors(raws: string[]): ParseError[] {
  return raws.map(parseError);
}
