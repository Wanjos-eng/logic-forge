use chumsky::prelude::*;
use crate::domain::ast::Formula;

/// Constrói o parser de fórmulas proposicionais usando Chumsky.
///
/// Precedência (da mais alta para a mais baixa):
///   1. Átomos: valores-verdade (True/False), proposições (P, Q, ...), parênteses
///   2. Negação: ¬φ  ou  ~φ
///   3. Implicação/Bi-implicação: φ → ψ, φ ↔ ψ
///   4. Conjunção/Disjunção: φ ∧ ψ, φ ∨ ψ
pub fn formula_parser() -> impl Parser<char, Formula, Error = Simple<char>> {
    recursive(|fbf| {
        // ── 1. Átomos ────────────────────────────────────────────────────
        // Valores-verdade literais
        let valor_verdade = text::keyword("True").to(Formula::TruthValue(true))
            .or(text::keyword("False").to(Formula::TruthValue(false)));

        // Proposições atômicas: devem começar com letra MAIÚSCULA (P, Q, R1, ...)
        // Letras minúsculas não são proposições válidas na lógica proposicional.
        let proposicao = filter(|c: &char| c.is_uppercase())
            .chain(filter(|c: &char| c.is_alphanumeric()).repeated())
            .collect::<String>()
            .map(Formula::Proposition);

        // Um átomo pode ser valor-verdade, proposição ou subfórmula entre parênteses
        let atomo = valor_verdade
            .or(proposicao)
            .or(fbf.clone().padded().delimited_by(just('('), just(')')))
            .padded();

        // ── 2. Negação (maior precedência) ──────────────────────────────
        // Suporta ¬ (unicode) e ~ (ASCII)
        let negacao = just('¬').or(just('~'))
            .padded()
            .repeated()
            .then(atomo)
            .foldr(|_, rhs| Formula::Not(Box::new(rhs)));

        // ── 3. Implicação e Bi-implicação (precedência intermediária) ───
        // → ou ->  para implicação
        // ↔ ou <-> para bi-implicação
        let implicacao = negacao.clone()
            .then(
                just('→')
                    .or(just('-').then_ignore(just('>')).to('→'))
                    .to(Formula::Implies as fn(_, _) -> _)
                .or(
                    just('↔')
                        .or(just('<').then_ignore(just('-')).then_ignore(just('>')).to('↔'))
                        .to(Formula::Iff as fn(_, _) -> _)
                )
                .then(negacao.padded())
                .repeated()
            )
            .foldl(|lhs, (op, rhs)| op(Box::new(lhs), Box::new(rhs)));

        // ── 4. Conjunção e Disjunção (menor precedência) ────────────────
        // ∧ ou & para conjunção
        // ∨ ou | para disjunção
        let conjuncao_disjuncao = implicacao.clone()
            .then(
                just('∧').or(just('&')).to(Formula::And as fn(_, _) -> _)
                .or(just('∨').or(just('|')).to(Formula::Or as fn(_, _) -> _))
                .then(implicacao.padded())
                .repeated()
            )
            .foldl(|lhs, (op, rhs)| op(Box::new(lhs), Box::new(rhs)));

        conjuncao_disjuncao
    })
    .then_ignore(end()) // garante que toda a entrada é consumida
}

/// Traduz um token `Option<char>` do Chumsky para texto legível em português.
fn descrever_token(token: Option<&char>) -> String {
    match token {
        Some('(') => "'(' (abre parêntese)".into(),
        Some(')') => "')' (fecha parêntese)".into(),
        Some('¬') | Some('~') => "operador de negação (¬)".into(),
        Some('∧') | Some('&') => "operador de conjunção (∧)".into(),
        Some('∨') | Some('|') => "operador de disjunção (∨)".into(),
        Some('→') => "operador de implicação (→)".into(),
        Some('↔') => "operador de bi-implicação (↔)".into(),
        Some('-') => "'-' (início de ->)".into(),
        Some('<') => "'<' (início de <->)".into(),
        Some(c) if c.is_lowercase() => format!("letra minúscula '{}'", c),
        Some(c) if c.is_alphabetic() => format!("caractere '{}'", c),
        Some(c) => format!("'{}'", c),
        None => "fim da fórmula".into(),
    }
}

/// Verifica se a lista de tokens esperados representa "início de subfórmula".
/// O Chumsky lista ¬ e ( como tokens literais, mas `text::ident()` (proposições)
/// não é enumerado individualmente — por isso inferimos que proposições também
/// são esperadas sempre que ¬ ou ( apareçam no conjunto.
fn espera_subformula(esperados: &[Option<char>]) -> bool {
    esperados.iter().any(|t| matches!(t, Some('¬') | Some('~') | Some('(')))
}

