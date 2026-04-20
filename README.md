# Logic Forge

Logic Forge é um aplicativo desktop Tauri + React para edição, análise semântica e visualização de fórmulas lógicas.

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
- Linux: `.AppImage`

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

## IDE recomendada

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
