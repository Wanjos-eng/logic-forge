import { ViewPlugin, DecorationSet, Decoration, ViewUpdate, EditorView } from '@codemirror/view';
import { RangeSetBuilder, Extension } from '@codemirror/state';
import { palette } from '@/config/palette';

// ── Token → CSS class ────────────────────────────────────────────────────────

const CONNECTIVE_RE = /¬|∧|∨|→|↔|True|False/g;

function tokenClass(token: string): string {
  if (token === '¬')                         return 'cm-lf-not';
  if (token === '∧')                         return 'cm-lf-and';
  if (token === '∨')                         return 'cm-lf-or';
  if (token === '→')                         return 'cm-lf-implies';
  if (token === '↔')                         return 'cm-lf-iff';
  if (token === 'True' || token === 'False') return 'cm-lf-bool';
  return '';
}

// ── Decoration plugin ────────────────────────────────────────────────────────

function buildDecorations(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  for (const { from, to } of view.visibleRanges) {
    const text = view.state.sliceDoc(from, to);
    let match: RegExpExecArray | null;
    CONNECTIVE_RE.lastIndex = 0;
    while ((match = CONNECTIVE_RE.exec(text)) !== null) {
      const cls = tokenClass(match[0]);
      if (!cls) continue;
      const start = from + match.index;
      builder.add(start, start + match[0].length, Decoration.mark({ class: cls }));
    }
  }
  return builder.finish();
}

const highlightPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) { this.decorations = buildDecorations(view); }
    update(u: ViewUpdate) {
      if (u.docChanged || u.viewportChanged) this.decorations = buildDecorations(u.view);
    }
  },
  { decorations: (v) => v.decorations },
);

// ── Theme (dentro do CM → especificidade correta) ────────────────────────────

const highlightTheme = EditorView.baseTheme({
  '.cm-lf-not':     { color: palette.not,     fontWeight: 'bold' },
  '.cm-lf-and':     { color: palette.and,     fontWeight: 'bold' },
  '.cm-lf-or':      { color: palette.or,      fontWeight: 'bold' },
  '.cm-lf-implies': { color: palette.implies, fontWeight: 'bold' },
  '.cm-lf-iff':     { color: palette.iff,     fontWeight: 'bold' },
  '.cm-lf-bool':    { color: palette.bool,    fontStyle: 'italic' },
});

// ── Single-line: bloqueia Enter e filtra newlines em paste ───────────────────

const singleLineKeys = EditorView.domEventHandlers({
  keydown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      return true;
    }
    return false;
  },
  paste(event, view) {
    const text = event.clipboardData?.getData('text/plain');
    if (text && /[\n\r]/.test(text)) {
      event.preventDefault();
      const clean = text.replace(/[\n\r]+/g, ' ').trim();
      const { from, to } = view.state.selection.main;
      view.dispatch({
        changes: { from, to, insert: clean },
        selection: { anchor: from + clean.length },
      });
      return true;
    }
    return false;
  },
});

// ── Export ────────────────────────────────────────────────────────────────────

export const logicHighlight: Extension = [highlightTheme, highlightPlugin, singleLineKeys];
