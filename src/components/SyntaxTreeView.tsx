import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Formula } from '@/domain/types';
import { labelOf } from '@/domain/formula';
import { typeColor } from '@/config/palette';

// ── Layout engine ────────────────────────────────────────────────────────────

const NODE_W = 54;
const NODE_H = 30;
const H_GAP  = 16;
const V_GAP  = 52;

interface TreeNode {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
  depth: number;
  children: TreeNode[];
}

let _id = 0;

function buildTree(f: Formula, depth: number): TreeNode {
  const id = String(_id++);
  const node: TreeNode = {
    id,
    label: labelOf(f),
    type: f.type,
    x: 0,
    y: depth * (NODE_H + V_GAP),
    depth,
    children: [],
  };

  if (f.type === 'Not') {
    node.children = [buildTree(f.value, depth + 1)];
  } else if (f.type !== 'TruthValue' && f.type !== 'Proposition') {
    node.children = [buildTree(f.value[0], depth + 1), buildTree(f.value[1], depth + 1)];
  }
  return node;
}

function measureWidth(node: TreeNode): number {
  if (node.children.length === 0) return NODE_W + H_GAP;
  return node.children.reduce((sum, c) => sum + measureWidth(c), 0);
}

function assignPositions(node: TreeNode, left: number): void {
  if (node.children.length === 0) {
    node.x = left + (NODE_W + H_GAP) / 2;
    return;
  }

  let cx = left;
  node.children.forEach((child) => {
    const w = measureWidth(child);
    assignPositions(child, cx);
    cx += w;
  });

  // Center parent over children
  const firstChild = node.children[0];
  const lastChild = node.children[node.children.length - 1];
  node.x = (firstChild.x + lastChild.x) / 2;
}

interface FlatNode {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
  depth: number;
}

interface FlatEdge {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  depth: number;
}

function flatten(root: TreeNode) {
  const nodes: FlatNode[] = [];
  const edges: FlatEdge[] = [];

  function walk(n: TreeNode) {
    nodes.push({ id: n.id, label: n.label, type: n.type, x: n.x, y: n.y, depth: n.depth });
    n.children.forEach((child) => {
      edges.push({
        id: `e-${n.id}-${child.id}`,
        x1: n.x,
        y1: n.y + NODE_H / 2,
        x2: child.x,
        y2: child.y - NODE_H / 2,
        depth: child.depth,
      });
      walk(child);
    });
  }

  walk(root);
  return { nodes, edges };
}

// ── Motion variants ──────────────────────────────────────────────────────────

const nodeVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (depth: number) => ({
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 22,
      delay: depth * 0.12,
    },
  }),
  exit: { scale: 0, opacity: 0, transition: { duration: 0.15 } },
};

const edgeVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (depth: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { type: 'spring' as const, stiffness: 200, damping: 30, delay: depth * 0.12 + 0.06 },
      opacity: { duration: 0.15, delay: depth * 0.12 },
    },
  }),
  exit: { pathLength: 0, opacity: 0, transition: { duration: 0.12 } },
};

const glowVariants = {
  hidden: { opacity: 0 },
  visible: (depth: number) => ({
    opacity: 0.45,
    transition: { delay: depth * 0.12 + 0.08, duration: 0.3 },
  }),
};

// ── Component ────────────────────────────────────────────────────────────────

export function SyntaxTreeView({ ast }: { ast: Formula }) {
  const { nodes, edges, width, height } = useMemo(() => {
    _id = 0;
    const root = buildTree(ast, 0);
    const totalW = measureWidth(root);
    assignPositions(root, 0);
    const { nodes, edges } = flatten(root);

    // Bounds
    let maxY = 0;
    nodes.forEach((n) => {
      if (n.y + NODE_H > maxY) maxY = n.y + NODE_H;
    });

    const pad = 24;
    return {
      nodes,
      edges,
      width: Math.max(totalW + pad * 2, 180),
      height: maxY + pad * 2,
    };
  }, [ast]);

  const pad = 24;

  return (
    <svg
      width="100%"
      viewBox={`${-pad} ${-pad} ${width} ${height}`}
      style={{ maxHeight: 260, display: 'block' }}
    >
      {/* Glow filter */}
      <defs>
        <filter id="lf-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <AnimatePresence mode="wait">
        <motion.g key={JSON.stringify(ast)}>
          {/* Edges */}
          {edges.map((e) => {
            const color = '#334155';
            const midY = (e.y1 + e.y2) / 2;
            const d = `M ${e.x1} ${e.y1} C ${e.x1} ${midY}, ${e.x2} ${midY}, ${e.x2} ${e.y2}`;
            return (
              <motion.path
                key={e.id}
                d={d}
                stroke={color}
                strokeWidth={1.8}
                fill="none"
                strokeLinecap="round"
                variants={edgeVariants}
                custom={e.depth}
                initial="hidden"
                animate="visible"
                exit="exit"
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((n) => {
            const color = typeColor[n.type] ?? '#94a3b8';
            const isOperator = n.type !== 'TruthValue' && n.type !== 'Proposition';
            return (
              <motion.g
                key={n.id}
                variants={nodeVariants}
                custom={n.depth}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {/* Glow behind operator nodes */}
                {isOperator && (
                  <motion.rect
                    x={n.x - NODE_W / 2 - 4}
                    y={n.y - NODE_H / 2 - 4}
                    width={NODE_W + 8}
                    height={NODE_H + 8}
                    rx={12}
                    fill={color}
                    filter="url(#lf-glow)"
                    variants={glowVariants}
                    custom={n.depth}
                    initial="hidden"
                    animate="visible"
                  />
                )}

                {/* Node bg */}
                <rect
                  x={n.x - NODE_W / 2}
                  y={n.y - NODE_H / 2}
                  width={NODE_W}
                  height={NODE_H}
                  rx={8}
                  fill={isOperator ? `${color}18` : '#0f172a'}
                  stroke={color}
                  strokeWidth={2}
                />

                {/* Label */}
                <text
                  x={n.x}
                  y={n.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={color}
                  fontSize={15}
                  fontWeight={700}
                  fontFamily="'JetBrains Mono', monospace"
                >
                  {n.label}
                </text>
              </motion.g>
            );
          })}
        </motion.g>
      </AnimatePresence>
    </svg>
  );
}
