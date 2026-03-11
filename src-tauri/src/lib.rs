pub mod domain;
pub mod infrastructure;

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

/// Ponto de entrada da aplicação Tauri.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![validate_formula])
        .run(tauri::generate_context!())
        .expect("erro ao iniciar a aplicação tauri");
}
