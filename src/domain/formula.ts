import type { Formula } from './types';

// ── Type guards ──────────────────────────────────────────────────────────────

export function isLeaf(
  f: Formula,
): f is { type: 'TruthValue'; value: boolean } | { type: 'Proposition'; value: string } {
  return f.type === 'TruthValue' || f.type === 'Proposition';
}

export function isUnary(f: Formula): f is { type: 'Not'; value: Formula } {
  return f.type === 'Not';
}

export function isBinary(
  f: Formula,
): f is { type: 'And' | 'Or' | 'Implies' | 'Iff'; value: [Formula, Formula] } {
  return !isLeaf(f) && !isUnary(f);
}

// ── Pure functions ───────────────────────────────────────────────────────────

export function calculateLength(f: Formula): number {
  if (isLeaf(f)) return 1;
  if (isUnary(f)) return 1 + calculateLength(f.value);
  return 1 + calculateLength(f.value[0]) + calculateLength(f.value[1]);
}

export function formatFormula(f: Formula): string {
  switch (f.type) {
    case 'TruthValue':  return f.value ? 'True' : 'False';
    case 'Proposition': return f.value;
    case 'Not':         return `¬${formatFormula(f.value)}`;
    case 'And':         return `(${formatFormula(f.value[0])} ∧ ${formatFormula(f.value[1])})`;
    case 'Or':          return `(${formatFormula(f.value[0])} ∨ ${formatFormula(f.value[1])})`;
    case 'Implies':     return `(${formatFormula(f.value[0])} → ${formatFormula(f.value[1])})`;
    case 'Iff':         return `(${formatFormula(f.value[0])} ↔ ${formatFormula(f.value[1])})`;
  }
}

export function getSubformulas(f: Formula): string[] {
  const cur = formatFormula(f);
  if (isLeaf(f)) return [cur];
  const subs = isUnary(f)
    ? getSubformulas(f.value)
    : [...getSubformulas(f.value[0]), ...getSubformulas(f.value[1])];
  return Array.from(new Set([...subs, cur]));
}

export function labelOf(f: Formula): string {
  switch (f.type) {
    case 'TruthValue':  return f.value ? 'T' : 'F';
    case 'Proposition': return String(f.value);
    case 'Not':         return '¬';
    case 'And':         return '∧';
    case 'Or':          return '∨';
    case 'Implies':     return '→';
    case 'Iff':         return '↔';
  }
}
