use logic_forge_lib::infrastructure::parser::parse_input;

/// Testa fórmulas válidas simples usadas em exemplos acadêmicos.
#[test]
fn deve_aceitar_formulas_simples_do_pdf() {
    assert!(parse_input("P -> Q").is_ok());
    assert!(parse_input("~(P -> Q)").is_ok());
    assert!(parse_input("P ∧ Q").is_ok());
}

/// Testa fórmulas com subfórmulas aninhadas e múltiplos conectivos.
#[test]
fn deve_aceitar_subformulas_complexas() {
    let formula_complexa = "(((P ∨ S) ∧ Q) ↔ R)";
    assert!(parse_input(formula_complexa).is_ok());
}

/// Testa que sintaxes inválidas são corretamente rejeitadas.
#[test]
fn deve_rejeitar_sintaxe_invalida() {
    // Dois operadores de implicação seguidos sem proposição no meio
    assert!(parse_input("P -> -> Q").is_err());

    // Faltando fechar parênteses
    assert!(parse_input("(P ∧ Q").is_err());

    // Operador solto sem operandos
    assert!(parse_input("∨ Q").is_err());
}

/// Proposições com letra minúscula devem ser rejeitadas.
#[test]
fn deve_rejeitar_proposicao_minuscula() {
    assert!(parse_input("p").is_err());
    assert!(parse_input("p → Q").is_err());
    assert!(parse_input("P ∧ q").is_err());
}
