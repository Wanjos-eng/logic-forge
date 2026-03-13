use logic_forge_lib::domain::ast::Formula;
use logic_forge_lib::domain::truth_table::generate_truth_table;

/// Verifica extração de variáveis únicas em ordem alfabética
/// e que a ordem de resolução segue a pós-ordem da árvore.
#[test]
fn deve_extrair_variaveis_ordenadas() {
    // Q ∧ (P ∨ Q)
    let ast = Formula::And(
        Box::new(Formula::Proposition("Q".into())),
        Box::new(Formula::Or(
            Box::new(Formula::Proposition("P".into())),
            Box::new(Formula::Proposition("Q".into())),
        )),
    );

    let tt = generate_truth_table(&ast, false, 32);
    assert_eq!(tt.variables, vec!["P", "Q"]);
    assert_eq!(tt.n, 2);
    assert_eq!(tt.total_interpretations, 4);
    assert_eq!(tt.resolution_order, vec!["(P ∨ Q)", "(Q ∧ (P ∨ Q))"]);
}

/// Verifica avaliação correta da implicação (P → Q)
/// e que a ordem de resolução contém apenas a fórmula raiz.
#[test]
fn deve_avaliar_implicacao_corretamente() {
    let ast = Formula::Implies(
        Box::new(Formula::Proposition("P".into())),
        Box::new(Formula::Proposition("Q".into())),
    );

    let tt = generate_truth_table(&ast, false, 8);
    assert_eq!(tt.table.len(), 4);
    assert_eq!(tt.resolution_order, vec!["(P → Q)"]);

    // Tabela-verdade de P → Q com ordem V primeiro:
    // P=V, Q=V → V  |  P=V, Q=F → F  |  P=F, Q=V → V  |  P=F, Q=F → V
    let results: Vec<bool> = tt.table.into_iter().map(|r| r.result).collect();
    assert_eq!(results, vec![true, false, true, true]);
}
