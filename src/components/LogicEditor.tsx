import { useState, useRef, useMemo } from 'react';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import { LogicKeyboard } from './LogicKeyboard';
import { AnalysisPanel } from './AnalysisPanel';
import { FontSizeControl } from './FontSizeControl';
import { logicHighlight } from '@/infrastructure/logicHighlight';
import { useValidation } from '@/hooks/useValidation';
import { useFontSize } from '@/hooks/useFontSize';

export default function LogicEditor() {
  const [input, setInput] = useState('P → Q');
  const validation = useValidation(input);
  const { fontSize, increase, decrease, canIncrease, canDecrease } = useFontSize();
  const editorRef = useRef<ReactCodeMirrorRef>(null);

  // Dynamic font-size theme for CodeMirror
  const fontTheme = useMemo(
    () =>
      EditorView.theme({
        '.cm-content': {
          fontSize: `${fontSize}px`,
          lineHeight: '1.6',
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        },
      }),
    [fontSize],
  );

  const insertSymbol = (symbol: string) => {
    const view = editorRef.current?.view;
    if (view) {
      const { from, to } = view.state.selection.main;
      view.dispatch({
        changes: { from, to, insert: symbol },
        selection: { anchor: from + symbol.length },
      });
      view.focus();
    }
  };

  const editorHeight = Math.max(38, fontSize * 2.2);

  return (
    <div className="lf-root">
      {/* ── Header ── */}
      <header className="lf-header">
        <h1 className="lf-title">LogicForge</h1>
        <div className="lf-header-right">
          <FontSizeControl
            fontSize={fontSize}
            canIncrease={canIncrease}
            canDecrease={canDecrease}
            onIncrease={increase}
            onDecrease={decrease}
          />
          <span className="lf-version">v0.1.0</span>
        </div>
      </header>

      {/* ── Input section ── */}
      <section className="lf-input-section">
        <label className="lf-input-label">Fórmula</label>
        <div className="lf-editor-wrap">
          <CodeMirror
            ref={editorRef}
            value={input}
            height={`${editorHeight}px`}
            theme="dark"
            extensions={[logicHighlight, fontTheme]}
            onChange={(value) => setInput(value)}
            className="lf-editor"
            basicSetup={{
              lineNumbers: false,
              foldGutter: false,
              dropCursor: true,
              allowMultipleSelections: false,
              indentOnInput: false,
              highlightActiveLine: false,
            }}
          />
        </div>
        <LogicKeyboard onInsert={insertSymbol} />
      </section>

      {/* ── Analysis ── */}
      <section className="lf-analysis">
        <AnalysisPanel
            fontSize={fontSize}
          isValid={validation.is_valid}
          ast={validation.ast}
          errors={validation.errors}
          formula={input}
        />
      </section>
    </div>
  );
}
