/**
 * Espelha o enum Rust `Formula` com serde(tag = "type", content = "value")
 *
 * Binários (And, Or, Implies, Iff):  { "type": "And", "value": [<lhs>, <rhs>] }
 * Unário (Not):                       { "type": "Not", "value": <inner> }
 * Folhas (TruthValue, Proposition):   { "type": "Proposition", "value": "P" }
 */
export type Formula =
  | { type: 'TruthValue'; value: boolean }
  | { type: 'Proposition'; value: string }
  | { type: 'Not'; value: Formula }
  | { type: 'And'; value: [Formula, Formula] }
  | { type: 'Or'; value: [Formula, Formula] }
  | { type: 'Implies'; value: [Formula, Formula] }
  | { type: 'Iff'; value: [Formula, Formula] };

export interface ValidationResult {
  is_valid: boolean;
  ast?: Formula;
  errors: string[];
}

export interface TruthTableRow {
  interpretation: Record<string, boolean>;
  result: boolean;
  subformula_values?: Record<string, boolean>;
}

export interface TruthTableData {
  variables: string[];
  n: number;
  total_interpretations: number;
  generated_rows: number;
  truncated: boolean;
  resolution_order: string[];
  table: TruthTableRow[];
}
