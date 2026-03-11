import { palette } from '@/config/palette';

const symbols = [
  { label: '¬', value: '¬', hint: 'Negação',       color: palette.not },
  { label: '∧', value: '∧', hint: 'Conjunção',     color: palette.and },
  { label: '∨', value: '∨', hint: 'Disjunção',     color: palette.or },
  { label: '→', value: '→', hint: 'Implicação',     color: palette.implies },
  { label: '↔', value: '↔', hint: 'Bicondicional',  color: palette.iff },
  { label: '(', value: '(', hint: 'Abre parêntese',  color: undefined },
  { label: ')', value: ')', hint: 'Fecha parêntese', color: undefined },
  { label: 'T', value: 'True',  hint: 'Verdadeiro',  color: palette.bool },
  { label: 'F', value: 'False', hint: 'Falso',        color: palette.bool },
];

interface LogicKeyboardProps {
  onInsert: (value: string) => void;
}

export function LogicKeyboard({ onInsert }: LogicKeyboardProps) {
  return (
    <div className="lf-keyboard">
      {symbols.map((sym) => (
        <button
          key={sym.value}
          onClick={() => onInsert(sym.value)}
          title={sym.hint}
          className="lf-key"
          style={sym.color ? { borderColor: `${sym.color}40`, color: sym.color } : undefined}
        >
          {sym.label}
        </button>
      ))}
    </div>
  );
}
