declare module 'react-katex' {
  import * as React from 'react';

  export interface MathComponentProps {
    math: string;
    errorColor?: string;
    renderError?: (error: Error) => React.ReactNode;
  }

  export const BlockMath: React.FC<MathComponentProps>;
  export const InlineMath: React.FC<MathComponentProps>;
}