/// Traduz a lista de tokens esperados do Chumsky para texto legível em português.
fn descrever_esperados(esperados: &[Option<char>]) -> String {
    if esperados.is_empty() {
        return String::new();
    }

    let mut descricoes: std::collections::HashSet<String> = esperados.iter()
        .filter_map(|tok| match tok {
            Some('(') => None, // absorvido em "proposição ou subfórmula"
            Some(')') => Some("')'".into()),
            Some('¬') | Some('~') => None, // absorvido em "proposição ou subfórmula"
            Some('∧') | Some('&') => Some("conjunção (∧)".into()),
            Some('∨') | Some('|') => Some("disjunção (∨)".into()),
            Some('→') => Some("implicação (→)".into()),
            Some('↔') => Some("bi-implicação (↔)".into()),
            Some(c) if c.is_alphabetic() => None, // absorvido
            Some(c) => Some(format!("'{}'", c)),
            None => None,
        })
        .collect();

    // Se a gramática espera início de subfórmula, diga isso de forma clara
    if espera_subformula(esperados) {
        descricoes.insert("uma proposição (P, Q, …) ou subfórmula".into());
    }

    if descricoes.is_empty() {
        return String::new();
    }

    let mut lista: Vec<String> = descricoes.into_iter().collect();
    lista.sort(); // ordem determinística

    match lista.len() {
        1 => lista[0].clone(),
        2 => format!("{} ou {}", lista[0], lista[1]),
        _ => {
            let (ultimo, resto) = lista.split_last().unwrap();
            format!("{} ou {}", resto.join(", "), ultimo)
        }
    }
}

/// Gera uma explicação didática do erro baseada no tipo e contexto.
fn explicar_erro(tipo: &str, encontrado: Option<&char>, pos: usize) -> String {
    match tipo {
        "unclosed" => "Há um parêntese '(' aberto que nunca foi fechado com ')'. \
                       Verifique se todos os parênteses estão balanceados.".into(),
        "unexpected" => {
            match encontrado {
                // Operador no início ou dois operadores seguidos
                Some('∧') | Some('∨') | Some('→') | Some('↔') | Some('&') | Some('|') => {
                    if pos == 0 {
                        "A fórmula não pode iniciar com um operador binário. \
                         Coloque uma proposição (ex: P) ou negação (¬) antes.".into()
                    } else {
                        "Dois operadores seguidos sem uma proposição entre eles. \
                         Insira uma proposição (ex: P, Q) entre os operadores.".into()
                    }
                },
                // Parêntese fechando inesperadamente
                Some(')') => "Parêntese ')' inesperado. Verifique se há um '(' correspondente \
                              ou se não está faltando uma proposição.".into(),
                // Fim da entrada quando se esperava mais
                None => "A fórmula está incompleta. Após um operador binário (→, ∧, ∨, ↔) \
                         deve vir uma proposição (ex: Q, R) ou subfórmula entre parênteses.".into(),
                // Letra minúscula usada como proposição
                Some(c) if c.is_lowercase() => {
                    format!("Letras minúsculas não são proposições válidas. \
                             Use maiúsculas: '{}' deve ser '{}'.",
                        c, c.to_uppercase().next().unwrap_or(*c))
                },
                // Caractere não reconhecido
                Some(c) if !c.is_alphanumeric() && !"¬~∧∨→↔&|()<>-".contains(*c) => {
                    format!("O caractere '{}' não é reconhecido na lógica proposicional. \
                            Use proposições (P, Q), conectivos (¬ ∧ ∨ → ↔) ou parênteses.", c)
                },
                _ => "Elemento inesperado nesta posição. Revise a estrutura da fórmula.".into(),
            }
        },
        _ => "Erro de sintaxe na fórmula. Verifique se segue as regras da lógica proposicional.".into(),
    }
}

/// Analisa a entrada e retorna a AST da fórmula ou uma lista de erros estruturados.
///
/// Os espaços em branco são removidos antes do parsing: posições de erro
/// sempre referenciam tokens lógicos reais, nunca espaços vazios.
///
/// Cada erro é serializado no formato:
///   `posição|tipo|encontrado|esperados|explicação|mensagem_legível`
///
/// Isso permite que o frontend faça o parse e exiba os erros de forma rica.
pub fn parse_input(input: &str) -> Result<Formula, Vec<String>> {
    // Remove espaços: posições de erro ficam alinhadas com os tokens
    let entrada: String = input.chars().filter(|c| !c.is_whitespace()).collect();

    formula_parser()
        .parse(entrada.as_str())
        .map_err(|erros| {
            erros.into_iter()
                .map(|e| {
                    let pos = e.span().start;
                    let encontrado = e.found().copied();
                    let encontrado_texto = descrever_token(encontrado.as_ref());

                    // Coleta os tokens esperados
                    let esperados: Vec<Option<char>> = e.expected().cloned().collect();
                    let esperados_texto = descrever_esperados(&esperados);

                    // Classifica o tipo de erro
                    let tipo = match e.reason() {
                        chumsky::error::SimpleReason::Unexpected => "unexpected",
                        chumsky::error::SimpleReason::Unclosed { .. } => "unclosed",
                        chumsky::error::SimpleReason::Custom(_) => "custom",
                    };

                    // Gera explicação didática
                    let explicacao = explicar_erro(tipo, encontrado.as_ref(), pos);

                    // Monta a mensagem legível
                    let mensagem = if esperados_texto.is_empty() {
                        format!("Posição {}: encontrado {}", pos, encontrado_texto)
                    } else {
                        format!("Posição {}: encontrado {}, esperava-se {}",
                            pos, encontrado_texto, esperados_texto)
                    };

                    // Formato estruturado: "pos|tipo|encontrado|esperados|explicação|mensagem"
                    format!("{}|{}|{}|{}|{}|{}",
                        pos,
                        tipo,
                        encontrado_texto,
                        esperados_texto,
                        explicacao,
                        mensagem,
                    )
                })
                .collect()
        })
}

