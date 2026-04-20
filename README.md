# Logic Forge

Logic Forge é um aplicativo desktop Tauri + React para construir, validar e analisar fórmulas da lógica proposicional.

## O que ele faz

- Edita fórmulas em uma interface com atalhos e teclado simbólico para inserir conectivos como `¬`, `∧`, `∨`, `→` e `↔`.
- Valida a fórmula em tempo real e destaca erros de sintaxe com mensagem, posição e explicação.
- Exibe a árvore sintática da expressão para mostrar a estrutura lógica.
- Gera tabela-verdade com paginação para fórmulas maiores.
- Calcula análise semântica, identificando tautologia, contradição, contingência e satisfatibilidade.
- Permite ajustar o tamanho da fonte para leitura e revisão mais confortável.

## Como funciona

O frontend fica em React e o backend Tauri em Rust faz a validação da fórmula, a geração da tabela-verdade e a análise semântica. A interface mostra o resultado dessas etapas em blocos separados para facilitar revisão e ensino.

## Instalação

### Windows

Baixe o instalador `.exe` publicado em GitHub Releases e execute-o normalmente. O pacote usa NSIS com instalação em escopo de usuário, seletor de idioma e WebView2 baixado pelo instalador quando necessário.

### Linux

Baixe o arquivo `.AppImage` publicado em GitHub Releases, marque como executável e abra-o:

```bash
chmod +x Logic-Forge-*.AppImage
./Logic-Forge-*.AppImage
```

## Releases

As versões são publicadas automaticamente no GitHub quando uma tag `vX.Y.Z` é enviada para o repositório.

Artefatos gerados:

- Windows: instalador NSIS `.exe`
- Linux: aplicativo portátil `.AppImage`

No GitHub Releases, a instalação fica assim:

- Windows: baixe o `.exe` e execute o instalador.
- Linux: baixe o `.AppImage`, rode `chmod +x` e execute o arquivo.

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build local

```bash
npm run build
npm run tauri build
```

## Estrutura

- Frontend: Vite + React + TypeScript
- Desktop: Tauri v2
- Bundling: NSIS para Windows e AppImage para Linux

## Build e release

Para gerar os artefatos localmente:

```bash
npm run build
npm run tauri build -- --bundles nsis,appimage
```

Na publicação oficial, o GitHub Actions cria a release automaticamente quando uma tag `vX.Y.Z` é enviada.

## IDE recomendada

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
