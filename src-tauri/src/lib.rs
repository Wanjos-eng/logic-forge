pub mod domain;
pub mod infrastructure;

use crate::domain::ast::Formula;
use crate::domain::semantic_analysis::SemanticAnalysis;
use crate::domain::truth_table::generate_truth_table;
use crate::infrastructure::parser::parse_input;

/// Comando Tauri que valida uma fórmula proposicional.
/// Retorna Ok(JSON da AST) se a fórmula for bem formada,
/// ou Err(Vec<String>) com os erros estruturados de sintaxe.
#[tauri::command]
fn validate_formula(input: String) -> Result<String, Vec<String>> {
    match parse_input(&input) {
        Ok(ast) => {
            // Converte a AST (Árvore Sintática Abstrata) para JSON para o frontend React
            let json_ast = serde_json::to_string(&ast).map_err(|e| vec![e.to_string()])?;
            Ok(json_ast)
        },
        Err(erros) => {
            // Retorna os erros de sintaxe encontrados
            Err(erros)
        }
    }
}

/// Comando Tauri que gera a tabela-verdade a partir de uma AST em JSON.
///
/// `include_subformulas`: inclui (ou não) o valor de cada subfórmula por linha.
/// `max_rows`: limite de linhas geradas para proteger o frontend.
#[tauri::command]
fn generate_truth_table_command(
    ast_json: String,
    include_subformulas: Option<bool>,
    max_rows: Option<usize>,
) -> Result<String, String> {
    let ast: Formula = serde_json::from_str(&ast_json)
        .map_err(|e| format!("AST inválida: {}", e))?;

    let include_subs = include_subformulas.unwrap_or(false);
    let rows_limit = max_rows.unwrap_or(4096).clamp(1, 16384);

    let table = generate_truth_table(&ast, include_subs, rows_limit);
    serde_json::to_string(&table).map_err(|e| e.to_string())
}

/// Comando Tauri que realiza análise semântica baseada na tabela-verdade.
/// Recebe uma lista de booleanos (resultados de cada linha) e retorna as propriedades semânticas.
#[tauri::command]
fn analyze_semantic_command(results: Vec<bool>) -> Result<String, String> {
    let analysis = SemanticAnalysis::from_results(&results);
    serde_json::to_string(&analysis).map_err(|e| e.to_string())
}

/// Ponto de entrada da aplicação Tauri.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            validate_formula,
            generate_truth_table_command,
            analyze_semantic_command
        ])
        .run(tauri::generate_context!())
        .expect("erro ao iniciar a aplicação tauri");
}
