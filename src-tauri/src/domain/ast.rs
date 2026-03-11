use serde::{Deserialize, Serialize};

/// Representação da Árvore Sintática Abstrata (AST) de uma fórmula proposicional.
///
/// Cada variante corresponde a um tipo de nó na árvore:
/// - **TruthValue**: constantes lógicas (Verdadeiro / Falso)
/// - **Proposition**: variáveis proposicionais (P, Q, R, ...)
/// - **Not**: negação unária (¬, ~)
/// - **And / Or**: conjunção (∧, &) e disjunção (∨, |)
/// - **Implies / Iff**: implicação (→, ->) e bi-implicação (↔, <->)
///
/// A serialização usa tag adjacente (`"type"` + `"value"`) para compatibilidade
/// com o discriminated union do TypeScript no frontend.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type", content = "value")]
pub enum Formula {
    /// Valor-verdade: True ou False
    TruthValue(bool),
    /// Proposição atômica: P, Q, R, P1, etc.
    Proposition(String),
    /// Negação: ¬φ
    Not(Box<Formula>),
    /// Conjunção: φ ∧ ψ
    And(Box<Formula>, Box<Formula>),
    /// Disjunção: φ ∨ ψ
    Or(Box<Formula>, Box<Formula>),
    /// Implicação: φ → ψ
    Implies(Box<Formula>, Box<Formula>),
    /// Bi-implicação: φ ↔ ψ
    Iff(Box<Formula>, Box<Formula>),
}

/// Resultado de validação (usado internamente; o comando Tauri usa Result diretamente).
#[derive(Debug, Serialize, Deserialize)]
pub struct ValidationResult {
    pub is_valid: bool,
    pub ast: Option<Formula>,
    pub errors: Vec<String>,
}
