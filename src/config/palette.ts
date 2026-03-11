/**
 * Paleta harmônica de cores — fonte única de verdade.
 * Espectro frio (purple → indigo → blue → cyan → teal) + contraste quente (amber).
 */
export const palette = {
  not:     '#c084fc', // purple-400
  and:     '#818cf8', // indigo-400
  or:      '#60a5fa', // blue-400
  implies: '#22d3ee', // cyan-400
  iff:     '#2dd4bf', // teal-400
  bool:    '#fbbf24', // amber-400

  // UI
  ok:      '#2dd4bf', // teal-400
  err:     '#fb7185', // rose-400
  surface: '#0f172a', // slate-900
  raised:  '#1e293b', // slate-800
  border:  '#1e293b',
  muted:   '#64748b', // slate-500
  text:    '#e2e8f0', // slate-200
  bg:      '#020617', // slate-950
} as const;

/** Mapeamento tipo AST → cor da paleta */
export const typeColor: Record<string, string> = {
  Not:         palette.not,
  And:         palette.and,
  Or:          palette.or,
  Implies:     palette.implies,
  Iff:         palette.iff,
  Proposition: '#cbd5e1',
  TruthValue:  palette.bool,
};

/** Mapeamento conectivo → cor da paleta */
export const connColor: Record<string, string> = {
  '¬': palette.not,
  '∧': palette.and,
  '∨': palette.or,
  '→': palette.implies,
  '↔': palette.iff,
};
