use std::collections::{BTreeMap, BTreeSet};

use serde::{Deserialize, Serialize};

use crate::domain::ast::Formula;

/// Uma linha da tabela-verdade.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TruthTableRow {
    pub interpretation: BTreeMap<String, bool>,
    pub result: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub subformula_values: Option<BTreeMap<String, bool>>,
}

/// Estrutura completa enviada ao frontend.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TruthTableData {
    pub variables: Vec<String>,
    pub n: usize,
    pub total_interpretations: usize,
    pub generated_rows: usize,
    pub truncated: bool,
    pub resolution_order: Vec<String>,
    pub table: Vec<TruthTableRow>,
}

/// Coleta variáveis proposicionais únicas em ordem alfabética.
fn collect_variables(ast: &Formula, acc: &mut BTreeSet<String>) {
    match ast {
        Formula::TruthValue(_) => {},
        Formula::Proposition(name) => {
            acc.insert(name.clone());
        },
        Formula::Not(inner) => collect_variables(inner, acc),
        Formula::And(lhs, rhs)
        | Formula::Or(lhs, rhs)
        | Formula::Implies(lhs, rhs)
        | Formula::Iff(lhs, rhs) => {
            collect_variables(lhs, acc);
            collect_variables(rhs, acc);
        },
    }
}

/// Formata uma subfórmula em notação legível para uso no frontend.
fn format_formula(ast: &Formula) -> String {
    match ast {
        Formula::TruthValue(v) => {
            if *v { "True".into() } else { "False".into() }
        },
        Formula::Proposition(name) => name.clone(),
        Formula::Not(inner) => format!("¬{}", format_formula(inner)),
        Formula::And(lhs, rhs) => format!("({} ∧ {})", format_formula(lhs), format_formula(rhs)),
        Formula::Or(lhs, rhs) => format!("({} ∨ {})", format_formula(lhs), format_formula(rhs)),
        Formula::Implies(lhs, rhs) => format!("({} → {})", format_formula(lhs), format_formula(rhs)),
        Formula::Iff(lhs, rhs) => format!("({} ↔ {})", format_formula(lhs), format_formula(rhs)),
    }
}

/// Coleta a ordem de resolução da árvore (pós-ordem), sem duplicatas.
/// Ex.: ((P ∨ Q) → R) => ["(P ∨ Q)", "((P ∨ Q) → R)"]
fn collect_resolution_order(ast: &Formula, order: &mut Vec<String>, seen: &mut BTreeSet<String>) {
    match ast {
        Formula::TruthValue(_) | Formula::Proposition(_) => {},
        Formula::Not(inner) => {
            collect_resolution_order(inner, order, seen);
            let expr = format_formula(ast);
            if seen.insert(expr.clone()) {
                order.push(expr);
            }
        },
        Formula::And(lhs, rhs)
        | Formula::Or(lhs, rhs)
        | Formula::Implies(lhs, rhs)
        | Formula::Iff(lhs, rhs) => {
            collect_resolution_order(lhs, order, seen);
            collect_resolution_order(rhs, order, seen);
            let expr = format_formula(ast);
            if seen.insert(expr.clone()) {
                order.push(expr);
            }
        },
    }
}

/// Avalia a AST para uma interpretação dada (sem coletar subfórmulas).
fn evaluate_plain(ast: &Formula, interpretation: &BTreeMap<String, bool>) -> bool {
    match ast {
        Formula::TruthValue(v) => *v,
        Formula::Proposition(name) => *interpretation.get(name).unwrap_or(&false),
        Formula::Not(inner) => !evaluate_plain(inner, interpretation),
        Formula::And(lhs, rhs) => evaluate_plain(lhs, interpretation) && evaluate_plain(rhs, interpretation),
        Formula::Or(lhs, rhs) => evaluate_plain(lhs, interpretation) || evaluate_plain(rhs, interpretation),
        Formula::Implies(lhs, rhs) => !evaluate_plain(lhs, interpretation) || evaluate_plain(rhs, interpretation),
        Formula::Iff(lhs, rhs) => evaluate_plain(lhs, interpretation) == evaluate_plain(rhs, interpretation),
    }
}

/// Avalia a AST e coleta valores de todas as subfórmulas.
fn evaluate_with_subs(
    ast: &Formula,
    interpretation: &BTreeMap<String, bool>,
    sub_values: &mut BTreeMap<String, bool>,
) -> bool {
    let value = match ast {
        Formula::TruthValue(v) => *v,
        Formula::Proposition(name) => *interpretation.get(name).unwrap_or(&false),
        Formula::Not(inner) => !evaluate_with_subs(inner, interpretation, sub_values),
        Formula::And(lhs, rhs) => {
            evaluate_with_subs(lhs, interpretation, sub_values)
                && evaluate_with_subs(rhs, interpretation, sub_values)
        },
        Formula::Or(lhs, rhs) => {
            evaluate_with_subs(lhs, interpretation, sub_values)
                || evaluate_with_subs(rhs, interpretation, sub_values)
        },
        Formula::Implies(lhs, rhs) => {
            !evaluate_with_subs(lhs, interpretation, sub_values)
                || evaluate_with_subs(rhs, interpretation, sub_values)
        },
        Formula::Iff(lhs, rhs) => {
            evaluate_with_subs(lhs, interpretation, sub_values)
                == evaluate_with_subs(rhs, interpretation, sub_values)
        },
    };

    sub_values.insert(format_formula(ast), value);
    value
}

/// Gera a tabela-verdade com limitação de linhas para evitar sobrecarga no frontend.
pub fn generate_truth_table(ast: &Formula, include_subformulas: bool, max_rows: usize) -> TruthTableData {
    let mut vars_set = BTreeSet::new();
    collect_variables(ast, &mut vars_set);

    let variables: Vec<String> = vars_set.into_iter().collect();
    let n = variables.len();

    let mut resolution_order = Vec::new();
    let mut seen_expr = BTreeSet::new();
    collect_resolution_order(ast, &mut resolution_order, &mut seen_expr);

    // Evita overflow para n muito grande.
    let total_interpretations = if n >= usize::BITS as usize {
        usize::MAX
    } else {
        1usize << n
    };

    let limit = max_rows.max(1);
    let to_generate = total_interpretations.min(limit);

    let mut table = Vec::with_capacity(to_generate);

    for i in 0..to_generate {
        let mut interpretation = BTreeMap::new();

        // Inverte o índice para que a primeira linha tenha todos os valores Verdadeiro
        // e a última tenha todos Falso — convenção acadêmica padrão.
        let bits = total_interpretations.saturating_sub(1 + i);
        for (idx, var) in variables.iter().enumerate() {
            let bit_index = n.saturating_sub(1 + idx);
            let value = ((bits >> bit_index) & 1) == 1;
            interpretation.insert(var.clone(), value);
        }

        let mut sub_values_map = include_subformulas.then(BTreeMap::new);
        let result = if let Some(map) = sub_values_map.as_mut() {
            evaluate_with_subs(ast, &interpretation, map)
        } else {
            evaluate_plain(ast, &interpretation)
        };

        table.push(TruthTableRow {
            interpretation,
            result,
            subformula_values: sub_values_map,
        });
    }

    TruthTableData {
        variables,
        n,
        total_interpretations,
        generated_rows: table.len(),
        truncated: table.len() < total_interpretations,
        resolution_order,
        table,
    }
}

