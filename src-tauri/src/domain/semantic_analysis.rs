use serde::Serialize;

/// Estrutura que contém a análise semântica de uma fórmula proposicional.
/// Baseada em propriedades extraídas da tabela-verdade.
#[derive(Debug, Clone, Serialize)]
pub struct SemanticAnalysis {
    /// Verdadeiro se a fórmula é uma tautologia (100% das linhas são verdadeiras)
    pub is_tautology: bool,

    /// Verdadeiro se a fórmula é uma contradição (100% das linhas são falsas)
    pub is_contradiction: bool,

    /// Verdadeiro se a fórmula é contingente (mistura de verdadeiras e falsas)
    pub is_contingency: bool,

    /// Verdadeiro se a fórmula é satisfatível (tem pelo menos uma linha verdadeira)
    pub is_satisfiable: bool,

    /// Número de linhas verdadeiras (para exibição na UI)
    pub true_count: usize,

    /// Número de linhas falsas (para exibição na UI)
    pub false_count: usize,

    /// Total de interpretações (para cálculo de porcentagem)
    pub total_interpretations: usize,
}

impl SemanticAnalysis {
    /// Analisa uma lista de resultados booleanos da tabela-verdade.
    /// Retorna um SemanticAnalysis completamente preenchido.
    pub fn from_results(resultados: &[bool]) -> Self {
        let total_interpretations = resultados.len();

        // Conta quantas linhas deram Verdadeiro
        let true_count = resultados.iter().filter(|&&r| r).count();
        let false_count = total_interpretations.saturating_sub(true_count);

        // Determinações lógicas baseadas nas contagens
        let is_tautology = true_count == total_interpretations && total_interpretations > 0;
        let is_contradiction = true_count == 0 && total_interpretations > 0;
        let is_contingency = true_count > 0 && true_count < total_interpretations;
        let is_satisfiable = true_count > 0;

        Self {
            is_tautology,
            is_contradiction,
            is_contingency,
            is_satisfiable,
            true_count,
            false_count,
            total_interpretations,
        }
    }

    /// Retorna a descrição do tipo semântico principal (para exibição na UI).
    pub fn semantic_type(&self) -> SemanticType {
        if self.is_tautology {
            SemanticType::Tautology
        } else if self.is_contradiction {
            SemanticType::Contradiction
        } else if self.is_contingency {
            SemanticType::Contingency
        } else {
            // Fórmula vazia ou inválida (sem interpretações)
            SemanticType::Unsupported
        }
    }

    /// Calcula a porcentagem de linhas verdadeiras.
    pub fn true_percentage(&self) -> f32 {
        if self.total_interpretations == 0 {
            0.0
        } else {
            (self.true_count as f32) / (self.total_interpretations as f32) * 100.0
        }
    }
}

/// Enum para descrever o tipo semântico de uma fórmula.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum SemanticType {
    Tautology,
    Contradiction,
    Contingency,
    Unsupported,
}
