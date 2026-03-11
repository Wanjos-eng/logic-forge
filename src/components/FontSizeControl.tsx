import { Minus, Plus, Type } from 'lucide-react';
import { palette } from '@/config/palette';

interface FontSizeControlProps {
  fontSize: number;
  canIncrease: boolean;
  canDecrease: boolean;
  onIncrease: () => void;
  onDecrease: () => void;
}

export function FontSizeControl({
  fontSize,
  canIncrease,
  canDecrease,
  onIncrease,
  onDecrease,
}: FontSizeControlProps) {
  return (
    <div className="lf-fontsize-ctrl">
      <Type size={13} style={{ color: palette.muted }} />
      <button
        className="lf-fontsize-btn"
        onClick={onDecrease}
        disabled={!canDecrease}
        title="Diminuir fonte"
      >
        <Minus size={12} />
      </button>
      <span className="lf-fontsize-value">{fontSize}px</span>
      <button
        className="lf-fontsize-btn"
        onClick={onIncrease}
        disabled={!canIncrease}
        title="Aumentar fonte"
      >
        <Plus size={12} />
      </button>
    </div>
  );
}
