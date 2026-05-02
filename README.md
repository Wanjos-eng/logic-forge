<!-- PROJECT_METADATA
{
  "title": "Logic Forge",
  "short_description": "Aplicativo desktop para análise de lógica proposicional: valida fórmulas em tempo real, gera tabelas-verdade e classifica tautologias e contradições.",
  "primary_stack": ["Rust", "React", "TypeScript", "Tauri"],
  "architecture": "Desktop App",
  "detail_description": "Logic Forge é uma ferramenta desktop construída com Tauri (Rust) e React/TypeScript. O núcleo de parsing e avaliação lógica foi implementado do zero em Rust para máxima performance, enquanto o frontend React entrega feedback visual imediato sobre a validade sintática, árvores de sintaxe, tabelas-verdade completas e classificação de fórmulas (tautologia, contradição, contingência ou satisfazível). O app é distribuído como binário nativo de ~4MB sem necessidade de runtime externo.",
  "images": ["IMG/print1.png", "IMG/print2.png"],
  "cover_image": "IMG/print1.png",
  "release_url": "https://github.com/Wanjos-eng/logic-forge/releases/tag/v0.1.0"
}
-->

# Logic Forge

Aplicativo desktop para construção, validação e análise de fórmulas da lógica proposicional — construído com Tauri (Rust) + React.

## O que ele faz

- **Validação em tempo real** — feedback imediato sobre a validade sintática da fórmula
- **Árvore de Sintaxe** — visualização da estrutura da fórmula parsed
- **Tabela-Verdade completa** — gerada automaticamente para qualquer fórmula
- **Classificação automática** — tautologia, contradição, contingência ou satisfazível

## Stack Técnica

| Camada | Tecnologia |
|--------|-----------|
| Backend / Core Lógico | Rust (parser e evaluator customizados) |
| Frontend | React + TypeScript |
| Bridge Desktop | Tauri v2 |
| Build | Vite |

## Arquitetura

O parser e o evaluador de lógica proposicional foram implementados do zero em Rust, expondo uma API para o frontend via comandos Tauri. Isso garante:
- Parsing eficiente e sem dependências externas
- Binário nativo pequeno (~4MB)
- Multiplataforma: Linux, Windows, macOS

## Como Executar

### Pré-requisitos
- Rust + Cargo
- Node.js 18+
- Tauri CLI: `cargo install tauri-cli`

### Desenvolvimento
```bash
npm install
cargo tauri dev
```

### Build
```bash
cargo tauri build
```

## Download

Baixe o binário mais recente na [página de releases](https://github.com/Wanjos-eng/logic-forge/releases/tag/v0.1.0).

## Screenshots

![Logic Forge — Interface principal](./IMG/print1.png)
![Logic Forge — Tabela-verdade](./IMG/print2.png)